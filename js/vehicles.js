/* ============================================
   DRIVABLE VEHICLE SYSTEM
   Player can enter/exit and drive cars
   ============================================ */

class DrivableCar {
    constructor(position, scene) {
        this.scene = scene;
        this.speed = 0;
        this.maxSpeed = 25;         // units/sec
        this.acceleration = 18;
        this.brakeForce = 30;
        this.friction = 8;
        this.steerAngle = 0;
        this.steerSpeed = 0.08;
        this.maxSteer = 0.55;       // radians
        this.occupied = false;
        this.health = 100;

        this.mesh = this.buildCar();
        this.mesh.position.copy(position);
        this.mesh.position.y = 0;
        scene.add(this.mesh);

        this.interactRadius = 5;
    }

    buildCar() {
        const group = new THREE.Group();

        const paintColors = [0x2244aa, 0xaa2222, 0x22aa44, 0xdddd22, 0xcc6600, 0x8822cc];
        const paintColor = paintColors[Math.floor(Math.random() * paintColors.length)];
        const paintMat = new THREE.MeshLambertMaterial({ color: paintColor });
        const darkMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
        const chromeMat = new THREE.MeshLambertMaterial({ color: 0x999999 });
        const glassMat = new THREE.MeshLambertMaterial({ color: 0x112244, transparent: true, opacity: 0.45 });
        const interiorMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
        const seatMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });

        // CHASSIS
        const chassisGeo = new THREE.BoxGeometry(5.0, 0.5, 2.2);
        const chassis = new THREE.Mesh(chassisGeo, darkMat);
        chassis.position.y = 0.35;
        group.add(chassis);

        // BODY
        const bodyGeo = new THREE.BoxGeometry(4.6, 1.1, 2.1);
        const body = new THREE.Mesh(bodyGeo, paintMat);
        body.position.y = 1.15;
        group.add(body);

        // HOOD
        const hoodGeo = new THREE.BoxGeometry(1.4, 0.15, 2.0);
        const hood = new THREE.Mesh(hoodGeo, paintMat.clone());
        hood.position.set(1.8, 1.75, 0);
        group.add(hood);

        // TRUNK
        const trunkGeo = new THREE.BoxGeometry(0.9, 0.12, 2.0);
        const trunk = new THREE.Mesh(trunkGeo, paintMat.clone());
        trunk.position.set(-1.7, 1.75, 0);
        group.add(trunk);

        // CABIN
        const cabinGeo = new THREE.BoxGeometry(2.0, 1.0, 1.9);
        const cabin = new THREE.Mesh(cabinGeo, paintMat.clone());
        cabin.position.set(-0.1, 2.1, 0);
        group.add(cabin);

        // WINDSHIELD
        const wsGeo = new THREE.PlaneGeometry(1.85, 0.9);
        const ws = new THREE.Mesh(wsGeo, glassMat);
        ws.position.set(0.88, 2.15, 0);
        ws.rotation.y = Math.PI / 2;
        group.add(ws);

        // REAR WINDOW
        const rwGeo = new THREE.PlaneGeometry(1.85, 0.8);
        const rw = new THREE.Mesh(rwGeo, glassMat.clone());
        rw.position.set(-1.12, 2.15, 0);
        rw.rotation.y = -Math.PI / 2;
        group.add(rw);

        // SIDE WINDOWS
        const swGeo = new THREE.PlaneGeometry(1.8, 0.75);
        const swL = new THREE.Mesh(swGeo, glassMat.clone());
        swL.position.set(-0.1, 2.2, 0.96);
        group.add(swL);
        const swR = new THREE.Mesh(swGeo, glassMat.clone());
        swR.position.set(-0.1, 2.2, -0.96);
        swR.rotation.y = Math.PI;
        group.add(swR);

        // INTERIOR - Floor
        const floorGeo = new THREE.BoxGeometry(2.0, 0.05, 1.8);
        const floor = new THREE.Mesh(floorGeo, interiorMat);
        floor.position.set(-0.1, 1.65, 0);
        group.add(floor);

        // DRIVER SEAT
        const seatBase = new THREE.BoxGeometry(0.6, 0.15, 0.55);
        const seatBack = new THREE.BoxGeometry(0.1, 0.6, 0.55);
        const dSeat = new THREE.Mesh(seatBase, seatMat);
        dSeat.position.set(-0.2, 1.78, 0.4);
        group.add(dSeat);
        const dBack = new THREE.Mesh(seatBack, seatMat);
        dBack.position.set(-0.46, 2.1, 0.4);
        group.add(dBack);

        // PASSENGER SEAT
        const pSeat = new THREE.Mesh(seatBase.clone(), seatMat.clone());
        pSeat.position.set(-0.2, 1.78, -0.4);
        group.add(pSeat);
        const pBack = new THREE.Mesh(seatBack.clone(), seatMat.clone());
        pBack.position.set(-0.46, 2.1, -0.4);
        group.add(pBack);

        // STEERING WHEEL
        const steeringGeo = new THREE.TorusGeometry(0.18, 0.025, 6, 12);
        const steeringMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
        const steering = new THREE.Mesh(steeringGeo, steeringMat);
        steering.position.set(0.25, 2.05, 0.4);
        steering.rotation.y = Math.PI / 2;
        steering.rotation.x = Math.PI / 6;
        group.add(steering);
        this.steeringWheel = steering;

        // DASHBOARD
        const dashGeo = new THREE.BoxGeometry(0.3, 0.4, 1.8);
        const dash = new THREE.Mesh(dashGeo, interiorMat.clone());
        dash.position.set(0.55, 1.9, 0);
        group.add(dash);

        // HEADLIGHTS
        const hlGeo = new THREE.BoxGeometry(0.1, 0.25, 0.4);
        const hlMat = new THREE.MeshBasicMaterial({ color: 0xffffcc, transparent: true, opacity: 0.6 });
        const hlL = new THREE.Mesh(hlGeo, hlMat);
        hlL.position.set(2.52, 1.15, 0.65);
        group.add(hlL);
        const hlR = new THREE.Mesh(hlGeo, hlMat.clone());
        hlR.position.set(2.52, 1.15, -0.65);
        group.add(hlR);

        // TAILLIGHTS
        const tlGeo = new THREE.BoxGeometry(0.1, 0.2, 0.35);
        const tlMat = new THREE.MeshBasicMaterial({ color: 0xff2200, transparent: true, opacity: 0.7 });
        const tlL = new THREE.Mesh(tlGeo, tlMat);
        tlL.position.set(-2.52, 1.15, 0.55);
        group.add(tlL);
        const tlR = new THREE.Mesh(tlGeo, tlMat.clone());
        tlR.position.set(-2.52, 1.15, -0.55);
        group.add(tlR);

        // BUMPERS
        const bumpGeo = new THREE.BoxGeometry(0.15, 0.4, 2.2);
        const fb = new THREE.Mesh(bumpGeo, chromeMat);
        fb.position.set(2.56, 0.75, 0);
        group.add(fb);
        const rb = new THREE.Mesh(bumpGeo, chromeMat.clone());
        rb.position.set(-2.56, 0.75, 0);
        group.add(rb);

        // WHEELS
        const wheelPositions = [
            [1.5, 0.35, 1.15],
            [1.5, 0.35, -1.15],
            [-1.5, 0.35, 1.15],
            [-1.5, 0.35, -1.15]
        ];

        this.wheels = [];
        wheelPositions.forEach(pos => {
            const tireGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 14);
            const tire = new THREE.Mesh(tireGeo, darkMat);
            tire.rotation.x = Math.PI / 2;
            tire.position.set(...pos);
            group.add(tire);

            const rimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.32, 8);
            const rimMat = new THREE.MeshLambertMaterial({ color: 0xbbbbbb });
            const rim = new THREE.Mesh(rimGeo, rimMat);
            rim.rotation.x = Math.PI / 2;
            rim.position.set(...pos);
            group.add(rim);
            this.wheels.push(tire);
        });

        // Indicator: glowing ring under car when nearby
        const ringGeo = new THREE.RingGeometry(2.8, 3.2, 24);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.05;
        group.add(ring);
        this.indicatorRing = ring;
        this.indicatorMat = ringMat;

        // Headlight beams (when driving)
        this.headlightL = new THREE.SpotLight(0xffeedd, 0, 30, Math.PI / 5, 0.4, 2);
        this.headlightL.position.set(2.6, 1.15, 0.65);
        this.headlightL.target.position.set(12, 0, 0.65);
        group.add(this.headlightL);
        group.add(this.headlightL.target);

        this.headlightR = new THREE.SpotLight(0xffeedd, 0, 30, Math.PI / 5, 0.4, 2);
        this.headlightR.position.set(2.6, 1.15, -0.65);
        this.headlightR.target.position.set(12, 0, -0.65);
        group.add(this.headlightR);
        group.add(this.headlightR.target);

        return group;
    }

    enter() {
        this.occupied = true;
        this.headlightL.intensity = 3;
        this.headlightR.intensity = 3;
        this.indicatorMat.opacity = 0;
    }

    exit() {
        this.occupied = false;
        this.speed = 0;
        this.steerAngle = 0;
        this.headlightL.intensity = 0;
        this.headlightR.intensity = 0;
    }

    update(keys, delta) {
        if (!this.occupied) return;

        // Clamp delta to avoid huge jumps on lag spikes
        const dt = Math.min(delta, 0.05);

        // --- Throttle / Brake / Reverse ---
        if (keys['KeyW']) {
            this.speed += this.acceleration * dt;
        } else if (keys['KeyS']) {
            if (this.speed > 0.5) {
                // Engine braking first
                this.speed -= this.brakeForce * dt;
            } else {
                // Then reverse
                this.speed -= this.acceleration * 0.55 * dt;
            }
        }

        // Handbrake / Space
        if (keys['Space']) {
            if (this.speed > 0) {
                this.speed = Math.max(0, this.speed - this.brakeForce * 1.8 * dt);
            } else if (this.speed < 0) {
                this.speed = Math.min(0, this.speed + this.brakeForce * 1.8 * dt);
            }
        }

        // Natural friction / drag when no throttle
        if (!keys['KeyW'] && !keys['KeyS'] && !keys['Space']) {
            const frictionForce = this.friction * dt;
            if (Math.abs(this.speed) < frictionForce) {
                this.speed = 0;
            } else {
                this.speed -= Math.sign(this.speed) * frictionForce;
            }
        }

        // Clamp to max speed
        this.speed = Math.max(-this.maxSpeed * 0.45, Math.min(this.maxSpeed, this.speed));

        // --- Steering (speed-sensitive) ---
        const speedRatio = Math.abs(this.speed) / this.maxSpeed;
        // Less steering authority at high speed (realistic)
        const steerLimit = this.maxSteer * Math.max(0.25, 1 - speedRatio * 0.6);

        let targetSteer = 0;
        if (keys['KeyA']) targetSteer =  steerLimit;
        if (keys['KeyD']) targetSteer = -steerLimit;

        // Smooth steering input
        this.steerAngle += (targetSteer - this.steerAngle) * Math.min(1, 8 * dt);

        // --- Yaw (turn car body) ---
        if (Math.abs(this.speed) > 0.2) {
            const turnDir = this.speed > 0 ? 1 : -1;
            // Turning rate proportional to speed but capped
            const turnRate = this.steerAngle * Math.min(1.0, Math.abs(this.speed) / 6) * turnDir;
            this.mesh.rotation.y += turnRate * dt;
        }

        // --- Move car forward along its heading ---
        const heading = this.mesh.rotation.y;
        this.mesh.position.x += Math.sin(heading) * this.speed * dt;
        this.mesh.position.z += Math.cos(heading) * this.speed * dt;
        this.mesh.position.y = 0; // keep on ground

        // --- Wheel spin (rotate around local X axis) ---
        const wheelRadius = 0.4;
        const spinRate = (this.speed * dt) / wheelRadius; // radians
        this.wheels.forEach(w => {
            w.rotation.y += spinRate; // wheels were built with rotation.x=PI/2 so local Y = world X
        });

        // --- Steering wheel visual ---
        if (this.steeringWheel) {
            this.steeringWheel.rotation.z = -this.steerAngle * 3;
        }

        // --- World bounds ---
        const halfWorld = 395;
        this.mesh.position.x = Math.max(-halfWorld, Math.min(halfWorld, this.mesh.position.x));
        this.mesh.position.z = Math.max(-halfWorld, Math.min(halfWorld, this.mesh.position.z));

        const pos = new THREE.Vector3(0, 2.5, 0);
        pos.applyQuaternion(this.mesh.quaternion);
        pos.add(this.mesh.position);
        return pos;
    }

    getExitPosition() {
        const offset = new THREE.Vector3(0, 0, 3);
        offset.applyQuaternion(this.mesh.quaternion);
        offset.add(this.mesh.position);
        offset.y = 3;
        return offset;
    }

    getCameraPosition() {
        const offset = new THREE.Vector3(-8, 5, 0);
        offset.applyQuaternion(this.mesh.quaternion);
        offset.add(this.mesh.position);
        return offset;
    }

    getCameraLookAt() {
        const target = new THREE.Vector3(5, 2, 0);
        target.applyQuaternion(this.mesh.quaternion);
        target.add(this.mesh.position);
        return target;
    }

    showIndicator(playerPos) {
        if (this.occupied) return;
        const dist = this.mesh.position.distanceTo(
            new THREE.Vector3(playerPos.x, this.mesh.position.y, playerPos.z)
        );
        if (dist < this.interactRadius) {
            this.indicatorMat.opacity = 0.3 + Math.sin(Date.now() * 0.005) * 0.15;
        } else {
            this.indicatorMat.opacity = 0;
        }
    }

    isNear(playerPos) {
        const dist = this.mesh.position.distanceTo(
            new THREE.Vector3(playerPos.x, this.mesh.position.y, playerPos.z)
        );
        return dist < this.interactRadius;
    }
}

class DrivablePlane {
    constructor(position, scene) {
        this.scene = scene;
        this.isPlane = true;

        // Speed in units/sec
        this.speed = 0;
        this.maxSpeed = 120;
        this.minFlySpeed = 35;    // must exceed this to take off
        this.acceleration = 28;
        this.dragCoeff = 0.18;    // aerodynamic drag

        // Flight state
        this.pitchRate = 0;       // deg/sec angular velocity
        this.rollRate  = 0;
        this.yawRate   = 0;
        this.altitude  = 1.0;
        this.onGround  = true;
        this.liftFactor = 0.0;    // 0..1

        this.occupied = false;

        this.mesh = this.buildPlane();
        this.mesh.position.copy(position);
        this.mesh.position.y = 1.0;
        scene.add(this.mesh);

        this.interactRadius = 10;
        this.forwardVector = new THREE.Vector3(0, 0, 1);
    }
    
    buildPlane() {
        const group = new THREE.Group();
        const mat = new THREE.MeshLambertMaterial({ color: 0xcccccc });
        const darkMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const glassMat = new THREE.MeshLambertMaterial({ color: 0x223355, transparent: true, opacity: 0.6 });
        
        // Fuselage
        const fuselageGeo = new THREE.CylinderGeometry(0.8, 0.6, 6, 12);
        const fuselage = new THREE.Mesh(fuselageGeo, mat);
        fuselage.rotation.x = Math.PI / 2;
        group.add(fuselage);
        
        // Cockpit
        const cockpit = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.0, 1.8), glassMat);
        cockpit.position.set(0, 0.6, 0.5);
        group.add(cockpit);
        
        // Wings
        const wingGeo = new THREE.BoxGeometry(10, 0.2, 1.5);
        const wings = new THREE.Mesh(wingGeo, mat);
        wings.position.set(0, 0, 0.5);
        group.add(wings);
        
        // Elevator (Back horizontal tail)
        const elevatorGeo = new THREE.BoxGeometry(3, 0.1, 0.8);
        const elevator = new THREE.Mesh(elevatorGeo, mat);
        elevator.position.set(0, 0, -2.5);
        group.add(elevator);
        
        // Rudder (Back vertical tail)
        const rudderGeo = new THREE.BoxGeometry(0.1, 1.5, 1);
        const rudder = new THREE.Mesh(rudderGeo, mat);
        rudder.position.set(0, 0.8, -2.5);
        group.add(rudder);
        
        // Front Propeller Ring / Engine
        const engine = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.8, 1, 12), darkMat);
        engine.rotation.x = Math.PI / 2;
        engine.position.z = 2.8;
        group.add(engine);

        // Propeller
        this.propeller = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.1, 0.2), darkMat);
        this.propeller.position.z = 3.4;
        group.add(this.propeller);
        
        this.indicatorMat = new THREE.MeshBasicMaterial({ color: 0x00aaff, transparent: true, opacity: 0, wireframe: true });
        const ring = new THREE.Mesh(new THREE.TorusGeometry(3.5, 0.1, 8, 24), this.indicatorMat);
        ring.rotation.x = Math.PI / 2;
        group.add(ring);
        
        return group;
    }
    
    enter() {
        this.occupied = true;
        this.indicatorMat.opacity = 0;
    }
    exit() {
        this.occupied = false;
        this.speed = 0;
        this.pitchRate = 0;
        this.rollRate  = 0;
        this.yawRate   = 0;
    }
    
    update(keys, delta) {
        const dt = Math.min(delta, 0.05);

        if (!this.occupied) {
            // Passive descent when no pilot
            if (this.mesh.position.y > 1.0) {
                this.mesh.position.y -= 10 * dt;
                if (this.mesh.position.y < 1.0) {
                    this.mesh.position.y = 1.0;
                    // Flatten orientation
                    const e = new THREE.Euler().setFromQuaternion(this.mesh.quaternion, 'YXZ');
                    e.x = 0; e.z = 0;
                    this.mesh.quaternion.setFromEuler(e);
                }
            }
            this.propeller.rotation.z -= this.speed * dt * 0.3;
            this.speed = Math.max(0, this.speed - 20 * dt);
            return;
        }

        // ===== THRUST =====
        const throttleOn = keys['ShiftLeft'] || keys['ShiftRight'] || keys['KeyW'];
        if (throttleOn) {
            this.speed += this.acceleration * dt;
        } else if (keys['Space']) {
            // Throttle cut / spoilers
            this.speed = Math.max(0, this.speed - this.acceleration * 2 * dt);
        }
        // Aerodynamic drag (quadratic)
        this.speed -= this.dragCoeff * this.speed * this.speed * dt * 0.01;
        this.speed = Math.max(0, Math.min(this.maxSpeed, this.speed));

        // Propeller spin — proportional to speed
        this.propeller.rotation.z -= this.speed * dt * 0.5;

        // Lift factor: 0 on ground, 1 when above minFlySpeed
        this.liftFactor = Math.min(1, Math.max(0, (this.speed - this.minFlySpeed * 0.6) / (this.minFlySpeed * 0.4)));
        this.onGround = this.mesh.position.y <= 1.05 && this.speed < this.minFlySpeed;

        // ===== FLIGHT CONTROLS =====
        const controlAuth = this.liftFactor; // no authority at low speed

        // Pitch (nose up/down) — Arrow keys or W/S when airborne
        const pitchInput = (keys['ArrowUp'] ? 1 : 0) - (keys['ArrowDown'] ? 1 : 0);
        this.pitchRate += pitchInput * 45 * controlAuth * dt;   // deg-like rate
        this.pitchRate *= Math.pow(0.85, dt * 60);              // damp toward 0

        // Roll (bank) — A/D keys
        const rollInput = (keys['KeyA'] ? 1 : 0) - (keys['KeyD'] ? 1 : 0);
        this.rollRate += rollInput * 70 * controlAuth * dt;
        this.rollRate *= Math.pow(0.80, dt * 60);

        // Coordinated turn: yaw follows roll (like a real plane)
        const euler = new THREE.Euler().setFromQuaternion(this.mesh.quaternion, 'YXZ');
        const currentRoll = euler.z;
        this.yawRate = -currentRoll * this.liftFactor * 0.6; // bank to turn

        // Apply angular velocities to quaternion
        if (this.liftFactor > 0.01) {
            this.mesh.rotateX(THREE.MathUtils.degToRad(this.pitchRate) * dt);
            this.mesh.rotateZ(THREE.MathUtils.degToRad(this.rollRate)  * dt);
            this.mesh.rotateY(this.yawRate * dt);
        }

        // ===== GROUND TAXI STEERING =====
        if (this.onGround) {
            const taxiSteer = (keys['KeyA'] ? 1 : 0) - (keys['KeyD'] ? 1 : 0);
            this.mesh.rotation.y += taxiSteer * 0.02 * (this.speed / 10) * dt * 60;
            // Level the aircraft while on ground
            this.mesh.quaternion.slerp(
                new THREE.Quaternion().setFromEuler(new THREE.Euler(0, this.mesh.rotation.y, 0, 'YXZ')),
                Math.min(1, 6 * dt)
            );
        }

        // ===== LIFT / GRAVITY =====
        const gravity = 20; // units/sec²
        const lift = this.liftFactor * gravity * 1.05; // slightly more lift than gravity when flying

        if (!this.onGround) {
            // Net vertical acceleration from lift vs gravity
            // Pitch nose up → climb, nose down → dive
            const pitchEuler = new THREE.Euler().setFromQuaternion(this.mesh.quaternion, 'YXZ');
            const climbFactor = -Math.sin(pitchEuler.x); // positive when nose up
            const vertAcc = (lift - gravity) + climbFactor * this.speed * 0.4;
            this.mesh.position.y += vertAcc * dt;
        }

        // ===== FORWARD MOVEMENT =====
        this.mesh.translateZ(this.speed * dt);

        // ===== GROUND CLAMP =====
        if (this.mesh.position.y < 1.0) {
            this.mesh.position.y = 1.0;
            // Kill downward pitch on touchdown
            const e = new THREE.Euler().setFromQuaternion(this.mesh.quaternion, 'YXZ');
            if (e.x > 0) e.x = Math.max(0, e.x - 2 * dt); // gently flatten nose
            e.z *= 0.85; // reduce roll
            this.mesh.quaternion.setFromEuler(e);
        }

        // ===== WORLD BOUNDS =====
        const halfWorld = 395;
        this.mesh.position.x = Math.max(-halfWorld, Math.min(halfWorld, this.mesh.position.x));
        this.mesh.position.z = Math.max(-halfWorld, Math.min(halfWorld, this.mesh.position.z));
    }

    getDriverPosition() {
        const pos = new THREE.Vector3(0, 1.0, 0);
        pos.applyQuaternion(this.mesh.quaternion);
        pos.add(this.mesh.position);
        return pos;
    }
    
    getExitPosition() {
        const offset = new THREE.Vector3(3, 0, 0);
        offset.applyQuaternion(this.mesh.quaternion);
        offset.add(this.mesh.position);
        offset.y = 3;
        return offset;
    }
    
    getCameraPosition() {
        const offset = new THREE.Vector3(0, 4, -12);
        offset.applyQuaternion(this.mesh.quaternion);
        offset.add(this.mesh.position);
        return offset;
    }
    
    getCameraLookAt() {
        const target = new THREE.Vector3(0, 0, 10);
        target.applyQuaternion(this.mesh.quaternion);
        target.add(this.mesh.position);
        return target;
    }

    showIndicator(playerPos) {
        if (this.occupied) return;
        const dist = this.mesh.position.distanceTo(playerPos);
        if (dist < this.interactRadius) {
            this.indicatorMat.opacity = 0.3 + Math.sin(Date.now() * 0.005) * 0.15;
        } else {
            this.indicatorMat.opacity = 0;
        }
    }
    
    isNear(playerPos) {
        return this.mesh.position.distanceTo(playerPos) < this.interactRadius;
    }
}

class VehicleManager {
    constructor(scene) {
        this.scene = scene;
        this.vehicles = [];
    }

    spawnVehicles() {
        const positions = [
            new THREE.Vector3(20, 0, 15),
            new THREE.Vector3(-30, 0, -20),
            new THREE.Vector3(50, 0, 40),
            new THREE.Vector3(-60, 0, 50),
            new THREE.Vector3(40, 0, -60),
            new THREE.Vector3(-20, 0, 70)
        ];

        for (const pos of positions) {
            const car = new DrivableCar(pos, this.scene);
            car.mesh.rotation.y = Math.random() * Math.PI * 2;
            this.vehicles.push(car);
        }
        
        // Spawn planes
        const planePositions = [
            new THREE.Vector3(-40, 0, 20),
            new THREE.Vector3(60, 0, -30)
        ];
        
        for (const pos of planePositions) {
            const plane = new DrivablePlane(pos, this.scene);
            plane.mesh.rotation.y = Math.random() * Math.PI * 2;
            this.vehicles.push(plane);
        }
    }

    getNearestVehicle(playerPos) {
        let nearest = null;
        let minDist = Infinity;

        for (const v of this.vehicles) {
            if (v.occupied) continue;
            const dist = v.mesh.position.distanceTo(
                new THREE.Vector3(playerPos.x, v.mesh.position.y, playerPos.z)
            );
            if (dist < v.interactRadius && dist < minDist) {
                minDist = dist;
                nearest = v;
            }
        }
        return nearest;
    }

    update(keys, delta, playerPos) {
        for (const v of this.vehicles) {
            if (v.occupied) {
                v.update(keys, delta);
            }
            v.showIndicator(playerPos);
        }
    }
}
