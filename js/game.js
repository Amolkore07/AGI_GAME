/* ============================================
   MAIN GAME ENGINE - OPTIMIZED
   Fixed: firing, performance, door interaction
   ============================================ */

class Game {
    constructor() {
        this.state = 'loading';
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();

        // Player state
        this.player = {
            health: 100,
            maxHealth: 100,
            shield: 100,
            maxShield: 100,
            position: new THREE.Vector3(0, 3, 0),
            velocity: new THREE.Vector3(),
            speed: 0.25,
            sprintSpeed: 0.45,
            jumpForce: 0.3,
            gravity: 0.012,
            onGround: true,
            height: 3,
            radius: 1.5
        };

        // Camera control
        this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
        this.mouseSensitivity = 0.002;
        this.pitchLimit = Math.PI / 2 - 0.05;

        // Input
        this.keys = {};
        this.mouseDown = false;
        this.pointerLocked = false;

        // Game state
        this.score = 0;
        this.kills = 0;
        this.wave = 1;
        this.gameTime = 0;
        this.waveComplete = false;
        this.flashlightOn = false;

        // Systems
        this.weaponSystem = null;
        this.robotManager = null;
        this.worldGenerator = null;
        this.flashlight = null;

        // Vehicle system
        this.vehicleManager = null;
        this.isDriving = false;
        this.currentVehicle = null;

        // Creature system
        this.creatureManager = null;

        // TARS companion
        this.tarsRobot = null;

        // Head bob
        this.headBobTimer = 0;
        this.headBobAmount = 0;
        this.footstepTimer = 0;

        // Interaction prompt
        this.nearDoor = false;
        this.nearVehicle = false;

        this.init();
    }

    async init() {
        await this.showLoadingScreen();
        this.setupRenderer();
        this.setupScene();
        this.setupCamera();
        this.setupInput();
        this.setupUI();

        // Generate world
        this.worldGenerator = new WorldGenerator(this.scene);
        this.worldGenerator.generate();

        // Initialize weapon system
        this.weaponSystem = new WeaponSystem();

        // Initialize robot manager
        this.robotManager = new RobotManager(this.scene);

        // Create weapon viewmodel
        this.createWeaponViewModel();

        // Flashlight
        this.flashlight = new THREE.SpotLight(0xffeedd, 0, 40, Math.PI / 6, 0.3, 2);
        this.flashlight.position.set(0, 0, 0);
        this.camera.add(this.flashlight);
        this.camera.add(this.flashlight.target);
        this.flashlight.target.position.set(0, 0, -1);

        // Create interaction prompt
        this.createInteractionPrompt();

        // Initialize vehicle system
        this.vehicleManager = new VehicleManager(this.scene);
        this.vehicleManager.spawnVehicles();

        // Initialize creature manager
        this.creatureManager = new CreatureManager(this.scene);
        for (const building of this.worldGenerator.enterableBuildings) {
            this.creatureManager.spawnInBuilding(building.position);
        }

        // Initialize TARS companion
        this.tarsRobot = new TarsRobot(this.scene);

        this.state = 'menu';
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('start-menu').style.display = 'block';

        this.animate();
    }

    showLoadingScreen() {
        return new Promise(resolve => {
            const bar = document.getElementById('loader-bar');
            const percent = document.getElementById('loader-percent');
            let progress = 0;

            const interval = setInterval(() => {
                progress += Math.random() * 20 + 8;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    setTimeout(resolve, 400);
                }
                bar.style.width = progress + '%';
                percent.textContent = Math.floor(progress) + '%';
            }, 150);
        });
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: false,          // DISABLED for performance
            powerPreference: 'high-performance',
            stencil: false,
            depth: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        // Cap pixel ratio at 1 for performance on high-DPI displays
        this.renderer.setPixelRatio(1);
        // NO shadow maps - massive performance improvement
        this.renderer.shadowMap.enabled = false;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.9;
        document.body.appendChild(this.renderer.domElement);

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    setupScene() {
        this.scene = new THREE.Scene();
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            70, window.innerWidth / window.innerHeight, 0.5, 400
        );
        this.camera.position.copy(this.player.position);
        this.scene.add(this.camera);
    }

    setupInput() {
        // Keyboard
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;

            if (this.state === 'playing') {
                // Weapon switching
                if (e.code >= 'Digit1' && e.code <= 'Digit5') {
                    const slot = parseInt(e.code.replace('Digit', ''));
                    this.weaponSystem.switchWeapon(slot);
                }

                // Reload
                if (e.code === 'KeyR') {
                    this.weaponSystem.reload();
                }

                // Flashlight
                if (e.code === 'KeyF') {
                    this.flashlightOn = !this.flashlightOn;
                    this.flashlight.intensity = this.flashlightOn ? 3 : 0;
                }

                // Interact (open doors)
                if (e.code === 'KeyE') {
                    this.worldGenerator.interactDoor(this.player.position);
                }

                // Enter/exit vehicle
                if (e.code === 'KeyG') {
                    this.toggleVehicle();
                }

                // Day / Night Toggle
                if (e.code === 'KeyO') {
                    if (this.worldGenerator) this.worldGenerator.toggleDayNight();
                }

                // Summon/dismiss TARS
                if (e.code === 'KeyT') {
                    if (this.tarsRobot) {
                        this.tarsRobot.summon(this.player.position);
                    }
                }

                // Pause
                if (e.code === 'Escape') {
                    this.pauseGame();
                }
            } else if (this.state === 'paused') {
                if (e.code === 'Escape') {
                    this.resumeGame();
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // ====== FIXED FIRING ======
        // Use document-level mousedown for firing (works with pointer lock)
        document.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                this.mouseDown = true;

                // Request pointer lock if not locked
                if (this.state === 'playing' && !this.pointerLocked) {
                    this.renderer.domElement.requestPointerLock();
                    return; // Don't fire on the lock-acquiring click
                }

                // Fire weapon
                if (this.state === 'playing' && this.pointerLocked) {
                    this.weaponSystem.fire(this.camera, this.scene);
                }
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (e.button === 0) this.mouseDown = false;
        });

        document.addEventListener('mousemove', (e) => {
            if (this.state !== 'playing' || !this.pointerLocked) return;

            const movementX = e.movementX || 0;
            const movementY = e.movementY || 0;

            this.euler.setFromQuaternion(this.camera.quaternion);
            this.euler.y -= movementX * this.mouseSensitivity;
            this.euler.x -= movementY * this.mouseSensitivity;
            this.euler.x = Math.max(-this.pitchLimit, Math.min(this.pitchLimit, this.euler.x));
            this.camera.quaternion.setFromEuler(this.euler);
        });

        // Pointer lock changes
        document.addEventListener('pointerlockchange', () => {
            this.pointerLocked = document.pointerLockElement === this.renderer.domElement;
        });

        // Also handle clicking the canvas directly
        this.renderer.domElement.addEventListener('click', () => {
            if (this.state === 'playing' && !this.pointerLocked) {
                this.renderer.domElement.requestPointerLock();
            }
        });

        // Prevent context menu
        document.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    createInteractionPrompt() {
        const prompt = document.createElement('div');
        prompt.id = 'interact-prompt';
        prompt.innerHTML = '<span class="key" style="font-family:Share Tech Mono;padding:4px 10px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:3px;color:#00f0ff;margin-right:8px;">E</span> Open Door';
        prompt.style.cssText = `
            position:fixed;bottom:50%;left:50%;transform:translate(-50%,80px);
            font-family:'Rajdhani',sans-serif;font-size:0.9rem;color:#ccc;
            padding:8px 18px;background:rgba(0,0,0,0.6);border:1px solid rgba(255,255,255,0.1);
            border-radius:6px;display:none;z-index:101;pointer-events:none;
            backdrop-filter:blur(4px);letter-spacing:1px;
        `;
        document.body.appendChild(prompt);
        this.interactPrompt = prompt;
    }

    setupUI() {
        document.getElementById('btn-start').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('btn-controls').addEventListener('click', () => {
            document.getElementById('controls-modal').style.display = 'flex';
        });

        document.getElementById('btn-weapons').addEventListener('click', () => {
            document.getElementById('weapons-modal').style.display = 'flex';
        });

        document.getElementById('btn-resume').addEventListener('click', () => {
            this.resumeGame();
        });

        document.getElementById('btn-quit').addEventListener('click', () => {
            this.quitToMenu();
        });

        document.getElementById('btn-retry').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('btn-menu').addEventListener('click', () => {
            this.quitToMenu();
        });
    }

    createWeaponViewModel() {
        this.weaponModel = new THREE.Group();

        const gunMat = new THREE.MeshLambertMaterial({ color: 0x333344 });

        // Gun body
        const gunBody = new THREE.BoxGeometry(0.15, 0.15, 0.8);
        this.weaponModel.add(new THREE.Mesh(gunBody, gunMat));

        // Barrel
        const barrel = new THREE.CylinderGeometry(0.04, 0.06, 0.5, 6);
        const barrelMesh = new THREE.Mesh(barrel, gunMat);
        barrelMesh.rotation.x = Math.PI / 2;
        barrelMesh.position.z = -0.6;
        this.weaponModel.add(barrelMesh);

        // Handle
        const handle = new THREE.BoxGeometry(0.1, 0.25, 0.12);
        const handleMesh = new THREE.Mesh(handle, gunMat.clone());
        handleMesh.position.set(0, -0.15, 0.15);
        handleMesh.rotation.x = 0.3;
        this.weaponModel.add(handleMesh);

        // Muzzle glow
        this.muzzleGlow = new THREE.PointLight(0x00ff88, 0, 3);
        this.muzzleGlow.position.z = -0.9;
        this.weaponModel.add(this.muzzleGlow);

        this.weaponModel.position.set(0.35, -0.3, -0.6);
        this.camera.add(this.weaponModel);
    }

    startGame() {
        // Reset state
        this.player.health = 100;
        this.player.shield = 100;
        this.player.position.set(0, 3, 0);
        this.player.velocity.set(0, 0, 0);
        this.score = 0;
        this.kills = 0;
        this.wave = 1;
        this.gameTime = 0;
        this.waveComplete = false;

        // Reset camera
        this.camera.position.copy(this.player.position);
        this.euler.set(0, 0, 0);
        this.camera.quaternion.setFromEuler(this.euler);

        // Reset weapons
        this.weaponSystem = new WeaponSystem();
        this.weaponSystem.updateHUD();

        // Clear and restart robots
        this.robotManager.clearAll();
        this.robotManager.startWave(this.wave);

        // Reset vehicle state
        if (this.isDriving && this.currentVehicle) {
            this.currentVehicle.exit();
        }
        this.isDriving = false;
        this.currentVehicle = null;
        this.weaponModel.visible = true;

        // Dismiss TARS if active
        if (this.tarsRobot && this.tarsRobot.active) {
            this.tarsRobot.dismiss();
        }

        // Init audio
        audioEngine.init();
        audioEngine.resume();
        audioEngine.startAmbience();

        // UI
        document.getElementById('start-menu').style.display = 'none';
        document.getElementById('game-over').style.display = 'none';
        document.getElementById('pause-menu').style.display = 'none';
        document.getElementById('game-hud').style.display = 'block';

        this.state = 'playing';

        // Request pointer lock AFTER a small delay so it works from button click
        setTimeout(() => {
            this.renderer.domElement.requestPointerLock();
        }, 100);

        this.announceWave();
        this.updateHUD();
    }

    pauseGame() {
        this.state = 'paused';
        document.getElementById('pause-menu').style.display = 'block';
        document.exitPointerLock();
    }

    resumeGame() {
        this.state = 'playing';
        document.getElementById('pause-menu').style.display = 'none';
        this.renderer.domElement.requestPointerLock();
    }

    quitToMenu() {
        this.state = 'menu';
        document.getElementById('pause-menu').style.display = 'none';
        document.getElementById('game-over').style.display = 'none';
        document.getElementById('game-hud').style.display = 'none';
        document.getElementById('start-menu').style.display = 'block';
        document.exitPointerLock();
        audioEngine.stopAmbience();
        this.robotManager.clearAll();
    }

    gameOver() {
        this.state = 'gameover';
        document.getElementById('game-hud').style.display = 'none';
        document.getElementById('game-over').style.display = 'block';
        document.exitPointerLock();
        audioEngine.stopAmbience();

        const minutes = Math.floor(this.gameTime / 60);
        const seconds = Math.floor(this.gameTime % 60);
        document.getElementById('go-score').textContent = this.score.toLocaleString();
        document.getElementById('go-kills').textContent = this.kills;
        document.getElementById('go-wave').textContent = this.wave;
        document.getElementById('go-time').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    announceWave() {
        const announce = document.getElementById('wave-announce');
        document.getElementById('wave-announce-num').textContent = this.wave;
        announce.style.display = 'block';
        announce.style.animation = 'none';
        announce.offsetHeight;
        announce.style.animation = 'waveAnnounce 3s ease forwards';

        setTimeout(() => {
            announce.style.display = 'none';
        }, 3000);
    }

    addKillFeed(robotName) {
        const feed = document.getElementById('kill-feed');
        const entry = document.createElement('div');
        entry.className = 'kill-entry';
        entry.textContent = `⚡ ${robotName} DESTROYED`;
        feed.appendChild(entry);

        setTimeout(() => {
            if (entry.parentNode) entry.remove();
        }, 3000);
    }

    updateHUD() {
        const healthPercent = (this.player.health / this.player.maxHealth) * 100;
        document.getElementById('health-bar').style.width = healthPercent + '%';
        document.getElementById('health-text').textContent = Math.ceil(this.player.health);

        const shieldPercent = (this.player.shield / this.player.maxShield) * 100;
        document.getElementById('shield-bar').style.width = shieldPercent + '%';
        document.getElementById('shield-text').textContent = Math.ceil(this.player.shield);

        document.getElementById('score-text').textContent = this.score.toLocaleString();
        document.getElementById('kills-text').textContent = this.kills;
        document.getElementById('wave-text').textContent = this.wave;
    }

    toggleVehicle() {
        if (this.isDriving && this.currentVehicle) {
            // Exit vehicle
            const exitPos = this.currentVehicle.getExitPosition();
            this.player.position.copy(exitPos);
            this.currentVehicle.exit();
            this.isDriving = false;
            this.currentVehicle = null;
            this.weaponModel.visible = true;

            // Restore FPS camera
            this.camera.position.copy(this.player.position);
            this.euler.set(0, 0, 0);
            this.camera.quaternion.setFromEuler(this.euler);
        } else {
            const vehicle = this.vehicleManager.getNearestVehicle(this.player.position);
            if (vehicle) {
                vehicle.enter();
                this.currentVehicle = vehicle;
                this.isDriving = true;
                this.weaponModel.visible = false;
            }
        }
    }

    updatePlayer(delta) {
        // === DRIVING MODE ===
        if (this.isDriving && this.currentVehicle) {
            this.currentVehicle.update(this.keys, delta);

            // Third-person camera behind the car/plane
            if (this.currentVehicle.isPlane) {
                const camPos = this.currentVehicle.getCameraPosition();
                const lookAt = this.currentVehicle.getCameraLookAt();
                this.camera.position.lerp(camPos, 0.2); // Faster lerp for plane
                this.camera.position.y = Math.max(2, this.camera.position.y); // Keep cam above ground
                // Custom look at for plane to track pitch
                this.camera.lookAt(lookAt);
            } else {
                const camPos = this.currentVehicle.getCameraPosition();
                const lookAt = this.currentVehicle.getCameraLookAt();
                this.camera.position.lerp(camPos, 0.1);
                this.camera.lookAt(lookAt);
            }

            // Sync player position with vehicle
            this.player.position.copy(this.currentVehicle.mesh.position);
            this.player.position.y = this.currentVehicle.isPlane ? this.player.position.y : this.player.height;

            // Auto-fire still works while driving
            if (this.mouseDown && this.pointerLocked) {
                const weapon = this.weaponSystem.getCurrentWeapon();
                if (weapon.automatic) {
                    this.weaponSystem.fire(this.camera, this.scene);
                }
            }

            this.checkDoorProximity();
            this.checkVehicleProximity();
            return;
        }

        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyQuaternion(this.camera.quaternion);
        forward.y = 0;
        forward.normalize();

        const right = new THREE.Vector3(1, 0, 0);
        right.applyQuaternion(this.camera.quaternion);
        right.y = 0;
        right.normalize();

        const moveDir = new THREE.Vector3();
        const isSprinting = this.keys['ShiftLeft'] || this.keys['ShiftRight'];
        const speed = isSprinting ? this.player.sprintSpeed : this.player.speed;

        if (this.keys['KeyW']) moveDir.add(forward);
        if (this.keys['KeyS']) moveDir.sub(forward);
        if (this.keys['KeyA']) moveDir.sub(right);
        if (this.keys['KeyD']) moveDir.add(right);

        if (moveDir.length() > 0) {
            moveDir.normalize().multiplyScalar(speed);
        }

        // Jump
        if (this.keys['Space'] && this.player.onGround) {
            this.player.velocity.y = this.player.jumpForce;
            this.player.onGround = false;
        }

        // Gravity
        this.player.velocity.y -= this.player.gravity;

        // Update position
        this.player.position.x += moveDir.x;
        this.player.position.z += moveDir.z;
        this.player.position.y += this.player.velocity.y;

        // Ground check
        if (this.player.position.y <= this.player.height) {
            this.player.position.y = this.player.height;
            this.player.velocity.y = 0;
            this.player.onGround = true;
        }

        // World bounds (keep away from ocean)
        const halfWorld = this.worldGenerator.worldSize / 2 - 5;
        this.player.position.x = Math.max(-halfWorld, Math.min(halfWorld, this.player.position.x));
        this.player.position.z = Math.max(-halfWorld, Math.min(halfWorld, this.player.position.z));

        // Building collision (skip enterable buildings so player can go inside)
        for (const building of this.worldGenerator.buildings) {
            const bPos = building.position;
            const bSize = building.userData.size;
            if (!bSize) continue;
            if (building.userData.enterable) continue; // Can enter these

            const dx = this.player.position.x - bPos.x;
            const dz = this.player.position.z - bPos.z;

            if (Math.abs(dx) < bSize.x + this.player.radius &&
                Math.abs(dz) < bSize.z + this.player.radius) {
                if (Math.abs(dx) / bSize.x > Math.abs(dz) / bSize.z) {
                    this.player.position.x = bPos.x + Math.sign(dx) * (bSize.x + this.player.radius);
                } else {
                    this.player.position.z = bPos.z + Math.sign(dz) * (bSize.z + this.player.radius);
                }
            }
        }

        // Update camera
        this.camera.position.copy(this.player.position);

        // Head bob
        if (moveDir.length() > 0 && this.player.onGround) {
            this.headBobTimer += delta * (isSprinting ? 15 : 10);
            this.headBobAmount = Math.sin(this.headBobTimer) * 0.06;
            this.camera.position.y += this.headBobAmount;

            this.footstepTimer += delta;
            const footstepInterval = isSprinting ? 0.35 : 0.5;
            if (this.footstepTimer > footstepInterval) {
                this.footstepTimer = 0;
                audioEngine.playFootstep();
            }
        } else {
            this.headBobTimer = 0;
            this.footstepTimer = 0;
        }

        // Weapon sway
        if (this.weaponModel) {
            const swayX = Math.sin(this.headBobTimer * 0.7) * 0.008;
            const swayY = Math.cos(this.headBobTimer) * 0.006;
            this.weaponModel.position.x = 0.35 + swayX;
            this.weaponModel.position.y = -0.3 + swayY + this.headBobAmount * 0.4;

            const weapon = this.weaponSystem.getCurrentWeapon();
            this.muzzleGlow.color.setHex(weapon.projectileColor);
        }

        // ====== AUTO-FIRE (continuous for automatic weapons) ======
        if (this.mouseDown && this.pointerLocked) {
            const weapon = this.weaponSystem.getCurrentWeapon();
            if (weapon.automatic) {
                this.weaponSystem.fire(this.camera, this.scene);
            }
        }

        // Check if near a door for interaction prompt
        this.checkDoorProximity();
        this.checkVehicleProximity();
    }

    checkVehicleProximity() {
        if (this.isDriving) {
            this.nearVehicle = false;
            return;
        }
        const vehicle = this.vehicleManager.getNearestVehicle(this.player.position);
        const near = !!vehicle;
        if (near !== this.nearVehicle) {
            this.nearVehicle = near;
            const prompt = document.getElementById('vehicle-prompt');
            if (prompt) prompt.style.display = near ? 'block' : 'none';
        }
    }

    checkDoorProximity() {
        let nearDoor = false;
        for (const door of this.worldGenerator.doors) {
            const doorWorldPos = new THREE.Vector3();
            door.group.getWorldPosition(doorWorldPos);
            if (this.player.position.distanceTo(doorWorldPos) < 6) {
                nearDoor = true;
                break;
            }
        }

        if (nearDoor !== this.nearDoor) {
            this.nearDoor = nearDoor;
            this.interactPrompt.style.display = nearDoor ? 'block' : 'none';
        }
    }

    updateCombat(delta) {
        // Combine robots + creatures as targets for projectiles
        const allTargets = [
            ...this.robotManager.getAliveRobots(),
            ...this.creatureManager.getAliveCreatures()
        ];

        // Update projectiles against all targets
        this.weaponSystem.updateProjectiles(
            this.scene,
            delta,
            allTargets
        );

        const prevAlive = this.robotManager.robots.filter(r => r.alive).length;

        // Update robots
        const waveComplete = this.robotManager.update(
            this.player.position,
            delta,
            this.worldGenerator.buildings
        );

        const currentAlive = this.robotManager.robots.filter(r => r.alive).length;
        const newKills = prevAlive - currentAlive;

        if (newKills > 0) {
            this.kills += newKills;

            for (const robot of this.robotManager.robots) {
                if (!robot.alive && robot._counted !== true) {
                    robot._counted = true;
                    this.score += robot.config.points;
                    this.addKillFeed(robot.config.name);
                }
            }
        }

        // Player damage from robots
        const damage = this.robotManager.checkPlayerHit(
            this.player.position,
            this.player.radius
        );

        if (damage > 0) {
            this.takeDamage(damage);
        }

        // Player damage from creatures
        const creatureDmg = this.creatureManager.checkPlayerDamage(
            this.player.position,
            this.player.radius
        );
        if (creatureDmg > 0) {
            this.takeDamage(creatureDmg);
        }

        // Update TARS companion
        if (this.tarsRobot && this.tarsRobot.active) {
            this.tarsRobot.update(
                this.player.position,
                this.robotManager.getAliveRobots(),
                this.creatureManager.getAliveCreatures(),
                delta
            );
        }

        // Wave completion
        if (waveComplete && !this.waveComplete) {
            this.waveComplete = true;
            this.score += this.wave * 500;

            setTimeout(() => {
                this.wave++;
                this.waveComplete = false;
                this.robotManager.robots = [];
                this.robotManager.startWave(this.wave);
                this.announceWave();
                this.updateHUD();
            }, 3000);
        }

        // Shield regen
        if (this.player.shield < this.player.maxShield) {
            this.player.shield = Math.min(
                this.player.maxShield,
                this.player.shield + 0.5 * delta
            );
        }
    }

    takeDamage(amount) {
        if (this.player.shield > 0) {
            const shieldDamage = Math.min(this.player.shield, amount);
            this.player.shield -= shieldDamage;
            amount -= shieldDamage;
        }

        this.player.health -= amount;

        if (amount > 0) {
            audioEngine.playDamage();

            const overlay = document.getElementById('damage-overlay');
            overlay.classList.add('hit');
            setTimeout(() => overlay.classList.remove('hit'), 300);
        }

        if (this.player.health <= 0) {
            this.player.health = 0;
            this.gameOver();
        }

        this.updateHUD();
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();
        // Cap delta to prevent physics glitches
        const cappedDelta = Math.min(delta, 0.05);

        if (this.state === 'playing') {
            this.gameTime += cappedDelta;
            const time = this.gameTime;

            this.updatePlayer(cappedDelta);
            this.updateCombat(cappedDelta);

            // Update world systems
            this.worldGenerator.updatePickups(
                this.player.position,
                this.weaponSystem,
                this.player
            );
            this.worldGenerator.updateParticles();
            this.worldGenerator.updateDoors();
            this.worldGenerator.updateFires(time);
            this.worldGenerator.updateAnimations(time);

            // Update vehicles
            if (this.vehicleManager) {
                this.vehicleManager.update(this.keys, cappedDelta, this.player.position);
            }

            // Update creatures
            if (this.creatureManager) {
                this.creatureManager.update(this.player.position, cappedDelta);
            }

            this.updateHUD();
        }

        // Render
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
}

// Start the game
window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
