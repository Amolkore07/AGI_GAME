/* ============================================
   DRIVABLE VEHICLE SYSTEM
   Player can enter/exit and drive cars
   ============================================ */

class DrivableCar {
    constructor(position, scene) {
        this.scene = scene;
        this.speed = 0;
        this.maxSpeed = 1.2;
        this.acceleration = 0.025;
        this.brakeForce = 0.04;
        this.friction = 0.005;
        this.steerAngle = 0;
        this.steerSpeed = 0.035;
        this.maxSteer = 0.04;
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

        const timeScale = delta * 60;

        // Realistic Acceleration
        if (keys['KeyW']) {
            this.speed += this.acceleration * timeScale;
        } else if (keys['KeyS']) {
            this.speed -= this.acceleration * timeScale;
        }

        // Braking
        if (keys['Space']) {
            if (this.speed > 0) this.speed = Math.max(0, this.speed - this.brakeForce * timeScale);
            else if (this.speed < 0) this.speed = Math.min(0, this.speed + this.brakeForce * timeScale);
        }

        // Friction and Air Drag
        this.speed *= Math.pow((1 - this.friction), timeScale);
        if (Math.abs(this.speed) < 0.005 && !keys['KeyW'] && !keys['KeyS']) {
            this.speed = 0;
        }
        this.speed = Math.max(-this.maxSpeed * 0.4, Math.min(this.maxSpeed, this.speed));

        // Steering (only steers effectively when moving)
        let targetSteer = 0;
        if (keys['KeyA']) targetSteer = this.maxSteer;
        if (keys['KeyD']) targetSteer = -this.maxSteer;
        
        // Smooth steering transition
        this.steerAngle += (targetSteer - this.steerAngle) * 0.1 * timeScale;

        // Apply movement and turning
        if (Math.abs(this.speed) > 0.001) {
            // Turn radius based on speed direction
            const turnFactor = this.speed > 0 ? 1 : -1;
            this.mesh.rotation.y += this.steerAngle * this.speed * turnFactor * 10 * delta;
        }

        const forward = new THREE.Vector3(
            Math.sin(this.mesh.rotation.y),
            0,
            Math.cos(this.mesh.rotation.y)
        );

        this.mesh.position.x += forward.x * this.speed;
        this.mesh.position.z += forward.z * this.speed;

        // Wheel rotation
        this.wheels.forEach(w => {
            w.rotation.y += this.speed * 0.5;
        });

        // Steering wheel rotation
        if (this.steeringWheel) {
            this.steeringWheel.rotation.z = -this.steerAngle * 40;
        }

        // World bounds
        const halfWorld = 195;
        this.mesh.position.x = Math.max(-halfWorld, Math.min(halfWorld, this.mesh.position.x));
        this.mesh.position.z = Math.max(-halfWorld, Math.min(halfWorld, this.mesh.position.z));
    }

    getDriverPosition() {
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
        this.speed = 0;
        this.maxSpeed = 2.5; 
        this.acceleration = 0.015;
        this.pitch = 0;
        this.roll = 0;
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
    
    enter() { this.occupied = true; this.indicatorMat.opacity = 0; }
    exit() { this.occupied = false; this.speed = 0; }
    
    update(keys, delta) {
        if (!this.occupied) {
            // Fall to ground if unoccupied
            if (this.mesh.position.y > 1.0) {
                 this.mesh.position.y -= 2 * delta;
                 if (this.mesh.position.y < 1.0) {
                     this.mesh.position.y = 1.0;
                     this.mesh.rotation.z = 0;
                     this.mesh.rotation.x = 0;
                 }
            }
            return;
        }
        
        const timeScale = delta * 60;
        
        // Thrust (Shift to accelerate, Ctrl/Space to brake)
        if (keys['ShiftLeft'] || keys['ShiftRight'] || keys['KeyW']) {
            this.speed += this.acceleration * timeScale;
        } else if (keys['Space']) {
            this.speed -= this.acceleration * 1.5 * timeScale;
        } else {
            // Drag
            this.speed *= Math.pow(0.995, timeScale);
        }
        this.speed = Math.max(0, Math.min(this.maxSpeed, this.speed));
        
        this.propeller.rotation.z -= this.speed * timeScale * 1.5;

        // Flight controls
        if (this.speed > 0.3) {
            if (keys['ArrowUp']) this.pitch += 0.01 * timeScale;
            if (keys['ArrowDown']) this.pitch -= 0.01 * timeScale;
            if (keys['KeyA']) this.roll += 0.03 * timeScale;
            if (keys['KeyD']) this.roll -= 0.03 * timeScale;
            
            // Auto level slightly
            this.pitch *= Math.pow(0.95, timeScale);
            this.roll *= Math.pow(0.92, timeScale);

            // Apply rotations locally
            this.mesh.rotateZ(this.roll * 0.03 * timeScale);
            this.mesh.rotateX(this.pitch * 0.03 * timeScale);
            
            // Yaw linked to roll
            this.mesh.rotateY(this.roll * 0.01 * timeScale);
        } else {
            // Ground steering
            if (keys['KeyA']) this.mesh.rotation.y += 0.03 * timeScale;
            if (keys['KeyD']) this.mesh.rotation.y -= 0.03 * timeScale;
            
            // Auto level on ground
            this.mesh.quaternion.slerp(
                new THREE.Quaternion().setFromEuler(new THREE.Euler(0, this.mesh.rotation.y, 0, 'YXZ')),
                0.1 * timeScale
            );
            this.pitch = 0;
            this.roll = 0;
        }
        
        // Move forward locally (+Z)
        this.mesh.translateZ(this.speed * timeScale);
        
        // Ground collision
        if(this.mesh.position.y < 1.0) {
            this.mesh.position.y = 1.0;
            const euler = new THREE.Euler().setFromQuaternion(this.mesh.quaternion, 'YXZ');
            if (euler.x < 0) euler.x = 0; // Prevent nose dipping too much on ground
            this.mesh.quaternion.setFromEuler(euler);
        }
        
        // World bounds
        const halfWorld = 195;
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
