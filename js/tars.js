/* ============================================
   TARS COMPANION ROBOT
   Modeled after TARS from Interstellar (2014)
   Rectangular monolith with articulated slabs
   Called by player to assist in combat
   ============================================ */

class TarsRobot {
    constructor(scene) {
        this.scene = scene;
        this.active = false;
        this.health = 500;
        this.maxHealth = 500;
        this.speed = 0.2;
        this.state = 'idle'; // idle, following, combat, arriving
        this.targetPosition = null;
        this.playerPosition = new THREE.Vector3();

        // Combat
        this.attackDamage = 60;
        this.attackRange = 8;
        this.attackRate = 1500;
        this.lastAttackTime = 0;
        this.slamCooldown = 8000;
        this.lastSlamTime = 0;
        this.shieldActive = false;
        this.shieldCooldown = 15000;
        this.lastShieldTime = 0;
        this.shieldDuration = 5000;

        // Animation
        this.walkCycle = 0;
        this.deployProgress = 0;
        this.isDeploying = false;

        this.mesh = null;
        this.shieldMesh = null;
    }

    buildMesh() {
        const group = new THREE.Group();

        // ===== TARS DESIGN =====
        // TARS is composed of 4 main vertical rectangular slabs
        // arranged side-by-side. They can split apart for walking.
        // Main dimensions: ~2m tall, ~0.5m wide total, ~0.15m deep
        // Color: brushed titanium/silver gray

        const slabMat = new THREE.MeshLambertMaterial({ color: 0xAAAAAA });
        const darkSlabMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
        const accentMat = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const screenMat = new THREE.MeshBasicMaterial({ color: 0x224488, transparent: true, opacity: 0.8 });
        const jointMat = new THREE.MeshLambertMaterial({ color: 0x555555 });

        // TARS height
        const totalH = 4.0;
        const slabW = 0.35;
        const slabD = 0.25;
        const gap = 0.04;

        // === SLAB 1 (leftmost - becomes left leg) ===
        this.slab1 = new THREE.Group();
        const s1Upper = new THREE.Mesh(
            new THREE.BoxGeometry(slabW, totalH * 0.5, slabD),
            slabMat
        );
        s1Upper.position.y = totalH * 0.75;
        this.slab1.add(s1Upper);

        const s1Lower = new THREE.Mesh(
            new THREE.BoxGeometry(slabW, totalH * 0.5, slabD),
            darkSlabMat
        );
        s1Lower.position.y = totalH * 0.25;
        this.slab1.add(s1Lower);

        // Joint line
        const j1 = new THREE.Mesh(
            new THREE.BoxGeometry(slabW + 0.02, 0.03, slabD + 0.02),
            jointMat
        );
        j1.position.y = totalH * 0.5;
        this.slab1.add(j1);

        // Subtle panel lines
        for (let i = 0; i < 3; i++) {
            const line = new THREE.Mesh(
                new THREE.BoxGeometry(slabW + 0.01, 0.01, 0.01),
                accentMat
            );
            line.position.set(0, totalH * 0.2 + i * totalH * 0.25, -slabD / 2 - 0.005);
            this.slab1.add(line);
        }

        this.slab1.position.x = -(slabW * 1.5 + gap * 1.5);
        group.add(this.slab1);

        // === SLAB 2 (inner left - body) ===
        this.slab2 = new THREE.Group();
        const s2 = new THREE.Mesh(
            new THREE.BoxGeometry(slabW, totalH, slabD),
            slabMat.clone()
        );
        s2.position.y = totalH * 0.5;
        this.slab2.add(s2);

        // Screen / display (the "face")
        const screen = new THREE.Mesh(
            new THREE.PlaneGeometry(slabW * 0.7, totalH * 0.08),
            screenMat
        );
        screen.position.set(0, totalH * 0.82, -slabD / 2 - 0.01);
        this.slab2.add(screen);
        this.screen = screen;

        // Screen glow
        const screenGlow = new THREE.Mesh(
            new THREE.PlaneGeometry(slabW * 0.8, totalH * 0.1),
            new THREE.MeshBasicMaterial({ color: 0x224488, transparent: true, opacity: 0.15 })
        );
        screenGlow.position.set(0, totalH * 0.82, -slabD / 2 - 0.015);
        this.slab2.add(screenGlow);

        // Joint lines on slab 2
        const j2a = new THREE.Mesh(
            new THREE.BoxGeometry(slabW + 0.02, 0.03, slabD + 0.02),
            jointMat
        );
        j2a.position.y = totalH * 0.33;
        this.slab2.add(j2a);
        const j2b = new THREE.Mesh(
            new THREE.BoxGeometry(slabW + 0.02, 0.03, slabD + 0.02),
            jointMat
        );
        j2b.position.y = totalH * 0.66;
        this.slab2.add(j2b);

        // Panel details
        for (let i = 0; i < 4; i++) {
            const detail = new THREE.Mesh(
                new THREE.BoxGeometry(slabW * 0.15, 0.015, 0.015),
                accentMat
            );
            detail.position.set(
                slabW * 0.2,
                totalH * 0.15 + i * totalH * 0.18,
                -slabD / 2 - 0.005
            );
            this.slab2.add(detail);
        }

        this.slab2.position.x = -(slabW * 0.5 + gap * 0.5);
        group.add(this.slab2);

        // === SLAB 3 (inner right - body) ===
        this.slab3 = new THREE.Group();
        const s3 = new THREE.Mesh(
            new THREE.BoxGeometry(slabW, totalH, slabD),
            slabMat.clone()
        );
        s3.position.y = totalH * 0.5;
        this.slab3.add(s3);

        // Joint lines
        const j3a = new THREE.Mesh(
            new THREE.BoxGeometry(slabW + 0.02, 0.03, slabD + 0.02),
            jointMat
        );
        j3a.position.y = totalH * 0.33;
        this.slab3.add(j3a);
        const j3b = new THREE.Mesh(
            new THREE.BoxGeometry(slabW + 0.02, 0.03, slabD + 0.02),
            jointMat
        );
        j3b.position.y = totalH * 0.66;
        this.slab3.add(j3b);

        // Small indicator lights
        const indicatorMat = new THREE.MeshBasicMaterial({ color: 0x44aaff });
        for (let i = 0; i < 3; i++) {
            const indicator = new THREE.Mesh(
                new THREE.BoxGeometry(0.03, 0.03, 0.01),
                indicatorMat
            );
            indicator.position.set(
                -slabW * 0.25 + i * slabW * 0.25,
                totalH * 0.85,
                -slabD / 2 - 0.005
            );
            this.slab3.add(indicator);
        }
        this.indicators = this.slab3.children.filter(c =>
            c.material && c.material.color && c.material.color.getHex() === 0x44aaff
        );

        this.slab3.position.x = (slabW * 0.5 + gap * 0.5);
        group.add(this.slab3);

        // === SLAB 4 (rightmost - becomes right leg) ===
        this.slab4 = new THREE.Group();
        const s4Upper = new THREE.Mesh(
            new THREE.BoxGeometry(slabW, totalH * 0.5, slabD),
            slabMat.clone()
        );
        s4Upper.position.y = totalH * 0.75;
        this.slab4.add(s4Upper);

        const s4Lower = new THREE.Mesh(
            new THREE.BoxGeometry(slabW, totalH * 0.5, slabD),
            darkSlabMat.clone()
        );
        s4Lower.position.y = totalH * 0.25;
        this.slab4.add(s4Lower);

        // Joint
        const j4 = new THREE.Mesh(
            new THREE.BoxGeometry(slabW + 0.02, 0.03, slabD + 0.02),
            jointMat
        );
        j4.position.y = totalH * 0.5;
        this.slab4.add(j4);

        // Panel lines
        for (let i = 0; i < 3; i++) {
            const line = new THREE.Mesh(
                new THREE.BoxGeometry(slabW + 0.01, 0.01, 0.01),
                accentMat
            );
            line.position.set(0, totalH * 0.2 + i * totalH * 0.25, -slabD / 2 - 0.005);
            this.slab4.add(line);
        }

        this.slab4.position.x = (slabW * 1.5 + gap * 1.5);
        group.add(this.slab4);

        // === Subtle engraving: "TARS" text (small box letters on slab2) ===
        const letterMat = new THREE.MeshBasicMaterial({ color: 0x334455 });
        const letterW = 0.04;
        const letterH = 0.06;
        const letterD = 0.005;
        const letterStartX = -0.08;
        const letterY = totalH * 0.72;
        const letterZ = -slabD / 2 - 0.006;

        // T
        this.slab2.add(this.makeTinyBox(letterStartX, letterY + letterH * 0.4, letterZ, letterW * 1.2, 0.01, letterD, letterMat));
        this.slab2.add(this.makeTinyBox(letterStartX, letterY, letterZ, 0.01, letterH, letterD, letterMat));
        // A
        this.slab2.add(this.makeTinyBox(letterStartX + 0.06, letterY, letterZ, 0.01, letterH, letterD, letterMat));
        this.slab2.add(this.makeTinyBox(letterStartX + 0.1, letterY, letterZ, 0.01, letterH, letterD, letterMat));
        this.slab2.add(this.makeTinyBox(letterStartX + 0.08, letterY + letterH * 0.4, letterZ, 0.04, 0.01, letterD, letterMat));
        this.slab2.add(this.makeTinyBox(letterStartX + 0.08, letterY + letterH * 0.1, letterZ, 0.04, 0.01, letterD, letterMat));
        // R
        this.slab2.add(this.makeTinyBox(letterStartX + 0.14, letterY, letterZ, 0.01, letterH, letterD, letterMat));
        this.slab2.add(this.makeTinyBox(letterStartX + 0.17, letterY + letterH * 0.4, letterZ, 0.04, 0.01, letterD, letterMat));
        this.slab2.add(this.makeTinyBox(letterStartX + 0.17, letterY + letterH * 0.1, letterZ, 0.04, 0.01, letterD, letterMat));
        this.slab2.add(this.makeTinyBox(letterStartX + 0.19, letterY + letterH * 0.25, letterZ, 0.01, letterH * 0.35, letterD, letterMat));
        // S
        this.slab2.add(this.makeTinyBox(letterStartX + 0.25, letterY + letterH * 0.4, letterZ, 0.04, 0.01, letterD, letterMat));
        this.slab2.add(this.makeTinyBox(letterStartX + 0.25, letterY + letterH * 0.1, letterZ, 0.04, 0.01, letterD, letterMat));
        this.slab2.add(this.makeTinyBox(letterStartX + 0.25, letterY - letterH * 0.1, letterZ, 0.04, 0.01, letterD, letterMat));
        this.slab2.add(this.makeTinyBox(letterStartX + 0.24, letterY + letterH * 0.25, letterZ, 0.01, letterH * 0.25, letterD, letterMat));
        this.slab2.add(this.makeTinyBox(letterStartX + 0.27, letterY, letterZ, 0.01, letterH * 0.25, letterD, letterMat));

        // Health bar
        this.healthBar = this.createHealthBar();
        this.healthBar.position.y = totalH + 0.5;
        group.add(this.healthBar);

        // Shield effect (invisible by default)
        const shieldGeo = new THREE.SphereGeometry(5, 16, 16);
        const shieldMatObj = new THREE.MeshBasicMaterial({
            color: 0x44aaff,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide,
            wireframe: true
        });
        this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMatObj);
        this.shieldMesh.position.y = 2;
        group.add(this.shieldMesh);

        // Voice indicator light (point light removed for performance)
        this.voiceLight = new THREE.Group();
        this.voiceLight.intensity = 0; // Mock property
        group.add(this.voiceLight);

        this.totalHeight = totalH;
        return group;
    }

    makeTinyBox(x, y, z, w, h, d, mat) {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
        mesh.position.set(x, y, z);
        return mesh;
    }

    createHealthBar() {
        const g = new THREE.Group();
        const bg = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 0.15),
            new THREE.MeshBasicMaterial({ color: 0x222222, transparent: true, opacity: 0.8 })
        );
        g.add(bg);
        const fill = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 0.15),
            new THREE.MeshBasicMaterial({ color: 0x44aaff })
        );
        fill.position.z = 0.01;
        g.add(fill);
        this.healthBarFill = fill;
        return g;
    }

    summon(playerPosition) {
        if (this.active) {
            this.dismiss();
            return;
        }

        this.active = true;
        this.health = this.maxHealth;
        this.state = 'arriving';
        this.isDeploying = true;
        this.deployProgress = 0;

        if (!this.mesh) {
            this.mesh = this.buildMesh();
        }

        // Arrive from the sky near player
        const spawnPos = new THREE.Vector3(
            playerPosition.x + (Math.random() - 0.5) * 10,
            20,
            playerPosition.z + (Math.random() - 0.5) * 10
        );
        this.mesh.position.copy(spawnPos);
        this.scene.add(this.mesh);

        this.targetPosition = new THREE.Vector3(
            playerPosition.x + 5,
            0,
            playerPosition.z + 5
        );

        // Arrival effect
        audioEngine.playEMP();

        // Show TARS message
        this.showMessage('TARS DEPLOYED - COMBAT READY');
    }

    dismiss() {
        this.active = false;
        this.state = 'idle';
        if (this.mesh) {
            this.scene.remove(this.mesh);
        }
        this.showMessage('TARS DISMISSED');
    }

    showMessage(text) {
        const msg = document.getElementById('tars-message');
        if (msg) {
            msg.textContent = text;
            msg.style.display = 'block';
            msg.style.animation = 'none';
            msg.offsetHeight;
            msg.style.animation = 'tarsMsg 3s ease forwards';
            setTimeout(() => { msg.style.display = 'none'; }, 3000);
        }
    }

    update(playerPosition, robots, creatures, delta) {
        if (!this.active || !this.mesh) return;

        const time = Date.now() * 0.001;
        this.playerPosition.copy(playerPosition);

        // === ARRIVING ANIMATION ===
        if (this.state === 'arriving') {
            this.mesh.position.y = Math.max(0, this.mesh.position.y - 0.3);
            if (this.mesh.position.y <= 0) {
                this.mesh.position.y = 0;
                this.state = 'following';
                this.isDeploying = false;
                // Ground impact
                audioEngine.playExplosion(0.3);
            }
            return;
        }

        // === WALKING ANIMATION ===
        // TARS walks by pivoting outer slabs like legs
        const moving = this.state === 'following' || this.state === 'combat';
        if (moving) {
            this.walkCycle += delta * 4;
            const swing = Math.sin(this.walkCycle * 5) * 0.2;

            // Outer slabs swing like legs
            this.slab1.rotation.x = swing;
            this.slab4.rotation.x = -swing;

            // Inner slabs have subtle bob
            this.slab2.position.y = Math.abs(Math.sin(this.walkCycle * 5)) * 0.05;
            this.slab3.position.y = Math.abs(Math.sin(this.walkCycle * 5)) * 0.05;
        } else {
            // Idle sway
            this.slab1.rotation.x *= 0.95;
            this.slab4.rotation.x *= 0.95;
        }

        // === SCREEN FLICKER ===
        if (this.screen) {
            const flicker = 0.6 + Math.sin(time * 8) * 0.2 + Math.sin(time * 23) * 0.1;
            this.screen.material.opacity = flicker;
        }

        // === INDICATOR LIGHTS ===
        if (this.indicators) {
            this.indicators.forEach((ind, i) => {
                if (ind.material && ind.material.color) {
                    const pulse = Math.sin(time * 3 + i * 2) > 0;
                    ind.material.opacity = pulse ? 1 : 0.3;
                }
            });
        }

        // === VOICE LIGHT ===
        this.voiceLight.intensity = this.state === 'combat' ?
            1 + Math.sin(time * 10) * 0.5 : 0.3 + Math.sin(time * 2) * 0.2;

        // === AI BEHAVIOR ===
        // Find nearest enemy
        let nearestEnemy = null;
        let nearestDist = Infinity;

        const allEnemies = [
            ...(robots || []),
            ...(creatures || [])
        ];

        for (const enemy of allEnemies) {
            if (!enemy.alive) continue;
            const d = this.mesh.position.distanceTo(enemy.mesh.position);
            if (d < nearestDist) {
                nearestDist = d;
                nearestEnemy = enemy;
            }
        }

        if (nearestEnemy && nearestDist < 30) {
            this.state = 'combat';
            // Move toward enemy
            const toEnemy = new THREE.Vector3(
                nearestEnemy.mesh.position.x - this.mesh.position.x,
                0,
                nearestEnemy.mesh.position.z - this.mesh.position.z
            ).normalize();

            if (nearestDist > this.attackRange) {
                this.mesh.position.x += toEnemy.x * this.speed;
                this.mesh.position.z += toEnemy.z * this.speed;
            }

            // Face enemy
            const angle = Math.atan2(toEnemy.x, toEnemy.z);
            this.mesh.rotation.y = angle;

            // Attack
            this.performAttack(nearestEnemy, nearestDist);
        } else {
            this.state = 'following';
            // Follow player
            const toPlayer = new THREE.Vector3(
                playerPosition.x - this.mesh.position.x,
                0,
                playerPosition.z - this.mesh.position.z
            );
            const distToPlayer = toPlayer.length();

            if (distToPlayer > 8) {
                toPlayer.normalize();
                this.mesh.position.x += toPlayer.x * this.speed;
                this.mesh.position.z += toPlayer.z * this.speed;

                const angle = Math.atan2(toPlayer.x, toPlayer.z);
                this.mesh.rotation.y = angle;
            }
        }

        // === SHIELD ABILITY ===
        if (this.shieldActive) {
            this.shieldMesh.material.opacity = 0.15 + Math.sin(time * 5) * 0.05;
            this.shieldMesh.rotation.y += 0.02;
            this.shieldMesh.rotation.x += 0.01;

            if (Date.now() - this.lastShieldTime > this.shieldDuration) {
                this.shieldActive = false;
                this.shieldMesh.material.opacity = 0;
            }
        }

        // === HEALTH BAR ===
        this.healthBar.lookAt(playerPosition);
        const hpFrac = this.health / this.maxHealth;
        this.healthBarFill.scale.x = Math.max(0.001, hpFrac);
        this.healthBarFill.position.x = -(1 - hpFrac);
    }

    performAttack(enemy, distance) {
        const now = Date.now();

        // Regular melee slam
        if (distance < this.attackRange && now - this.lastAttackTime > this.attackRate) {
            this.lastAttackTime = now;
            enemy.takeDamage(this.attackDamage);
            audioEngine.playHitMarker();
            this.createSlamEffect(enemy.mesh.position.clone());

            // TARS attack animation - slabs spread briefly
            this.animateAttack();
        }

        // Ground slam (AOE) - every slamCooldown
        if (now - this.lastSlamTime > this.slamCooldown) {
            this.lastSlamTime = now;
            this.groundSlam();
        }
    }

    animateAttack() {
        // Slabs spread apart briefly
        const origS1 = this.slab1.position.x;
        const origS4 = this.slab4.position.x;

        this.slab1.position.x -= 0.3;
        this.slab4.position.x += 0.3;

        setTimeout(() => {
            if (this.slab1) this.slab1.position.x = origS1;
            if (this.slab4) this.slab4.position.x = origS4;
        }, 200);
    }

    groundSlam() {
        // Powerful AOE attack
        const pos = this.mesh.position.clone();
        const slamRadius = 15;

        // Damage all enemies in radius
        // This will be called from game.js with enemy references
        this.pendingSlam = {
            position: pos,
            radius: slamRadius,
            damage: this.attackDamage * 2
        };

        audioEngine.playExplosion(0.8);

        // Visual effect - shockwave ring
        const ringGeo = new THREE.RingGeometry(0.1, 0.5, 24);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x44aaff,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.copy(pos);
        ring.position.y = 0.2;
        ring.rotation.x = -Math.PI / 2;
        this.scene.add(ring);

        // Light flash removed for performance
        // const flash = new THREE.PointLight(0x44aaff, 8, 25);
        // flash.position.copy(pos);
        // flash.position.y = 2;
        // this.scene.add(flash);

        let frame = 0;
        const animate = () => {
            frame++;
            const t = frame / 25;
            ring.scale.setScalar(1 + t * slamRadius * 2);
            ringMat.opacity = Math.max(0, 0.8 - t);
            flash.intensity = Math.max(0, 8 - t * 16);

            if (frame < 25) {
                requestAnimationFrame(animate);
            } else {
                this.scene.remove(ring);
            }
        };
        animate();

        this.showMessage('TARS: GROUND SLAM ACTIVATED');
    }

    activateShield() {
        if (!this.active) return;
        const now = Date.now();
        if (now - this.lastShieldTime < this.shieldCooldown + this.shieldDuration) return;

        this.shieldActive = true;
        this.lastShieldTime = now;
        audioEngine.playEMP();
        this.showMessage('TARS: ENERGY SHIELD ACTIVE');
    }

    isShielding(playerPosition) {
        if (!this.active || !this.shieldActive) return false;
        const dist = this.mesh.position.distanceTo(playerPosition);
        return dist < 6;
    }

    createSlamEffect(position) {
        // Sparks at impact point
        const sparks = [];
        for (let i = 0; i < 6; i++) {
            const geo = new THREE.SphereGeometry(0.08, 4, 4);
            const mat = new THREE.MeshBasicMaterial({
                color: new THREE.Color().setHSL(0.55, 1, 0.5 + Math.random() * 0.4)
            });
            const spark = new THREE.Mesh(geo, mat);
            spark.position.copy(position);
            spark.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.6,
                Math.random() * 0.4,
                (Math.random() - 0.5) * 0.6
            );
            this.scene.add(spark);
            sparks.push({ mesh: spark, material: mat });
        }

        let frame = 0;
        const animate = () => {
            frame++;
            sparks.forEach(s => {
                s.mesh.position.add(s.mesh.velocity);
                s.mesh.velocity.y -= 0.02;
            });
            if (frame < 20) requestAnimationFrame(animate);
            else sparks.forEach(s => this.scene.remove(s.mesh));
        };
        animate();
    }

    takeDamage(amount) {
        if (!this.active) return;
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.dismiss();
            this.showMessage('TARS: CRITICAL DAMAGE - RETREATING');
        }
    }

    processPendingSlam(robots, creatures) {
        if (!this.pendingSlam) return;

        const slam = this.pendingSlam;
        this.pendingSlam = null;

        const allEnemies = [...(robots || []), ...(creatures || [])];
        for (const enemy of allEnemies) {
            if (!enemy.alive) continue;
            const dist = enemy.mesh.position.distanceTo(slam.position);
            if (dist < slam.radius) {
                const falloff = 1 - (dist / slam.radius);
                enemy.takeDamage(slam.damage * falloff);
            }
        }
    }
}
