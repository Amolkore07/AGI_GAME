/* ============================================
   ROBOT AI SYSTEM
   Multiple robot types with unique behaviors
   ============================================ */

const ROBOT_TYPES = {
    scout: {
        name: 'SCOUT DRONE',
        health: 50,
        speed: 0.12,
        damage: 8,
        attackRange: 40,
        attackRate: 1500,
        hitRadius: 1.5,
        points: 100,
        color: 0x888899,
        eyeColor: 0xff0000,
        height: 2.0,
        bodyScale: [0.6, 1.0, 0.6],
        aggressive: true
    },
    soldier: {
        name: 'SOLDIER BOT',
        health: 120,
        speed: 0.07,
        damage: 15,
        attackRange: 50,
        attackRate: 2000,
        hitRadius: 2.0,
        points: 250,
        color: 0x556677,
        eyeColor: 0xff3300,
        height: 3.0,
        bodyScale: [1.0, 1.5, 0.8],
        aggressive: true
    },
    tank: {
        name: 'TANK UNIT',
        health: 300,
        speed: 0.04,
        damage: 30,
        attackRange: 60,
        attackRate: 3000,
        hitRadius: 3.0,
        points: 500,
        color: 0x445566,
        eyeColor: 0xff6600,
        height: 4.5,
        bodyScale: [1.8, 2.0, 1.5],
        aggressive: true
    },
    boss: {
        name: 'OVERLORD',
        health: 800,
        speed: 0.03,
        damage: 50,
        attackRange: 80,
        attackRate: 2500,
        hitRadius: 4.0,
        points: 2000,
        color: 0x332233,
        eyeColor: 0xff00ff,
        height: 6.0,
        bodyScale: [2.5, 3.0, 2.0],
        aggressive: true,
        boss: true
    }
};

class Robot {
    constructor(type, position, scene) {
        this.type = type;
        this.config = ROBOT_TYPES[type];
        this.health = this.config.health;
        this.maxHealth = this.config.health;
        this.alive = true;
        this.stunned = false;
        this.stunnedUntil = 0;
        this.lastAttackTime = 0;
        this.hitRadius = this.config.hitRadius;
        this.scene = scene;

        this.mesh = this.buildMesh();
        this.mesh.position.copy(position);
        this.mesh.position.y = this.config.height / 2;
        scene.add(this.mesh);

        // Health bar
        this.healthBar = this.createHealthBar();
        this.mesh.add(this.healthBar);

        // AI state
        this.state = 'patrol';
        this.patrolTarget = this.randomPatrolPoint();
        this.alertDistance = 60;
        this.detectionAngle = Math.PI * 0.8;
    }

    buildMesh() {
        const group = new THREE.Group();
        const scale = this.config.bodyScale;
        const baseColor = new THREE.Color(this.config.color);

        // === HUMANOID TORSO (more anatomical) ===
        // Upper torso (chest)
        const chestGeo = new THREE.BoxGeometry(scale[0] * 1.8, scale[1] * 1.0, scale[2] * 1.5);
        const chestMat = new THREE.MeshLambertMaterial({ color: this.config.color });
        const chest = new THREE.Mesh(chestGeo, chestMat);
        chest.position.y = scale[1] * 0.2;
        group.add(chest);

        // Lower torso (waist - narrower)
        const waistGeo = new THREE.BoxGeometry(scale[0] * 1.4, scale[1] * 0.8, scale[2] * 1.2);
        const waistMat = new THREE.MeshLambertMaterial({ color: baseColor.clone().offsetHSL(0, 0, -0.05) });
        const waist = new THREE.Mesh(waistGeo, waistMat);
        waist.position.y = -scale[1] * 0.5;
        group.add(waist);

        // Spine / back detail
        const spineGeo = new THREE.BoxGeometry(scale[0] * 0.2, scale[1] * 1.6, scale[2] * 0.2);
        const spineMat = new THREE.MeshLambertMaterial({ color: baseColor.clone().offsetHSL(0, 0, -0.1) });
        const spine = new THREE.Mesh(spineGeo, spineMat);
        spine.position.set(0, -0.1, scale[2] * 0.7);
        group.add(spine);

        // Chest plate / armor detail
        const plateMat = new THREE.MeshLambertMaterial({ color: baseColor.clone().offsetHSL(0, 0.05, 0.08) });
        const chestPlate = new THREE.Mesh(
            new THREE.BoxGeometry(scale[0] * 1.2, scale[1] * 0.7, 0.1),
            plateMat
        );
        chestPlate.position.set(0, scale[1] * 0.3, -scale[2] * 0.76);
        group.add(chestPlate);

        // Reactor / core glow on chest
        const coreMat = new THREE.MeshBasicMaterial({
            color: this.config.eyeColor,
            transparent: true,
            opacity: 0.7
        });
        const core = new THREE.Mesh(
            new THREE.SphereGeometry(scale[0] * 0.18, 8, 8),
            coreMat
        );
        core.position.set(0, scale[1] * 0.3, -scale[2] * 0.82);
        group.add(core);

        // === HUMANOID HEAD (rounded, face-like) ===
        const headSize = scale[0] * 0.7;
        // Rounded skull
        const headGeo = new THREE.SphereGeometry(headSize, 10, 10);
        const headMat = new THREE.MeshLambertMaterial({
            color: baseColor.clone().offsetHSL(0, 0, 0.12)
        });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = scale[1] + headSize * 0.7;
        head.scale.set(1.0, 1.1, 0.9);
        group.add(head);

        // Face plate
        const facePlate = new THREE.Mesh(
            new THREE.BoxGeometry(headSize * 1.4, headSize * 0.8, 0.08),
            new THREE.MeshLambertMaterial({ color: baseColor.clone().offsetHSL(0, 0, -0.05) })
        );
        facePlate.position.set(0, scale[1] + headSize * 0.6, -headSize * 0.7);
        group.add(facePlate);

        // Eye visor (slit-style, more menacing)
        const visorMat = new THREE.MeshBasicMaterial({ color: this.config.eyeColor });
        const visor = new THREE.Mesh(
            new THREE.BoxGeometry(headSize * 1.2, headSize * 0.15, 0.1),
            visorMat
        );
        visor.position.set(0, scale[1] + headSize * 0.75, -headSize * 0.78);
        group.add(visor);

        // Individual eye lenses inside visor
        const lensGeo = new THREE.SphereGeometry(0.12, 6, 6);
        const lensMat = new THREE.MeshBasicMaterial({ color: this.config.eyeColor });
        const eyeL = new THREE.Mesh(lensGeo, lensMat);
        eyeL.position.set(-headSize * 0.35, scale[1] + headSize * 0.75, -headSize * 0.85);
        group.add(eyeL);
        const eyeR = new THREE.Mesh(lensGeo, lensMat.clone());
        eyeR.position.set(headSize * 0.35, scale[1] + headSize * 0.75, -headSize * 0.85);
        group.add(eyeR);

        // Jaw / chin piece
        const jawGeo = new THREE.BoxGeometry(headSize * 0.8, headSize * 0.3, headSize * 0.4);
        const jawMat = new THREE.MeshLambertMaterial({ color: baseColor.clone().offsetHSL(0, 0, -0.08) });
        const jaw = new THREE.Mesh(jawGeo, jawMat);
        jaw.position.set(0, scale[1] + headSize * 0.15, -headSize * 0.35);
        group.add(jaw);

        // Mouth slits
        for (let i = 0; i < 3; i++) {
            const slit = new THREE.Mesh(
                new THREE.BoxGeometry(headSize * 0.15, 0.02, 0.05),
                new THREE.MeshBasicMaterial({ color: 0x111111 })
            );
            slit.position.set(
                -headSize * 0.2 + i * headSize * 0.2,
                scale[1] + headSize * 0.15,
                -headSize * 0.58
            );
            group.add(slit);
        }

        // Neck
        const neckGeo = new THREE.CylinderGeometry(headSize * 0.35, headSize * 0.45, headSize * 0.4, 8);
        const neckMat = new THREE.MeshLambertMaterial({ color: baseColor.clone().offsetHSL(0, 0, -0.1) });
        const neck = new THREE.Mesh(neckGeo, neckMat);
        neck.position.y = scale[1] + headSize * 0.05;
        group.add(neck);

        // Antenna / sensor
        if (this.config.boss) {
            const antGeo = new THREE.CylinderGeometry(0.03, 0.03, headSize * 1.0, 4);
            const ant = new THREE.Mesh(antGeo, new THREE.MeshLambertMaterial({ color: 0x444444 }));
            ant.position.set(0, scale[1] + headSize * 1.6, 0);
            group.add(ant);
            const antTip = new THREE.Mesh(
                new THREE.SphereGeometry(0.06, 6, 6),
                new THREE.MeshBasicMaterial({ color: this.config.eyeColor })
            );
            antTip.position.set(0, scale[1] + headSize * 2.1, 0);
            group.add(antTip);
        }

        // Eye glow light (replaced PointLight with simple object for massive performance boost)
        const eyeLight = new THREE.Group(); 
        group.add(eyeLight);
        this.eyeLight = { intensity: 1 }; // Mock object so update functions don't crash

        // === HUMANOID ARMS (upper arm + forearm + hand) ===
        const armColor = baseColor.clone().offsetHSL(0, 0, -0.1);

        // Left arm group
        const armLGroup = new THREE.Group();
        const upperArmGeo = new THREE.BoxGeometry(0.3, scale[1] * 0.85, 0.3);
        const upperArmMat = new THREE.MeshLambertMaterial({ color: armColor });
        const upperArmL = new THREE.Mesh(upperArmGeo, upperArmMat);
        upperArmL.position.y = -scale[1] * 0.4;
        armLGroup.add(upperArmL);
        // Elbow joint
        const elbowL = new THREE.Mesh(
            new THREE.SphereGeometry(0.18, 6, 6),
            new THREE.MeshLambertMaterial({ color: 0x444444 })
        );
        elbowL.position.y = -scale[1] * 0.85;
        armLGroup.add(elbowL);
        // Forearm
        const forearmL = new THREE.Mesh(
            new THREE.BoxGeometry(0.25, scale[1] * 0.7, 0.25),
            upperArmMat.clone()
        );
        forearmL.position.y = -scale[1] * 1.2;
        armLGroup.add(forearmL);
        // Hand
        const handL = new THREE.Mesh(
            new THREE.BoxGeometry(0.22, 0.2, 0.15),
            new THREE.MeshLambertMaterial({ color: 0x444450 })
        );
        handL.position.y = -scale[1] * 1.6;
        armLGroup.add(handL);

        armLGroup.position.set(-scale[0] - 0.3, scale[1] * 0.5, 0);
        group.add(armLGroup);
        this.armL = armLGroup;

        // Right arm group
        const armRGroup = new THREE.Group();
        const upperArmR = new THREE.Mesh(upperArmGeo.clone(), upperArmMat.clone());
        upperArmR.position.y = -scale[1] * 0.4;
        armRGroup.add(upperArmR);
        const elbowR = new THREE.Mesh(
            new THREE.SphereGeometry(0.18, 6, 6),
            new THREE.MeshLambertMaterial({ color: 0x444444 })
        );
        elbowR.position.y = -scale[1] * 0.85;
        armRGroup.add(elbowR);
        const forearmR = new THREE.Mesh(
            new THREE.BoxGeometry(0.25, scale[1] * 0.7, 0.25),
            upperArmMat.clone()
        );
        forearmR.position.y = -scale[1] * 1.2;
        armRGroup.add(forearmR);
        const handR = new THREE.Mesh(
            new THREE.BoxGeometry(0.22, 0.2, 0.15),
            new THREE.MeshLambertMaterial({ color: 0x444450 })
        );
        handR.position.y = -scale[1] * 1.6;
        armRGroup.add(handR);

        armRGroup.position.set(scale[0] + 0.3, scale[1] * 0.5, 0);
        group.add(armRGroup);
        this.armR = armRGroup;

        // === HUMANOID LEGS (thigh + shin + foot) ===
        const legColor = baseColor.clone().offsetHSL(0, 0, -0.15);

        // Left leg group
        const legLGroup = new THREE.Group();
        const thighGeo = new THREE.BoxGeometry(0.4, scale[1] * 0.75, 0.4);
        const thighMat = new THREE.MeshLambertMaterial({ color: legColor });
        const thighL = new THREE.Mesh(thighGeo, thighMat);
        thighL.position.y = -scale[1] * 0.35;
        legLGroup.add(thighL);
        // Knee joint
        const kneeL = new THREE.Mesh(
            new THREE.SphereGeometry(0.22, 6, 6),
            new THREE.MeshLambertMaterial({ color: 0x444444 })
        );
        kneeL.position.y = -scale[1] * 0.75;
        legLGroup.add(kneeL);
        // Shin
        const shinL = new THREE.Mesh(
            new THREE.BoxGeometry(0.35, scale[1] * 0.7, 0.35),
            thighMat.clone()
        );
        shinL.position.y = -scale[1] * 1.15;
        legLGroup.add(shinL);
        // Foot
        const footL = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.15, 0.55),
            new THREE.MeshLambertMaterial({ color: 0x333340 })
        );
        footL.position.set(0, -scale[1] * 1.55, -0.08);
        legLGroup.add(footL);

        legLGroup.position.set(-scale[0] * 0.45, -scale[1] * 0.5, 0);
        group.add(legLGroup);
        this.legL = legLGroup;

        // Right leg group
        const legRGroup = new THREE.Group();
        const thighR = new THREE.Mesh(thighGeo.clone(), thighMat.clone());
        thighR.position.y = -scale[1] * 0.35;
        legRGroup.add(thighR);
        const kneeR = new THREE.Mesh(
            new THREE.SphereGeometry(0.22, 6, 6),
            new THREE.MeshLambertMaterial({ color: 0x444444 })
        );
        kneeR.position.y = -scale[1] * 0.75;
        legRGroup.add(kneeR);
        const shinR = new THREE.Mesh(
            new THREE.BoxGeometry(0.35, scale[1] * 0.7, 0.35),
            thighMat.clone()
        );
        shinR.position.y = -scale[1] * 1.15;
        legRGroup.add(shinR);
        const footR = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.15, 0.55),
            new THREE.MeshLambertMaterial({ color: 0x333340 })
        );
        footR.position.set(0, -scale[1] * 1.55, -0.08);
        legRGroup.add(footR);

        legRGroup.position.set(scale[0] * 0.45, -scale[1] * 0.5, 0);
        group.add(legRGroup);
        this.legR = legRGroup;

        // === WEAPON ON ARM ===
        const weapGeo = new THREE.CylinderGeometry(0.08, 0.12, 1.5, 6);
        const weapMat = new THREE.MeshLambertMaterial({ color: 0x333344 });
        const weapon = new THREE.Mesh(weapGeo, weapMat);
        weapon.rotation.x = Math.PI / 2;
        weapon.position.set(scale[0] + 0.3, -0.5, -0.8);
        group.add(weapon);

        // Weapon glow at tip
        const weapTip = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 4, 4),
            new THREE.MeshBasicMaterial({ color: this.config.eyeColor, transparent: true, opacity: 0.6 })
        );
        weapTip.position.set(scale[0] + 0.3, -0.5, -1.55);
        group.add(weapTip);

        // === SHOULDER ARMOR ===
        const shoulderGeo = new THREE.BoxGeometry(scale[0] * 0.7, 0.35, scale[2] * 0.7);
        const shoulderMat = new THREE.MeshLambertMaterial({
            color: baseColor.clone().offsetHSL(0, 0.1, 0.05)
        });

        const shoulderL = new THREE.Mesh(shoulderGeo, shoulderMat);
        shoulderL.position.set(-scale[0] - 0.3, scale[1] * 0.5, 0);
        group.add(shoulderL);

        const shoulderR = new THREE.Mesh(shoulderGeo, shoulderMat.clone());
        shoulderR.position.set(scale[0] + 0.3, scale[1] * 0.5, 0);
        group.add(shoulderR);

        // Shoulder spikes (for tanks and bosses)
        if (this.type === 'tank' || this.type === 'boss') {
            const spikeMat = new THREE.MeshLambertMaterial({ color: 0x555555 });
            const spikeL = new THREE.Mesh(
                new THREE.ConeGeometry(0.12, 0.5, 6),
                spikeMat
            );
            spikeL.position.set(-scale[0] - 0.3, scale[1] * 0.8, 0);
            group.add(spikeL);
            const spikeR = new THREE.Mesh(
                new THREE.ConeGeometry(0.12, 0.5, 6),
                spikeMat
            );
            spikeR.position.set(scale[0] + 0.3, scale[1] * 0.8, 0);
            group.add(spikeR);
        }

        // Hip armor panels
        const hipGeo = new THREE.BoxGeometry(scale[0] * 0.5, 0.2, scale[2] * 0.5);
        const hipMat = new THREE.MeshLambertMaterial({ color: baseColor.clone().offsetHSL(0, 0, -0.05) });
        const hipL = new THREE.Mesh(hipGeo, hipMat);
        hipL.position.set(-scale[0] * 0.5, -scale[1] * 0.7, 0);
        group.add(hipL);
        const hipR = new THREE.Mesh(hipGeo, hipMat.clone());
        hipR.position.set(scale[0] * 0.5, -scale[1] * 0.7, 0);
        group.add(hipR);

        // Boss crown
        if (this.config.boss) {
            const crownGeo = new THREE.ConeGeometry(headSize, headSize * 0.8, 6);
            const crownMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
            const crown = new THREE.Mesh(crownGeo, crownMat);
            crown.position.y = scale[1] + headSize * 1.6;
            group.add(crown);
        }

        return group;
    }

    createHealthBar() {
        const group = new THREE.Group();

        // Background
        const bgGeo = new THREE.PlaneGeometry(2, 0.15);
        const bgMat = new THREE.MeshBasicMaterial({ color: 0x222222, transparent: true, opacity: 0.8 });
        const bg = new THREE.Mesh(bgGeo, bgMat);
        group.add(bg);

        // Fill
        const fillGeo = new THREE.PlaneGeometry(2, 0.15);
        const fillMat = new THREE.MeshBasicMaterial({ color: 0xff3333 });
        const fill = new THREE.Mesh(fillGeo, fillMat);
        fill.position.z = 0.01;
        group.add(fill);
        this.healthBarFill = fill;

        group.position.y = this.config.height + 1;

        return group;
    }

    randomPatrolPoint() {
        const worldSize = 200;
        return new THREE.Vector3(
            (Math.random() - 0.5) * worldSize,
            0,
            (Math.random() - 0.5) * worldSize
        );
    }

    update(playerPosition, delta, buildings) {
        if (!this.alive) return;

        // Check stun
        if (this.stunned && Date.now() < this.stunnedUntil) {
            // Stunned effect - flicker
            this.eyeLight.intensity = Math.random() * 4;
            return;
        }
        this.stunned = false;

        const distToPlayer = this.mesh.position.distanceTo(
            new THREE.Vector3(playerPosition.x, this.mesh.position.y, playerPosition.z)
        );

        // Walking animation
        const time = Date.now() * 0.005;
        const walkCycle = Math.sin(time * this.config.speed * 50);
        this.legL.rotation.x = walkCycle * 0.5;
        this.legR.rotation.x = -walkCycle * 0.5;
        this.armL.rotation.x = -walkCycle * 0.3;
        this.armR.rotation.x = walkCycle * 0.3;

        // Eye pulse
        this.eyeLight.intensity = 1.5 + Math.sin(time * 3) * 0.5;

        // AI behavior
        if (distToPlayer < this.alertDistance) {
            this.state = 'chase';
        } else if (this.state === 'chase' && distToPlayer > this.alertDistance * 1.5) {
            this.state = 'patrol';
            this.patrolTarget = this.randomPatrolPoint();
        }

        let targetPos;

        if (this.state === 'chase') {
            targetPos = new THREE.Vector3(playerPosition.x, 0, playerPosition.z);

            // Attack if in range
            if (distToPlayer < this.config.attackRange) {
                this.attack(playerPosition);
            }
        } else {
            targetPos = this.patrolTarget;
            const distToTarget = new THREE.Vector2(
                this.mesh.position.x - targetPos.x,
                this.mesh.position.z - targetPos.z
            ).length();

            if (distToTarget < 5) {
                this.patrolTarget = this.randomPatrolPoint();
            }
        }

        // Move towards target
        const dir = new THREE.Vector3(
            targetPos.x - this.mesh.position.x,
            0,
            targetPos.z - this.mesh.position.z
        ).normalize();

        // Simple collision avoidance with buildings
        let canMove = true;
        if (buildings) {
            for (const building of buildings) {
                const bPos = building.position;
                const bSize = building.userData.size || { x: 5, z: 5 };
                const nextPos = this.mesh.position.clone().add(dir.clone().multiplyScalar(this.config.speed));

                if (Math.abs(nextPos.x - bPos.x) < bSize.x + 2 &&
                    Math.abs(nextPos.z - bPos.z) < bSize.z + 2) {
                    // Try to go around
                    dir.x += (Math.random() - 0.5) * 2;
                    dir.z += (Math.random() - 0.5) * 2;
                    dir.normalize();
                }
            }
        }

        this.mesh.position.x += dir.x * this.config.speed;
        this.mesh.position.z += dir.z * this.config.speed;

        // Face direction
        const angle = Math.atan2(dir.x, dir.z);
        this.mesh.rotation.y = angle;

        // Update health bar to face camera
        this.healthBar.lookAt(playerPosition);

        // Update health bar fill
        const hpFraction = this.health / this.maxHealth;
        this.healthBarFill.scale.x = Math.max(0.001, hpFraction);
        this.healthBarFill.position.x = -(1 - hpFraction);
    }

    attack(playerPosition) {
        const now = Date.now();
        if (now - this.lastAttackTime < this.config.attackRate) return null;

        this.lastAttackTime = now;

        // Create laser projectile towards player
        const direction = new THREE.Vector3(
            playerPosition.x - this.mesh.position.x,
            playerPosition.y - this.mesh.position.y,
            playerPosition.z - this.mesh.position.z
        ).normalize();

        // Add slight inaccuracy
        direction.x += (Math.random() - 0.5) * 0.1;
        direction.y += (Math.random() - 0.5) * 0.1;
        direction.z += (Math.random() - 0.5) * 0.1;
        direction.normalize();

        const projectile = this.createProjectile(direction);

        return {
            projectile,
            damage: this.config.damage
        };
    }

    createProjectile(direction) {
        const geo = new THREE.SphereGeometry(0.15, 4, 4);
        const mat = new THREE.MeshBasicMaterial({
            color: this.config.eyeColor,
            transparent: true,
            opacity: 0.9
        });
        const bullet = new THREE.Mesh(geo, mat);

        // Start from weapon position
        const weaponWorldPos = new THREE.Vector3();
        this.mesh.getWorldPosition(weaponWorldPos);
        weaponWorldPos.y += this.config.bodyScale[1] * 0.5;
        bullet.position.copy(weaponWorldPos);

        // Glow (no PointLight for performance)
        const glowGeo = new THREE.SphereGeometry(0.25, 4, 4);
        const glowMat = new THREE.MeshBasicMaterial({
            color: this.config.eyeColor,
            transparent: true,
            opacity: 0.3
        });
        bullet.add(new THREE.Mesh(glowGeo, glowMat));

        this.scene.add(bullet);

        return {
            mesh: bullet,
            direction: direction.clone(),
            speed: 1.5,
            distanceTraveled: 0,
            maxRange: 100,
            alive: true,
            damage: this.config.damage
        };
    }

    takeDamage(amount) {
        if (!this.alive) return;

        this.health -= amount;

        // Flash red on hit - using emissive for Lambert
        this.mesh.children.forEach(child => {
            if (child.material && child.material.emissive) {
                child.material.emissive.setHex(0xff0000);
                setTimeout(() => {
                    if (child.material) {
                        child.material.emissive.setHex(0x000000);
                    }
                }, 100);
            }
        });

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        this.alive = false;
        audioEngine.playRobotDeath();

        // Death animation - parts fly apart
        const parts = [];
        const pos = this.mesh.position.clone();

        this.mesh.children.forEach((child, i) => {
            if (child.isMesh) {
                const worldPos = new THREE.Vector3();
                child.getWorldPosition(worldPos);

                const part = child.clone();
                part.position.copy(worldPos);

                part.velocity = new THREE.Vector3(
                    (Math.random() - 0.5) * 0.4,
                    Math.random() * 0.3 + 0.1,
                    (Math.random() - 0.5) * 0.4
                );
                part.rotSpeed = new THREE.Vector3(
                    Math.random() * 0.1,
                    Math.random() * 0.1,
                    Math.random() * 0.1
                );

                this.scene.add(part);
                parts.push(part);
            }
        });

        this.scene.remove(this.mesh);

        // Animate parts
        let frame = 0;
        const animate = () => {
            frame++;
            parts.forEach(p => {
                p.position.add(p.velocity);
                p.velocity.y -= 0.01;
                p.rotation.x += p.rotSpeed.x;
                p.rotation.y += p.rotSpeed.y;
                p.rotation.z += p.rotSpeed.z;

                if (p.position.y < 0) {
                    p.position.y = 0;
                    p.velocity.y *= -0.3;
                    p.velocity.x *= 0.8;
                    p.velocity.z *= 0.8;
                }
            });

            if (frame < 120) {
                requestAnimationFrame(animate);
            } else {
                parts.forEach(p => this.scene.remove(p));
            }
        };
        animate();

        // Small explosion at death point
        const explosion = new THREE.Mesh(
            new THREE.SphereGeometry(1.5, 8, 8),
            new THREE.MeshBasicMaterial({ color: this.config.eyeColor, transparent: true, opacity: 0.6 })
        );
        explosion.position.copy(pos);
        this.scene.add(explosion);
        setTimeout(() => this.scene.remove(explosion), 300);
    }
}

class RobotManager {
    constructor(scene) {
        this.scene = scene;
        this.robots = [];
        this.enemyProjectiles = [];
        this.wave = 1;
        this.robotsToSpawn = 0;
        this.spawnTimer = 0;
        this.spawnInterval = 2000;
        this.worldSize = 200;
    }

    startWave(wave) {
        this.wave = wave;

        // Calculate robots for this wave
        const scouts = Math.floor(3 + wave * 2);
        const soldiers = Math.floor(wave * 1.5);
        const tanks = Math.max(0, Math.floor((wave - 2) * 0.5));
        const bosses = wave % 5 === 0 ? 1 : 0;

        this.spawnQueue = [];
        for (let i = 0; i < scouts; i++) this.spawnQueue.push('scout');
        for (let i = 0; i < soldiers; i++) this.spawnQueue.push('soldier');
        for (let i = 0; i < tanks; i++) this.spawnQueue.push('tank');
        for (let i = 0; i < bosses; i++) this.spawnQueue.push('boss');

        // Shuffle
        for (let i = this.spawnQueue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.spawnQueue[i], this.spawnQueue[j]] = [this.spawnQueue[j], this.spawnQueue[i]];
        }

        this.spawnTimer = Date.now();
    }

    getSpawnPosition(playerPos) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 60 + Math.random() * 40;
        return new THREE.Vector3(
            playerPos.x + Math.cos(angle) * dist,
            0,
            playerPos.z + Math.sin(angle) * dist
        );
    }

    update(playerPosition, delta, buildings) {
        const now = Date.now();

        // Spawn robots from queue
        if (this.spawnQueue && this.spawnQueue.length > 0) {
            if (now - this.spawnTimer > this.spawnInterval) {
                this.spawnTimer = now;
                const type = this.spawnQueue.pop();
                const pos = this.getSpawnPosition(playerPosition);
                const robot = new Robot(type, pos, this.scene);
                this.robots.push(robot);
            }
        }

        // Update all robots
        for (const robot of this.robots) {
            robot.update(playerPosition, delta, buildings);

            // Robot attacks
            if (robot.alive && robot.state === 'chase') {
                const distToPlayer = robot.mesh.position.distanceTo(
                    new THREE.Vector3(playerPosition.x, robot.mesh.position.y, playerPosition.z)
                );
                if (distToPlayer < robot.config.attackRange) {
                    const attack = robot.attack(playerPosition);
                    if (attack) {
                        this.enemyProjectiles.push(attack.projectile);
                    }
                }
            }
        }

        // Update enemy projectiles
        for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
            const proj = this.enemyProjectiles[i];
            if (!proj.alive) {
                this.scene.remove(proj.mesh);
                this.enemyProjectiles.splice(i, 1);
                continue;
            }

            proj.mesh.position.add(proj.direction.clone().multiplyScalar(proj.speed));
            proj.distanceTraveled += proj.speed;

            if (proj.distanceTraveled >= proj.maxRange || proj.mesh.position.y < 0) {
                proj.alive = false;
            }
        }

        // Check if wave is complete
        const allDead = this.robots.every(r => !r.alive);
        const allSpawned = !this.spawnQueue || this.spawnQueue.length === 0;

        return allDead && allSpawned && this.robots.length > 0;
    }

    checkPlayerHit(playerPosition, playerRadius) {
        let totalDamage = 0;

        for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
            const proj = this.enemyProjectiles[i];
            if (!proj.alive) continue;

            const dist = proj.mesh.position.distanceTo(playerPosition);
            if (dist < playerRadius) {
                totalDamage += proj.damage;
                proj.alive = false;
            }
        }

        // Melee damage from close robots
        for (const robot of this.robots) {
            if (!robot.alive) continue;
            const dist = robot.mesh.position.distanceTo(
                new THREE.Vector3(playerPosition.x, robot.mesh.position.y, playerPosition.z)
            );
            if (dist < 4) {
                const now = Date.now();
                if (!robot._lastMelee || now - robot._lastMelee > 1000) {
                    robot._lastMelee = now;
                    totalDamage += robot.config.damage * 0.5;
                }
            }
        }

        return totalDamage;
    }

    getAliveRobots() {
        return this.robots.filter(r => r.alive);
    }

    clearAll() {
        for (const robot of this.robots) {
            if (robot.alive) {
                this.scene.remove(robot.mesh);
            }
        }
        for (const proj of this.enemyProjectiles) {
            this.scene.remove(proj.mesh);
        }
        this.robots = [];
        this.enemyProjectiles = [];
        this.spawnQueue = [];
    }
}
