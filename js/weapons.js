/* ============================================
   WEAPONS SYSTEM
   Defines all player weapons and projectiles
   ============================================ */

const WEAPONS = {
    plasma: {
        name: 'PLASMA PISTOL',
        damage: 15,
        fireRate: 200,      // ms between shots
        ammo: Infinity,
        maxAmmo: Infinity,
        reloadTime: 0,
        range: 150,
        projectileSpeed: 3,
        projectileColor: 0x00ff88,
        projectileSize: 0.15,
        trailColor: 0x00ff88,
        soundType: 'plasma',
        automatic: false,
        spread: 0.02,
        slot: 1,
        icon: '🔫'
    },
    railgun: {
        name: 'RAIL GUN',
        damage: 80,
        fireRate: 1200,
        ammo: 30,
        maxAmmo: 30,
        reloadTime: 2000,
        range: 300,
        projectileSpeed: 8,
        projectileColor: 0x00aaff,
        projectileSize: 0.08,
        trailColor: 0x0088ff,
        soundType: 'railgun',
        automatic: false,
        spread: 0.005,
        slot: 2,
        icon: '⚡',
        hitscan: true
    },
    flamethrower: {
        name: 'FLAME THROWER',
        damage: 5,
        fireRate: 50,
        ammo: 200,
        maxAmmo: 200,
        reloadTime: 3000,
        range: 30,
        projectileSpeed: 1.5,
        projectileColor: 0xff6600,
        projectileSize: 0.4,
        trailColor: 0xff4400,
        soundType: 'flame',
        automatic: true,
        spread: 0.15,
        slot: 3,
        icon: '🔥',
        flame: true
    },
    rocket: {
        name: 'ROCKET LAUNCHER',
        damage: 120,
        fireRate: 2000,
        ammo: 15,
        maxAmmo: 15,
        reloadTime: 3500,
        range: 200,
        projectileSpeed: 2,
        projectileColor: 0xff3300,
        projectileSize: 0.3,
        trailColor: 0xff5500,
        soundType: 'rocket',
        automatic: false,
        spread: 0.01,
        slot: 4,
        icon: '🚀',
        explosive: true,
        explosionRadius: 12
    },
    emp: {
        name: 'EMP CANNON',
        damage: 40,
        fireRate: 1500,
        ammo: 20,
        maxAmmo: 20,
        reloadTime: 2500,
        range: 120,
        projectileSpeed: 2.5,
        projectileColor: 0xaa44ff,
        projectileSize: 0.5,
        trailColor: 0x8833ff,
        soundType: 'emp',
        automatic: false,
        spread: 0.03,
        slot: 5,
        icon: '💀',
        emp: true,
        chainRadius: 15
    }
};

class WeaponSystem {
    constructor() {
        this.currentWeapon = 'plasma';
        this.weapons = {};
        this.lastFireTime = 0;
        this.isReloading = false;
        this.reloadTimer = null;
        this.projectiles = [];

        // Initialize weapon ammo
        for (const [key, weapon] of Object.entries(WEAPONS)) {
            this.weapons[key] = {
                ammo: weapon.ammo,
                maxAmmo: weapon.maxAmmo
            };
        }
    }

    getCurrentWeapon() {
        return WEAPONS[this.currentWeapon];
    }

    getCurrentAmmo() {
        return this.weapons[this.currentWeapon].ammo;
    }

    switchWeapon(slot) {
        for (const [key, weapon] of Object.entries(WEAPONS)) {
            if (weapon.slot === slot) {
                if (this.currentWeapon !== key) {
                    this.currentWeapon = key;
                    this.isReloading = false;
                    if (this.reloadTimer) clearTimeout(this.reloadTimer);
                    this.updateHUD();
                }
                return;
            }
        }
    }

    canFire() {
        const now = Date.now();
        const weapon = this.getCurrentWeapon();
        const ammoData = this.weapons[this.currentWeapon];

        if (this.isReloading) return false;
        if (ammoData.ammo <= 0 && ammoData.ammo !== Infinity) return false;
        if (now - this.lastFireTime < weapon.fireRate) return false;

        return true;
    }

    fire(camera, scene) {
        if (!this.canFire()) return null;

        const weapon = this.getCurrentWeapon();
        const ammoData = this.weapons[this.currentWeapon];

        this.lastFireTime = Date.now();

        // Consume ammo
        if (ammoData.ammo !== Infinity) {
            ammoData.ammo--;
        }

        // Play sound
        audioEngine.playGunshot(weapon.soundType);

        // Create projectile
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(camera.quaternion);

        // Add spread
        direction.x += (Math.random() - 0.5) * weapon.spread;
        direction.y += (Math.random() - 0.5) * weapon.spread;
        direction.normalize();

        const projectile = this.createProjectile(camera.position.clone(), direction, weapon, scene);
        this.projectiles.push(projectile);

        // Auto reload if empty
        if (ammoData.ammo === 0 && ammoData.maxAmmo !== Infinity) {
            this.reload();
        }

        this.updateHUD();

        // Muzzle flash effect
        this.showMuzzleFlash();

        return projectile;
    }

    createProjectile(origin, direction, weapon, scene) {
        let geometry, material;

        if (weapon.flame) {
            geometry = new THREE.SphereGeometry(weapon.projectileSize, 4, 4);
            material = new THREE.MeshBasicMaterial({
                color: weapon.projectileColor,
                transparent: true,
                opacity: 0.8
            });
        } else {
            geometry = new THREE.SphereGeometry(weapon.projectileSize, 6, 6);
            material = new THREE.MeshBasicMaterial({
                color: weapon.projectileColor
            });
        }

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(origin);
        mesh.position.y -= 0.3; // Slightly below camera
        mesh.position.add(direction.clone().multiplyScalar(1));

        // Glow (no PointLight - performance)
        const glowGeometry = new THREE.SphereGeometry(weapon.projectileSize * 1.8, 4, 4);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: weapon.projectileColor,
            transparent: true,
            opacity: 0.25
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        mesh.add(glow);

        scene.add(mesh);

        return {
            mesh,
            direction: direction.clone(),
            speed: weapon.projectileSpeed,
            damage: weapon.damage,
            range: weapon.range,
            distanceTraveled: 0,
            weapon: this.currentWeapon,
            weaponData: weapon,
            alive: true,
            createdAt: Date.now()
        };
    }

    updateProjectiles(scene, delta, robots) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            if (!proj.alive) {
                scene.remove(proj.mesh);
                this.projectiles.splice(i, 1);
                continue;
            }

            const moveVector = proj.direction.clone().multiplyScalar(proj.speed);
            proj.mesh.position.add(moveVector);
            proj.distanceTraveled += proj.speed;

            // Flame particles shrink and change color
            if (proj.weaponData.flame) {
                const life = proj.distanceTraveled / proj.range;
                proj.mesh.scale.setScalar(1 + life * 2);
                proj.mesh.material.opacity = Math.max(0, 0.8 - life);
            }

            // Check range
            if (proj.distanceTraveled >= proj.range) {
                if (proj.weaponData.explosive) {
                    this.createExplosion(proj.mesh.position.clone(), proj.weaponData, scene, robots);
                }
                proj.alive = false;
                continue;
            }

            // Check collision with robots
            for (const robot of robots) {
                if (!robot.alive) continue;
                const dist = proj.mesh.position.distanceTo(robot.mesh.position);
                if (dist < robot.hitRadius) {
                    // Hit!
                    if (proj.weaponData.explosive) {
                        this.createExplosion(proj.mesh.position.clone(), proj.weaponData, scene, robots);
                    } else if (proj.weaponData.emp) {
                        this.createEMPEffect(proj.mesh.position.clone(), proj.weaponData, scene, robots);
                    } else {
                        robot.takeDamage(proj.damage);
                        audioEngine.playHitMarker();
                        this.createHitSparks(proj.mesh.position.clone(), scene);
                    }
                    proj.alive = false;
                    break;
                }
            }

            // Check collision with world (ground)
            if (proj.mesh.position.y < 0.3) {
                if (proj.weaponData.explosive) {
                    this.createExplosion(proj.mesh.position.clone(), proj.weaponData, scene, robots);
                }
                proj.alive = false;
            }
        }
    }

    createExplosion(position, weapon, scene, robots) {
        audioEngine.playExplosion(1.0);

        // Damage nearby robots
        const radius = weapon.explosionRadius || 10;
        for (const robot of robots) {
            if (!robot.alive) continue;
            const dist = robot.mesh.position.distanceTo(position);
            if (dist < radius) {
                const falloff = 1 - (dist / radius);
                robot.takeDamage(weapon.damage * falloff);
                audioEngine.playHitMarker();
            }
        }

        // Visual explosion
        const explosionGroup = new THREE.Group();

        // Core flash
        const coreGeo = new THREE.SphereGeometry(2, 16, 16);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 1 });
        const core = new THREE.Mesh(coreGeo, coreMat);
        explosionGroup.add(core);

        // Fireball
        const fireGeo = new THREE.SphereGeometry(4, 12, 12);
        const fireMat = new THREE.MeshBasicMaterial({ color: 0xff4400, transparent: true, opacity: 0.7 });
        const fireball = new THREE.Mesh(fireGeo, fireMat);
        explosionGroup.add(fireball);

        explosionGroup.position.copy(position);
        scene.add(explosionGroup);

        // Animate
        let frame = 0;
        const animate = () => {
            frame++;
            const t = frame / 30;
            core.scale.setScalar(1 + t * 3);
            fireball.scale.setScalar(1 + t * 5);
            coreMat.opacity = Math.max(0, 1 - t * 2);
            fireMat.opacity = Math.max(0, 0.7 - t);

            if (frame < 30) {
                requestAnimationFrame(animate);
            } else {
                scene.remove(explosionGroup);
            }
        };
        animate();

        // Screen shake
        document.body.classList.add('screen-shake');
        setTimeout(() => document.body.classList.remove('screen-shake'), 200);

        // Debris particles
        this.createDebris(position, scene);
    }

    createEMPEffect(position, weapon, scene, robots) {
        audioEngine.playEMP();

        const radius = weapon.chainRadius || 15;

        // Damage and stun nearby robots
        for (const robot of robots) {
            if (!robot.alive) continue;
            const dist = robot.mesh.position.distanceTo(position);
            if (dist < radius) {
                robot.takeDamage(weapon.damage);
                robot.stunned = true;
                robot.stunnedUntil = Date.now() + 3000;
                audioEngine.playHitMarker();
            }
        }

        // Visual EMP pulse
        const ringGeo = new THREE.RingGeometry(0.1, 0.5, 32);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0xaa44ff,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.copy(position);
        ring.rotation.x = -Math.PI / 2;
        scene.add(ring);

        let frame = 0;
        const animate = () => {
            frame++;
            const t = frame / 30;
            ring.scale.setScalar(1 + t * radius * 2);
            ringMat.opacity = Math.max(0, 0.8 - t);

            if (frame < 30) {
                requestAnimationFrame(animate);
            } else {
                scene.remove(ring);
            }
        };
        animate();
    }

    createHitSparks(position, scene) {
        const sparkCount = 8;
        const sparks = [];

        for (let i = 0; i < sparkCount; i++) {
            const geo = new THREE.SphereGeometry(0.05, 4, 4);
            const mat = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(0.1, 1, 0.5 + Math.random() * 0.5)
            });
            const spark = new THREE.Mesh(geo, mat);
            spark.position.copy(position);
            spark.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.5,
                Math.random() * 0.3,
                (Math.random() - 0.5) * 0.5
            );
            scene.add(spark);
            sparks.push({ mesh: spark, material: mat });
        }

        let frame = 0;
        const animate = () => {
            frame++;
            sparks.forEach(s => {
                s.mesh.position.add(s.mesh.velocity);
                s.mesh.velocity.y -= 0.02;
                s.material.opacity = Math.max(0, 1 - frame / 15);
            });

            if (frame < 15) {
                requestAnimationFrame(animate);
            } else {
                sparks.forEach(s => scene.remove(s.mesh));
            }
        };
        animate();
    }

    createDebris(position, scene) {
        const count = 12;
        const debris = [];

        for (let i = 0; i < count; i++) {
            const size = Math.random() * 0.3 + 0.1;
            const geo = new THREE.BoxGeometry(size, size, size);
            const mat = new THREE.MeshLambertMaterial({
                color: new THREE.Color().setHSL(0, 0, 0.2 + Math.random() * 0.2)
            });
            const piece = new THREE.Mesh(geo, mat);
            piece.position.copy(position);
            piece.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.8,
                Math.random() * 0.6 + 0.2,
                (Math.random() - 0.5) * 0.8
            );
            piece.rotSpeed = new THREE.Vector3(
                Math.random() * 0.2,
                Math.random() * 0.2,
                Math.random() * 0.2
            );
            scene.add(piece);
            debris.push(piece);
        }

        let frame = 0;
        const animate = () => {
            frame++;
            debris.forEach(d => {
                d.position.add(d.velocity);
                d.velocity.y -= 0.015;
                d.rotation.x += d.rotSpeed.x;
                d.rotation.y += d.rotSpeed.y;
                d.rotation.z += d.rotSpeed.z;

                if (d.position.y < 0) {
                    d.position.y = 0;
                    d.velocity.y *= -0.3;
                    d.velocity.x *= 0.7;
                    d.velocity.z *= 0.7;
                }
            });

            if (frame < 90) {
                requestAnimationFrame(animate);
            } else {
                debris.forEach(d => scene.remove(d));
            }
        };
        animate();
    }

    reload() {
        const weapon = this.getCurrentWeapon();
        const ammoData = this.weapons[this.currentWeapon];

        if (ammoData.maxAmmo === Infinity) return;
        if (ammoData.ammo === ammoData.maxAmmo) return;
        if (this.isReloading) return;

        this.isReloading = true;
        audioEngine.playReload();

        this.reloadTimer = setTimeout(() => {
            ammoData.ammo = ammoData.maxAmmo;
            this.isReloading = false;
            this.updateHUD();
        }, weapon.reloadTime);
    }

    showMuzzleFlash() {
        const flash = document.createElement('div');
        flash.className = 'muzzle-flash';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 100);
    }

    updateHUD() {
        const weapon = this.getCurrentWeapon();
        const ammoData = this.weapons[this.currentWeapon];

        document.getElementById('weapon-name').textContent = weapon.name;

        if (ammoData.ammo === Infinity) {
            document.getElementById('ammo-current').textContent = '∞';
            document.getElementById('ammo-max').textContent = '∞';
        } else {
            document.getElementById('ammo-current').textContent = ammoData.ammo;
            document.getElementById('ammo-max').textContent = ammoData.maxAmmo;
        }

        // Update weapon slots
        document.querySelectorAll('.weapon-slot').forEach(slot => {
            const slotNum = parseInt(slot.dataset.slot);
            slot.classList.toggle('active', slotNum === weapon.slot);
        });
    }

    addAmmo(weaponKey, amount) {
        if (this.weapons[weaponKey]) {
            const w = this.weapons[weaponKey];
            w.ammo = Math.min(w.ammo + amount, w.maxAmmo);
            audioEngine.playPickup();
            this.updateHUD();
        }
    }
}
