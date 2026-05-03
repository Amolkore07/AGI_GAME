/* ============================================
   HOSTILE CREATURES SYSTEM
   Animals/insects that lurk inside houses
   Crocodile, Giant Spider, Serpent
   ============================================ */

const CREATURE_TYPES = {
    crocodile: {
        name: 'MUTANT CROCODILE',
        health: 80,
        speed: 0.06,
        damage: 25,
        attackRange: 4,
        attackRate: 1500,
        hitRadius: 2.5,
        points: 300,
        color: 0x3a5a2a,
        scale: 1.0
    },
    spider: {
        name: 'GIANT SPIDER',
        health: 40,
        speed: 0.1,
        damage: 15,
        attackRange: 3,
        attackRate: 1000,
        hitRadius: 1.5,
        points: 200,
        color: 0x2a2a2a,
        scale: 0.8
    },
    serpent: {
        name: 'CYBER SERPENT',
        health: 60,
        speed: 0.08,
        damage: 20,
        attackRange: 3.5,
        attackRate: 1200,
        hitRadius: 1.8,
        points: 250,
        color: 0x553322,
        scale: 0.9    },
    bird: {
        name: 'SKY BIRD',
        health: 15,
        speed: 0.15,
        damage: 0,
        attackRange: 0,
        attackRate: 0,
        hitRadius: 0.8,
        points: 50,
        color: 0x8B4513,
        scale: 0.6    }
};

class Creature {
    constructor(type, position, scene, homePosition) {
        this.type = type;
        this.config = CREATURE_TYPES[type];
        this.health = this.config.health;
        this.maxHealth = this.config.health;
        this.alive = true;
        this.scene = scene;
        this.lastAttackTime = 0;
        this.hitRadius = this.config.hitRadius;
        this.homePosition = homePosition.clone();
        this.roamRadius = 8;
        this.state = 'idle';
        this.alertDistance = 15;

        this.mesh = this.buildMesh();
        this.mesh.position.copy(position);
        scene.add(this.mesh);

        this.patrolTarget = this.randomPatrolPoint();

        // Health bar
        this.healthBar = this.createHealthBar();
        this.mesh.add(this.healthBar);
    }

    buildMesh() {
        switch (this.type) {
            case 'crocodile': return this.buildCrocodile();
            case 'spider': return this.buildSpider();
            case 'serpent': return this.buildSerpent();
            case 'bird': return this.buildBird();
            default: return this.buildCrocodile();
        }
    }

    buildBird() {
        const group = new THREE.Group();
        const s = this.config.scale;
        const bodyMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const wingMat = new THREE.MeshLambertMaterial({ color: 0x654321 });
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const beakMat = new THREE.MeshLambertMaterial({ color: 0xFF6600 });

        // Body
        const body = new THREE.Mesh(
            new THREE.SphereGeometry(0.3 * s, 8, 8),
            bodyMat
        );
        body.scale.set(1.2, 0.8, 0.8);
        group.add(body);

        // Head
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.15 * s, 8, 8),
            bodyMat.clone()
        );
        head.position.set(0.35 * s, 0.1 * s, 0);
        group.add(head);

        // Eye
        const eye = new THREE.Mesh(
            new THREE.SphereGeometry(0.03 * s, 4, 4),
            eyeMat
        );
        eye.position.set(0.45 * s, 0.15 * s, 0.08 * s);
        group.add(eye);

        // Beak
        const beak = new THREE.Mesh(
            new THREE.ConeGeometry(0.03 * s, 0.15 * s, 4),
            beakMat
        );
        beak.position.set(0.55 * s, 0.1 * s, 0);
        beak.rotation.z = Math.PI / 2;
        group.add(beak);

        // Wings (L & R)
        const wingL = new THREE.Mesh(
            new THREE.BoxGeometry(0.6 * s, 0.15 * s, 0.05 * s),
            wingMat
        );
        wingL.position.set(0, 0, 0.25 * s);
        wingL.rotation.x = 0.5;
        group.add(wingL);
        this.wingL = wingL;

        const wingR = wingL.clone();
        wingR.position.z = -0.25 * s;
        group.add(wingR);
        this.wingR = wingR;

        // Tail
        const tail = new THREE.Mesh(
            new THREE.BoxGeometry(0.3 * s, 0.08 * s, 0.2 * s),
            bodyMat.clone()
        );
        tail.position.set(-0.4 * s, -0.05 * s, 0);
        group.add(tail);

        return group;
    }

    buildCrocodile() {
        const group = new THREE.Group();
        const s = this.config.scale;
        const bodyMat = new THREE.MeshLambertMaterial({ color: this.config.color });
        const bellyMat = new THREE.MeshLambertMaterial({ color: 0x6a7a3a });
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const toothMat = new THREE.MeshLambertMaterial({ color: 0xeeeecc });

        // Body
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(3.0 * s, 0.6 * s, 1.0 * s),
            bodyMat
        );
        body.position.y = 0.4 * s;
        group.add(body);

        // Belly
        const belly = new THREE.Mesh(
            new THREE.BoxGeometry(2.8 * s, 0.15 * s, 0.8 * s),
            bellyMat
        );
        belly.position.y = 0.15 * s;
        group.add(belly);

        // Head
        const head = new THREE.Mesh(
            new THREE.BoxGeometry(1.2 * s, 0.5 * s, 0.9 * s),
            bodyMat.clone()
        );
        head.position.set(1.8 * s, 0.45 * s, 0);
        group.add(head);

        // Upper jaw
        const upperJaw = new THREE.Mesh(
            new THREE.BoxGeometry(0.8 * s, 0.15 * s, 0.7 * s),
            bodyMat.clone()
        );
        upperJaw.position.set(2.5 * s, 0.5 * s, 0);
        group.add(upperJaw);

        // Lower jaw (animated)
        const lowerJaw = new THREE.Mesh(
            new THREE.BoxGeometry(0.8 * s, 0.12 * s, 0.65 * s),
            bodyMat.clone()
        );
        lowerJaw.position.set(2.5 * s, 0.3 * s, 0);
        group.add(lowerJaw);
        this.jaw = lowerJaw;

        // Teeth
        for (let i = 0; i < 4; i++) {
            const tooth = new THREE.Mesh(
                new THREE.ConeGeometry(0.04 * s, 0.12 * s, 4),
                toothMat
            );
            tooth.position.set(2.2 * s + i * 0.2 * s, 0.38 * s, 0.3 * s);
            tooth.rotation.z = Math.PI;
            group.add(tooth);

            const tooth2 = tooth.clone();
            tooth2.position.z = -0.3 * s;
            group.add(tooth2);
        }

        // Eyes
        const eyeL = new THREE.Mesh(
            new THREE.SphereGeometry(0.08 * s, 6, 6),
            eyeMat
        );
        eyeL.position.set(2.0 * s, 0.75 * s, 0.35 * s);
        group.add(eyeL);

        const eyeR = new THREE.Mesh(
            new THREE.SphereGeometry(0.08 * s, 6, 6),
            eyeMat.clone()
        );
        eyeR.position.set(2.0 * s, 0.75 * s, -0.35 * s);
        group.add(eyeR);

        // Tail
        const tail = new THREE.Mesh(
            new THREE.BoxGeometry(1.5 * s, 0.35 * s, 0.5 * s),
            bodyMat.clone()
        );
        tail.position.set(-2.0 * s, 0.35 * s, 0);
        group.add(tail);
        this.tail = tail;

        const tailTip = new THREE.Mesh(
            new THREE.BoxGeometry(0.8 * s, 0.2 * s, 0.3 * s),
            bodyMat.clone()
        );
        tailTip.position.set(-3.0 * s, 0.3 * s, 0);
        group.add(tailTip);

        // Legs
        const legMat = new THREE.MeshLambertMaterial({ color: 0x2a4a1a });
        const legPositions = [
            [0.8 * s, 0, 0.6 * s],
            [0.8 * s, 0, -0.6 * s],
            [-0.8 * s, 0, 0.6 * s],
            [-0.8 * s, 0, -0.6 * s]
        ];
        this.legs = [];
        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(
                new THREE.BoxGeometry(0.2 * s, 0.4 * s, 0.15 * s),
                legMat
            );
            leg.position.set(...pos);
            group.add(leg);
            this.legs.push(leg);
        });

        // Scale bumps on back
        for (let i = 0; i < 6; i++) {
            const bump = new THREE.Mesh(
                new THREE.BoxGeometry(0.15 * s, 0.12 * s, 0.12 * s),
                bodyMat.clone()
            );
            bump.position.set(-1.0 * s + i * 0.5 * s, 0.75 * s, 0);
            group.add(bump);
        }

        return group;
    }

    buildSpider() {
        const group = new THREE.Group();
        const s = this.config.scale;
        const bodyMat = new THREE.MeshLambertMaterial({ color: this.config.color });
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const legMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });

        // Abdomen
        const abdomen = new THREE.Mesh(
            new THREE.SphereGeometry(0.7 * s, 8, 8),
            bodyMat
        );
        abdomen.position.set(-0.6 * s, 0.8 * s, 0);
        abdomen.scale.set(1.2, 0.8, 1.0);
        group.add(abdomen);

        // Thorax
        const thorax = new THREE.Mesh(
            new THREE.SphereGeometry(0.4 * s, 8, 8),
            bodyMat.clone()
        );
        thorax.position.set(0.2 * s, 0.7 * s, 0);
        group.add(thorax);

        // Head
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.3 * s, 8, 8),
            bodyMat.clone()
        );
        head.position.set(0.7 * s, 0.7 * s, 0);
        group.add(head);

        // Eyes (8 eyes - multiple red dots)
        for (let i = 0; i < 6; i++) {
            const eye = new THREE.Mesh(
                new THREE.SphereGeometry(0.04 * s, 4, 4),
                eyeMat
            );
            const angle = (i / 6) * Math.PI - Math.PI / 2;
            eye.position.set(
                0.9 * s,
                0.75 * s + Math.sin(angle) * 0.12 * s,
                Math.cos(angle) * 0.15 * s
            );
            group.add(eye);
        }

        // Fangs
        const fangMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const fangL = new THREE.Mesh(
            new THREE.ConeGeometry(0.04 * s, 0.2 * s, 4),
            fangMat
        );
        fangL.position.set(0.95 * s, 0.5 * s, 0.08 * s);
        fangL.rotation.z = Math.PI;
        group.add(fangL);
        const fangR = fangL.clone();
        fangR.position.z = -0.08 * s;
        group.add(fangR);

        // 8 Legs
        this.legs = [];
        for (let i = 0; i < 8; i++) {
            const side = i < 4 ? 1 : -1;
            const idx = i % 4;

            const legGroup = new THREE.Group();

            // Upper segment
            const upper = new THREE.Mesh(
                new THREE.BoxGeometry(0.06 * s, 0.8 * s, 0.06 * s),
                legMat
            );
            upper.position.y = 0.4 * s;
            upper.rotation.z = side * 0.5;
            legGroup.add(upper);

            // Lower segment
            const lower = new THREE.Mesh(
                new THREE.BoxGeometry(0.04 * s, 0.7 * s, 0.04 * s),
                legMat
            );
            lower.position.set(side * 0.5 * s, 0.1 * s, 0);
            lower.rotation.z = -side * 0.3;
            legGroup.add(lower);

            legGroup.position.set(
                -0.2 * s + idx * 0.3 * s,
                0.5 * s,
                side * 0.3 * s
            );
            group.add(legGroup);
            this.legs.push(legGroup);
        }

        // Hair texture on body
        const hairMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
        for (let i = 0; i < 8; i++) {
            const hair = new THREE.Mesh(
                new THREE.BoxGeometry(0.02 * s, 0.15 * s, 0.02 * s),
                hairMat
            );
            hair.position.set(
                -0.6 * s + Math.random() * 0.8 * s,
                1.0 * s + Math.random() * 0.15 * s,
                (Math.random() - 0.5) * 0.6 * s
            );
            hair.rotation.set(Math.random() * 0.5, 0, Math.random() * 0.5);
            group.add(hair);
        }

        return group;
    }

    buildSerpent() {
        const group = new THREE.Group();
        const s = this.config.scale;
        const bodyMat = new THREE.MeshLambertMaterial({ color: this.config.color });
        const patternMat = new THREE.MeshLambertMaterial({ color: 0x664422 });
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const tongueMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });

        // Body segments (coiled)
        this.bodySegments = [];
        const segCount = 12;
        for (let i = 0; i < segCount; i++) {
            const t = i / segCount;
            const radius = 0.25 * s * (1 - t * 0.4);
            const seg = new THREE.Mesh(
                new THREE.SphereGeometry(radius, 6, 6),
                i % 3 === 0 ? patternMat : bodyMat
            );
            // Coiled position
            const coilAngle = t * Math.PI * 3;
            const coilRadius = 0.8 * s * (1 - t * 0.3);
            seg.position.set(
                Math.cos(coilAngle) * coilRadius,
                0.3 * s + t * 1.5 * s,
                Math.sin(coilAngle) * coilRadius
            );
            seg.scale.set(1, 0.7, 1.3);
            group.add(seg);
            this.bodySegments.push(seg);
        }

        // Head
        const head = new THREE.Mesh(
            new THREE.BoxGeometry(0.4 * s, 0.2 * s, 0.35 * s),
            bodyMat.clone()
        );
        head.position.set(0, 2.0 * s, 0);
        group.add(head);
        this.head = head;

        // Hood (cobra-like)
        const hood = new THREE.Mesh(
            new THREE.BoxGeometry(0.1 * s, 0.5 * s, 0.6 * s),
            bodyMat.clone()
        );
        hood.position.set(-0.1 * s, 1.8 * s, 0);
        group.add(hood);

        // Eyes
        const eyeL = new THREE.Mesh(
            new THREE.SphereGeometry(0.04 * s, 4, 4),
            eyeMat
        );
        eyeL.position.set(0.18 * s, 2.05 * s, 0.12 * s);
        group.add(eyeL);
        const eyeR = eyeL.clone();
        eyeR.position.z = -0.12 * s;
        group.add(eyeR);

        // Tongue
        const tongue = new THREE.Mesh(
            new THREE.BoxGeometry(0.25 * s, 0.015 * s, 0.02 * s),
            tongueMat
        );
        tongue.position.set(0.33 * s, 2.0 * s, 0);
        group.add(tongue);
        this.tongue = tongue;

        // Forked tip
        const fork1 = new THREE.Mesh(
            new THREE.BoxGeometry(0.08 * s, 0.01 * s, 0.02 * s),
            tongueMat
        );
        fork1.position.set(0.48 * s, 2.01 * s, 0.02 * s);
        fork1.rotation.y = 0.3;
        group.add(fork1);
        const fork2 = fork1.clone();
        fork2.position.z = -0.02 * s;
        fork2.rotation.y = -0.3;
        group.add(fork2);

        return group;
    }

    createHealthBar() {
        const g = new THREE.Group();
        const bg = new THREE.Mesh(
            new THREE.PlaneGeometry(1.5, 0.12),
            new THREE.MeshBasicMaterial({ color: 0x222222, transparent: true, opacity: 0.8 })
        );
        g.add(bg);
        const fill = new THREE.Mesh(
            new THREE.PlaneGeometry(1.5, 0.12),
            new THREE.MeshBasicMaterial({ color: 0xff6633 })
        );
        fill.position.z = 0.01;
        g.add(fill);
        this.healthBarFill = fill;
        g.position.y = 2.5;
        return g;
    }

    randomPatrolPoint() {
        return new THREE.Vector3(
            this.homePosition.x + (Math.random() - 0.5) * this.roamRadius,
            0,
            this.homePosition.z + (Math.random() - 0.5) * this.roamRadius
        );
    }

    update(playerPosition, delta) {
        if (!this.alive) return;

        const time = Date.now() * 0.005;
        const distToPlayer = this.mesh.position.distanceTo(
            new THREE.Vector3(playerPosition.x, this.mesh.position.y, playerPosition.z)
        );

        // Animation
        if (this.type === 'crocodile') {
            // Tail wag
            if (this.tail) this.tail.rotation.y = Math.sin(time * 3) * 0.3;
            // Jaw snap when attacking
            if (this.jaw && this.state === 'attack') {
                this.jaw.position.y = 0.3 * this.config.scale + Math.sin(time * 15) * 0.08;
            }
            // Leg walk
            if (this.legs) {
                this.legs.forEach((leg, i) => {
                    leg.rotation.x = Math.sin(time * 4 + i * Math.PI / 2) * 0.3;
                });
            }
        } else if (this.type === 'spider') {
            // Leg movement
            if (this.legs) {
                this.legs.forEach((leg, i) => {
                    leg.rotation.x = Math.sin(time * 6 + i * Math.PI / 4) * 0.2;
                    leg.rotation.z = Math.sin(time * 3 + i) * 0.1;
                });
            }
        } else if (this.type === 'bird') {
            // Wing flapping
            if (this.wingL && this.wingR) {
                const flapAmount = Math.sin(time * 8) * 0.5;
                this.wingL.rotation.x = 0.5 + flapAmount;
                this.wingR.rotation.x = 0.5 + flapAmount;
            }
            // Fly in circles and figure-8 patterns
            const flightRadius = 6;
            const flightAngle = time * 0.5;
            const verticalBob = Math.sin(time * 1.5) * 0.5;
            this.mesh.position.x = this.homePosition.x + Math.cos(flightAngle) * flightRadius;
            this.mesh.position.y = 3 + verticalBob;
            this.mesh.position.z = this.homePosition.z + Math.sin(flightAngle * 2) * flightRadius;
            // Face flight direction
            this.mesh.rotation.y = flightAngle;
        }
        } else if (this.type === 'serpent') {
            // Body sway
            if (this.bodySegments) {
                this.bodySegments.forEach((seg, i) => {
                    const t = i / this.bodySegments.length;
                    seg.position.x += Math.sin(time * 2 + i * 0.5) * 0.005;
                    seg.position.z += Math.cos(time * 2 + i * 0.5) * 0.005;
                });
            }
            // Head bob
            if (this.head) {
                this.head.rotation.y = Math.sin(time * 3) * 0.3;
                this.head.position.y = 2.0 * this.config.scale + Math.sin(time * 2) * 0.15;
            }
            // Tongue flick
            if (this.tongue) {
                const flickPhase = time % 4 < 0.5;
                this.tongue.scale.x = flickPhase ? 1 + Math.sin(time * 20) * 0.3 : 0.5;
            }
        }

        // AI
        if (distToPlayer < this.alertDistance) {
            this.state = 'attack';
        } else if (distToPlayer > this.alertDistance * 2) {
            this.state = 'idle';
        }

        let targetPos;
        if (this.state === 'attack') {
            targetPos = new THREE.Vector3(playerPosition.x, 0, playerPosition.z);
        } else {
            targetPos = this.patrolTarget;
            const distToTarget = new THREE.Vector2(
                this.mesh.position.x - targetPos.x,
                this.mesh.position.z - targetPos.z
            ).length();
            if (distToTarget < 2) {
                this.patrolTarget = this.randomPatrolPoint();
            }
        }

        // Move
        const dir = new THREE.Vector3(
            targetPos.x - this.mesh.position.x,
            0,
            targetPos.z - this.mesh.position.z
        ).normalize();

        this.mesh.position.x += dir.x * this.config.speed;
        this.mesh.position.z += dir.z * this.config.speed;

        // Face direction
        const angle = Math.atan2(dir.x, dir.z);
        this.mesh.rotation.y = angle;

        // Health bar
        this.healthBar.lookAt(playerPosition);
        const hpFrac = this.health / this.maxHealth;
        this.healthBarFill.scale.x = Math.max(0.001, hpFrac);
        this.healthBarFill.position.x = -(1 - hpFrac) * 0.75;
    }

    attack(playerPosition) {
        const now = Date.now();
        if (now - this.lastAttackTime < this.config.attackRate) return 0;
        const dist = this.mesh.position.distanceTo(
            new THREE.Vector3(playerPosition.x, this.mesh.position.y, playerPosition.z)
        );
        if (dist > this.config.attackRange) return 0;
        this.lastAttackTime = now;
        return this.config.damage;
    }

    takeDamage(amount) {
        if (!this.alive) return;
        this.health -= amount;
        // Flash
        this.mesh.children.forEach(child => {
            if (child.material && child.material.emissive) {
                child.material.emissive.setHex(0xff0000);
                setTimeout(() => {
                    if (child.material) child.material.emissive.setHex(0x000000);
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

        // Fade and remove
        const parts = [];
        this.mesh.children.forEach(child => {
            if (child.isMesh) {
                const worldPos = new THREE.Vector3();
                child.getWorldPosition(worldPos);
                const part = child.clone();
                part.position.copy(worldPos);
                part.velocity = new THREE.Vector3(
                    (Math.random() - 0.5) * 0.3,
                    Math.random() * 0.2 + 0.05,
                    (Math.random() - 0.5) * 0.3
                );
                this.scene.add(part);
                parts.push(part);
            }
        });

        this.scene.remove(this.mesh);

        let frame = 0;
        const animate = () => {
            frame++;
            parts.forEach(p => {
                p.position.add(p.velocity);
                p.velocity.y -= 0.008;
                if (p.position.y < 0) {
                    p.position.y = 0;
                    p.velocity.y *= -0.2;
                }
            });
            if (frame < 80) requestAnimationFrame(animate);
            else parts.forEach(p => this.scene.remove(p));
        };
        animate();
    }
}

class CreatureManager {
    constructor(scene) {
        this.scene = scene;
        this.creatures = [];
    }

    spawnInBuilding(buildingPosition) {
        const types = ['crocodile', 'spider', 'serpent', 'bird', 'bird'];
        const type = types[Math.floor(Math.random() * types.length)];
        const pos = new THREE.Vector3(
            buildingPosition.x + (Math.random() - 0.5) * 4,
            0,
            buildingPosition.z + (Math.random() - 0.5) * 4
        );
        const creature = new Creature(type, pos, this.scene, buildingPosition);
        this.creatures.push(creature);
        return creature;
    }

    update(playerPosition, delta) {
        for (const c of this.creatures) {
            c.update(playerPosition, delta);
        }
    }

    checkPlayerDamage(playerPosition, playerRadius) {
        let totalDamage = 0;
        for (const c of this.creatures) {
            if (!c.alive) continue;
            totalDamage += c.attack(playerPosition);
        }
        return totalDamage;
    }

    getAliveCreatures() {
        return this.creatures.filter(c => c.alive);
    }
}
