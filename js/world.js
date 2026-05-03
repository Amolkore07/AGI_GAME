/* ============================================
   WORLD GENERATOR - OPTIMIZED
   Post-apocalyptic open world with sun, ocean,
   realistic cars, buildings with doors, concrete roads
   ============================================ */

class WorldGenerator {
    constructor(scene) {
        this.scene = scene;
        this.worldSize = 2000;
        this.buildings = [];
        this.pickups = [];
        this.doors = [];           // Interactive doors
        this.animatedObjects = []; // Objects that update each frame (replaces setInterval)
        this.fireObjects = [];
        this.interiorGenerator = new InteriorGenerator(scene);
        this.enterableBuildings = [];  // Buildings with interiors
        this.interiorFans = [];        // Fans to rotate each frame
    }

    generate() {
        this.createSky();
        this.createSun();
        this.createGround();
        this.createLighting();
        this.createRoads();
        this.createRivers();
        this.createBuildings();
        this.createSkyscrapers();
        this.createCars();
        this.createDecorations();
        this.createOcean();
        this.createFog();
        this.createPickups();
        this.createFires();
        this.createParticles();
    }

    createSky() {
        const skyGeo = new THREE.SphereGeometry(380, 20, 20);
        this.skyCanvas = document.createElement('canvas');
        this.skyCanvas.width = 256;
        this.skyCanvas.height = 256;
        this.drawSkyTexture(false); // Draw night by default

        const skyTex = new THREE.CanvasTexture(this.skyCanvas);
        this.skyMat = new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide });
        this.scene.add(new THREE.Mesh(skyGeo, this.skyMat));
        this.isDay = false;
    }

    drawSkyTexture(isDay) {
        const ctx = this.skyCanvas.getContext('2d');
        const grad = ctx.createLinearGradient(0, 0, 0, 256);

        if (isDay) {
            grad.addColorStop(0, '#1a5276');
            grad.addColorStop(0.3, '#2980b9');
            grad.addColorStop(0.6, '#6dd5fa');
            grad.addColorStop(1.0, '#ffffff');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 256, 256);

            for (let i = 0; i < 20; i++) {
                const x = Math.random() * 256;
                const y = Math.random() * 128;
                const r = Math.random() * 30 + 10;
                ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.4 + 0.2})`;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            grad.addColorStop(0, '#050210');
            grad.addColorStop(0.15, '#0a0515');
            grad.addColorStop(0.35, '#1a0a18');
            grad.addColorStop(0.5, '#2d1525');
            grad.addColorStop(0.65, '#4a2020');
            grad.addColorStop(0.78, '#7a3518');
            grad.addColorStop(0.88, '#c06020');
            grad.addColorStop(0.95, '#e08830');
            grad.addColorStop(1.0, '#b06018');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 256, 256);

            for (let i = 0; i < 80; i++) {
                const x = Math.random() * 256;
                const y = Math.random() * 128;
                ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.6 + 0.2})`;
                ctx.beginPath();
                ctx.arc(x, y, Math.random() * 1.5, 0, Math.PI * 2);
                ctx.fill();
            }

            for (let i = 0; i < 8; i++) {
                const x = Math.random() * 256;
                const y = 100 + Math.random() * 120;
                const r = Math.random() * 40 + 20;
                const cg = ctx.createRadialGradient(x, y, 0, x, y, r);
                cg.addColorStop(0, 'rgba(40,20,15,0.3)');
                cg.addColorStop(1, 'rgba(20,10,5,0)');
                ctx.fillStyle = cg;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    toggleDayNight() {
        this.isDay = !this.isDay;
        this.drawSkyTexture(this.isDay);
        this.skyMat.map = new THREE.CanvasTexture(this.skyCanvas);
        this.skyMat.map.needsUpdate = true;

        if (this.ambientLight) {
            this.ambientLight.color.setHex(this.isDay ? 0xaaccff : 0x554433);
            this.ambientLight.intensity = this.isDay ? 1.0 : 0.6;
        }
        if (this.sunDirectional) {
            this.sunDirectional.color.setHex(this.isDay ? 0xffffff : 0xffaa55);
            this.sunDirectional.intensity = this.isDay ? 1.5 : 0.8;
            this.sunDirectional.position.set(this.isDay ? 0 : 150, 250, this.isDay ? -100 : -200);
        }
        if (this.visibleSun) {
            this.visibleSun.material.color.setHex(this.isDay ? 0xffffff : 0xffcc44);
            if(this.isDay) {
                this.visibleSun.position.set(0, 300, -250);
            } else {
                this.visibleSun.position.set(150, 120, -200);
            }
            this.sunLightSource.position.copy(this.visibleSun.position);
            this.sunLightSource.color.setHex(this.isDay ? 0xffffff : 0xffaa44);
        }
    }

    createSun() {
        // Visible sun sphere
        const sunGeo = new THREE.SphereGeometry(12, 16, 16);
        const sunMat = new THREE.MeshBasicMaterial({
            color: 0xffcc44,
            transparent: true,
            opacity: 0.95
        });
        this.visibleSun = new THREE.Mesh(sunGeo, sunMat);
        this.visibleSun.position.set(150, 120, -200);
        this.scene.add(this.visibleSun);

        // Sun glow (corona)
        const glowGeo = new THREE.SphereGeometry(22, 16, 16);
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0xff8833,
            transparent: true,
            opacity: 0.25
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        this.visibleSun.add(glow);

        // Sun lens flare light
        this.sunLightSource = new THREE.PointLight(0xffaa44, 1.5, 500);
        this.sunLightSource.position.copy(this.visibleSun.position);
        this.scene.add(this.sunLightSource);
    }

    createGround() {
        const groundTex = TextureGen.groundTexture();
        const groundGeo = new THREE.PlaneGeometry(this.worldSize, this.worldSize, 4, 4);

        const groundMat = new THREE.MeshLambertMaterial({
            map: groundTex,
            color: 0x666666
        });

        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.05;
        this.scene.add(ground);
    }

    createLighting() {
        // Warm ambient - brighter since we have a sun now
        this.ambientLight = new THREE.AmbientLight(0x554433, 0.6);
        this.scene.add(this.ambientLight);

        // Sun directional light (warm orange)
        this.sunDirectional = new THREE.DirectionalLight(0xffaa55, 0.8);
        this.sunDirectional.position.set(150, 120, -200);
        this.scene.add(this.sunDirectional);

        // Fill light (cool blue from opposite side)
        const fill = new THREE.DirectionalLight(0x334466, 0.3);
        fill.position.set(-50, 30, 100);
        this.scene.add(fill);

        // Hemisphere for natural feel
        const hemi = new THREE.HemisphereLight(0x886644, 0x222233, 0.3);
        this.scene.add(hemi);
    }

    createBuildings() {
        const wallTex = TextureGen.wallTexture();
        const destroyedTex = TextureGen.destroyedWallTexture();

        let enterableCount = 0;
        const GRID = 18;   // -18..18 cells
        const CELL = 60;   // spacing between buildings

        for (let gx = -GRID; gx <= GRID; gx++) {
            for (let gz = -GRID; gz <= GRID; gz++) {
                // Clear center plaza
                if (Math.abs(gx) <= 1 && Math.abs(gz) <= 1) continue;
                // Skip river corridors
                if (Math.abs(gz) === 5 || Math.abs(gx) === 5) continue;
                if (Math.random() > 0.60) continue;

                const x = gx * CELL + (Math.random() - 0.5) * 14;
                const z = gz * CELL + (Math.random() - 0.5) * 14;
                const w = 9 + Math.random() * 14;
                const h = 8 + Math.random() * 30;
                const d = 9 + Math.random() * 14;
                const destroyed = Math.random() > 0.55;
                const enterable = !destroyed && enterableCount < 12 && Math.random() > 0.6;
                if (enterable) enterableCount++;

                this.createBuilding({ x, z, w, h, d, destroyed, enterable }, wallTex, destroyedTex);
            }
        }

        // Special landmarks spread across larger world
        this.createCafe(new THREE.Vector3(180, 0, -180), new THREE.Group());
        this.createSportsGround(new THREE.Vector3(-280, 0, 160), new THREE.Group());
        this.createSwimmingPool(new THREE.Vector3(220, 0, 260), new THREE.Group());
        this.createCafe(new THREE.Vector3(-380, 0, 300), new THREE.Group());
        this.createSportsGround(new THREE.Vector3(400, 0, -350), new THREE.Group());
    }

    // CAFE - A commercial building with nice geometry
    createCafe(position, group) {
        // Main building body
        const mainGeo = new THREE.BoxGeometry(12, 6, 10);
        const mainMat = new THREE.MeshLambertMaterial({ color: 0xd4a574 });
        const main = new THREE.Mesh(mainGeo, mainMat);
        main.position.y = 3;
        group.add(main);

        // Slanted roof
        const roofGeo = new THREE.ConeGeometry(8, 2, 4);
        const roofMat = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = 7;
        group.add(roof);

        // Front awning/canopy
        const awningGeo = new THREE.BoxGeometry(12.5, 0.3, 2.5);
        const awningMat = new THREE.MeshLambertMaterial({ color: 0xff6b6b });
        const awning = new THREE.Mesh(awningGeo, awningMat);
        awning.position.set(0, 5.5, -5.2);
        group.add(awning);

        // Support pillars for canopy
        for (let i = -1; i <= 1; i++) {
            const pillarGeo = new THREE.CylinderGeometry(0.3, 0.3, 3.5, 8);
            const pillarMat = new THREE.MeshLambertMaterial({ color: 0x555555 });
            const pillar = new THREE.Mesh(pillarGeo, pillarMat);
            pillar.position.set(i * 3.5, 2, -3.5);
            group.add(pillar);
        }

        // Large front window
        const windowGeo = new THREE.PlaneGeometry(10, 4);
        const glassMat = new THREE.MeshBasicMaterial({ color: 0x88ccff, transparent: true, opacity: 0.6 });
        const window = new THREE.Mesh(windowGeo, glassMat);
        window.position.set(0, 3, -5.05);
        group.add(window);

        // Door in center of window
        const doorGeo = new THREE.BoxGeometry(1.5, 2.8, 0.2);
        const doorMat = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
        const door = new THREE.Mesh(doorGeo, doorMat);
        door.position.set(0, 1.8, -5.1);
        group.add(door);

        group.position.copy(position);
        this.scene.add(group);
    }

    // SPORTS GROUND - Open area with stadium-like structure
    createSportsGround(position, group) {
        // Main field base
        const fieldGeo = new THREE.PlaneGeometry(30, 25);
        const fieldMat = new THREE.MeshLambertMaterial({ color: 0x2d5016 });
        const field = new THREE.Mesh(fieldGeo, fieldMat);
        field.rotation.x = -Math.PI / 2;
        field.position.y = 0.05;
        group.add(field);

        // Boundary lines (white stripes)
        const lineGeo = new THREE.PlaneGeometry(30, 0.5);
        const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const lineN = new THREE.Mesh(lineGeo, lineMat);
        lineN.rotation.x = -Math.PI / 2;
        lineN.position.set(0, 0.07, -12.5);
        group.add(lineN);
        const lineS = new THREE.Mesh(lineGeo, lineMat.clone());
        lineS.rotation.x = -Math.PI / 2;
        lineS.position.set(0, 0.07, 12.5);
        group.add(lineS);

        // Center circle
        const circleGeo = new THREE.CircleGeometry(3.5, 16);
        const circle = new THREE.Mesh(circleGeo, lineMat.clone());
        circle.rotation.x = -Math.PI / 2;
        circle.position.y = 0.08;
        group.add(circle);

        // Goal boxes
        for (let z of [-11, 11]) {
            const goalGeo = new THREE.BoxGeometry(16, 0.2, 5);
            const goalMat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
            const goal = new THREE.Mesh(goalGeo, goalMat);
            goal.position.set(0, 0.1, z);
            group.add(goal);
        }

        // Spectator stands (bleachers) on sides
        for (let x of [-16, 16]) {
            for (let i = 0; i < 4; i++) {
                const bleacherGeo = new THREE.BoxGeometry(2, 1 + i * 0.8, 24);
                const bleacherMat = new THREE.MeshLambertMaterial({ color: 0x555544 });
                const bleacher = new THREE.Mesh(bleacherGeo, bleacherMat);
                bleacher.position.set(x + (x > 0 ? 1 : -1) * i * 1.2, 0.5 + i * 0.8, 0);
                group.add(bleacher);
            }
        }

        // Goal posts (simple)
        for (let z of [-12.5, 12.5]) {
            const postGeo = new THREE.CylinderGeometry(0.15, 0.15, 7, 8);
            const postMat = new THREE.MeshLambertMaterial({ color: 0xcccccc });
            const post = new THREE.Mesh(postGeo, postMat);
            post.position.set(-6, 3.5, z);
            group.add(post);
            const post2 = post.clone();
            post2.position.x = 6;
            group.add(post2);
        }

        group.position.copy(position);
        this.scene.add(group);
    }

    // SWIMMING POOL - Olympic-style with water
    createSwimmingPool(position, group) {
        // Pool structure (concrete base)
        const poolDepth = 3;
        const poolGeo = new THREE.BoxGeometry(18, poolDepth, 12);
        const poolBaseMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
        const poolBase = new THREE.Mesh(poolGeo, poolBaseMat);
        poolBase.position.y = -poolDepth / 2;
        group.add(poolBase);

        // Pool water
        const waterGeo = new THREE.PlaneGeometry(17.8, 11.8);
        const waterMat = new THREE.MeshLambertMaterial({
            color: 0x0066cc,
            transparent: true,
            opacity: 0.7
        });
        const water = new THREE.Mesh(waterGeo, waterMat);
        water.rotation.x = -Math.PI / 2;
        water.position.y = 0.02;
        group.add(water);

        // Pool edges (white concrete)
        const edgeThickness = 0.8;
        const edgeGeo = new THREE.BoxGeometry(20, 0.5, edgeThickness);
        const edgeMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
        
        const edgeN = new THREE.Mesh(edgeGeo, edgeMat);
        edgeN.position.set(0, 0.25, -6.4);
        group.add(edgeN);
        
        const edgeS = edgeN.clone();
        edgeS.position.z = 6.4;
        group.add(edgeS);

        const edgeGeo2 = new THREE.BoxGeometry(edgeThickness, 0.5, 12.8);
        const edgeE = new THREE.Mesh(edgeGeo2, edgeMat.clone());
        edgeE.position.set(9.9, 0.25, 0);
        group.add(edgeE);
        
        const edgeW = edgeE.clone();
        edgeW.position.x = -9.9;
        group.add(edgeW);

        // Diving boards (two heights)
        for (let i = 0; i < 2; i++) {
            const boardHeight = 3 + i * 2;
            const supportGeo = new THREE.CylinderGeometry(0.25, 0.25, boardHeight, 8);
            const supportMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
            const support = new THREE.Mesh(supportGeo, supportMat);
            support.position.set(-5 + i * 4, boardHeight / 2, 8);
            group.add(support);

            const boardGeo = new THREE.BoxGeometry(2.5, 0.3, 1.5);
            const boardMat = new THREE.MeshLambertMaterial({ color: 0xcc6600 });
            const board = new THREE.Mesh(boardGeo, boardMat);
            board.position.set(-5 + i * 4, boardHeight, 8.5);
            group.add(board);
        }

        // Locker house/changing rooms
        const lockerGeo = new THREE.BoxGeometry(8, 3, 4);
        const lockerMat = new THREE.MeshLambertMaterial({ color: 0xb0b0b0 });
        const locker = new THREE.Mesh(lockerGeo, lockerMat);
        locker.position.set(-8, 1.5, -7);
        group.add(locker);

        // Ladder (to help visualization)
        const ladderGeo = new THREE.BoxGeometry(0.4, 2.5, 0.2);
        const ladderMat = new THREE.MeshLambertMaterial({ color: 0xffaa00 });
        const ladder = new THREE.Mesh(ladderGeo, ladderMat);
        ladder.position.set(7, 1, 5.5);
        group.add(ladder);

        group.position.copy(position);
        this.scene.add(group);
    }

    createBuilding(config, wallTex, destroyedTex) {
        const { x, z, w, h, d, destroyed, enterable } = config;
        const group = new THREE.Group();

        if (destroyed) {
            const actualH = h * (0.3 + Math.random() * 0.4);
            const geo = new THREE.BoxGeometry(w, actualH, d);
            const mat = new THREE.MeshLambertMaterial({
                map: destroyedTex.clone(),
                color: 0x777770
            });
            const building = new THREE.Mesh(geo, mat);
            building.position.y = actualH / 2;
            group.add(building);

            // Rubble on top (fewer for performance)
            for (let i = 0; i < 3; i++) {
                const rubbleGeo = new THREE.BoxGeometry(
                    Math.random() * w * 0.25 + 1,
                    Math.random() * 2 + 0.5,
                    Math.random() * d * 0.25 + 1
                );
                const rubble = new THREE.Mesh(rubbleGeo, mat.clone());
                rubble.position.set(
                    (Math.random() - 0.5) * w * 0.5,
                    actualH + 0.5,
                    (Math.random() - 0.5) * d * 0.5
                );
                rubble.rotation.set(
                    (Math.random() - 0.5) * 0.3,
                    Math.random() * Math.PI,
                    (Math.random() - 0.5) * 0.3
                );
                group.add(rubble);
            }
        } else {
            // Intact building with more realistic detail
            const geo = new THREE.BoxGeometry(w, h, d);
            const mat = new THREE.MeshLambertMaterial({
                map: wallTex.clone(),
                color: 0x888880
            });
            const building = new THREE.Mesh(geo, mat);
            building.position.y = h / 2;
            group.add(building);

            // Rooftop ledge
            const ledgeGeo = new THREE.BoxGeometry(w + 0.5, 0.5, d + 0.5);
            const ledgeMat = new THREE.MeshLambertMaterial({ color: 0x555550 });
            const ledge = new THREE.Mesh(ledgeGeo, ledgeMat);
            ledge.position.y = h;
            group.add(ledge);

            // Windows (use planes, NO lights per window for performance)
            const windowSize = 1.2;
            const windowGap = 3.5;
            
            // CACHE GEO/MAT per building instead of creating thousands
            const winGeo = new THREE.PlaneGeometry(windowSize, windowSize * 1.4);
            const winMatLit = new THREE.MeshBasicMaterial({ color: 0xffaa44, transparent: true, opacity: 0.85 });
            const winMatUnlit = new THREE.MeshBasicMaterial({ color: 0x0a0a15, transparent: true, opacity: 0.85 });

            for (let wy = 3; wy < h - 2; wy += windowGap) {
                for (let wx = -w / 2 + 2; wx < w / 2 - 1.5; wx += windowGap) {
                    const isLit = Math.random() > 0.88;
                    const winMat = isLit ? winMatLit : winMatUnlit;
                    // Front
                    const winF = new THREE.Mesh(winGeo, winMat);
                    winF.position.set(wx, wy, -d / 2 - 0.02);
                    group.add(winF);
                    // Back
                    const winB = new THREE.Mesh(winGeo, winMat);
                    winB.position.set(wx, wy, d / 2 + 0.02);
                    winB.rotation.y = Math.PI;
                    group.add(winB);
                }
            }

            // === DOOR (interactive!) ===
            this.addDoor(group, w, d);

            // === INTERIOR (for enterable buildings) ===
            if (enterable) {
                const interior = this.interiorGenerator.createInterior(group, w, h, d);
                // Track fans for rotation
                interior.traverse(child => {
                    if (child.userData && child.userData.isFan) {
                        this.interiorFans.push(child);
                    }
                });
                this.enterableBuildings.push({ group, position: new THREE.Vector3(x, 0, z), w, h, d });
                group.userData.enterable = true;
            }
        }

        group.position.set(x, 0, z);
        group.userData.size = { x: w / 2 + 1, z: d / 2 + 1 };
        this.scene.add(group);
        this.buildings.push(group);
    }

    addDoor(buildingGroup, w, d) {
        const doorW = 1.8;
        const doorH = 3.2;

        // Door frame (darker)
        const frameGeo = new THREE.BoxGeometry(doorW + 0.4, doorH + 0.3, 0.3);
        const frameMat = new THREE.MeshLambertMaterial({ color: 0x333330 });
        const frame = new THREE.Mesh(frameGeo, frameMat);
        frame.position.set(0, doorH / 2 + 0.1, -d / 2 - 0.05);
        buildingGroup.add(frame);

        // Door panel (pivot point at left edge)
        const doorGroup = new THREE.Group();
        doorGroup.position.set(-doorW / 2, 0, -d / 2 - 0.1);

        const doorGeo = new THREE.BoxGeometry(doorW, doorH, 0.1);
        const doorMat = new THREE.MeshLambertMaterial({ color: 0x5a3a1a });
        const doorMesh = new THREE.Mesh(doorGeo, doorMat);
        doorMesh.position.set(doorW / 2, doorH / 2, 0); // Offset so pivot is at edge
        doorGroup.add(doorMesh);

        // Door handle
        const handleGeo = new THREE.SphereGeometry(0.08, 6, 6);
        const handleMat = new THREE.MeshLambertMaterial({ color: 0xccaa44 });
        const handle = new THREE.Mesh(handleGeo, handleMat);
        handle.position.set(doorW - 0.2, doorH / 2, -0.08);
        doorGroup.add(handle);

        buildingGroup.add(doorGroup);

        // Track for interaction
        this.doors.push({
            group: doorGroup,
            buildingGroup: buildingGroup,
            isOpen: false,
            targetAngle: 0,
            currentAngle: 0,
            doorWidth: doorW,
            doorDepth: d
        });
    }

    interactDoor(playerPosition) {
        let closestDoor = null;
        let closestDist = 6; // Interaction range

        for (const door of this.doors) {
            const doorWorldPos = new THREE.Vector3();
            door.group.getWorldPosition(doorWorldPos);
            const dist = playerPosition.distanceTo(doorWorldPos);
            if (dist < closestDist) {
                closestDist = dist;
                closestDoor = door;
            }
        }

        if (closestDoor) {
            closestDoor.isOpen = !closestDoor.isOpen;
            closestDoor.targetAngle = closestDoor.isOpen ? -Math.PI / 2 : 0;
            audioEngine.playPickup(); // Door sound
        }
    }

    updateDoors() {
        for (const door of this.doors) {
            if (Math.abs(door.currentAngle - door.targetAngle) > 0.02) {
                door.currentAngle += (door.targetAngle - door.currentAngle) * 0.08;
                door.group.rotation.y = door.currentAngle;
            }
        }
    }

    createCars() {
        // More realistic detailed cars
        for (let i = 0; i < 12; i++) {
            const pos = new THREE.Vector3(
                (Math.random() - 0.5) * this.worldSize * 0.6,
                0,
                (Math.random() - 0.5) * this.worldSize * 0.6
            );
            this.createRealisticCar(pos);
        }
    }

    createRealisticCar(position) {
        const group = new THREE.Group();
        const carColors = [0x8B0000, 0x1a1a2e, 0x2d4a22, 0x333333, 0x4a3520, 0x22334a, 0x444444, 0x660000];
        const paintColor = carColors[Math.floor(Math.random() * carColors.length)];
        const paintMat = new THREE.MeshLambertMaterial({ color: paintColor });
        const darkMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
        const chromeMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
        const glassMat = new THREE.MeshLambertMaterial({ color: 0x112233, transparent: true, opacity: 0.5 });

        // CHASSIS (lower body)
        const chassisGeo = new THREE.BoxGeometry(4.5, 0.6, 2.0);
        const chassis = new THREE.Mesh(chassisGeo, darkMat);
        chassis.position.y = 0.3;
        group.add(chassis);

        // MAIN BODY (sedan shape)
        const bodyGeo = new THREE.BoxGeometry(4.2, 1.0, 1.9);
        const body = new THREE.Mesh(bodyGeo, paintMat);
        body.position.y = 1.1;
        group.add(body);

        // HOOD (front slope)
        const hoodGeo = new THREE.BoxGeometry(1.2, 0.15, 1.85);
        const hood = new THREE.Mesh(hoodGeo, paintMat.clone());
        hood.position.set(1.7, 1.65, 0);
        hood.rotation.z = 0.05;
        group.add(hood);

        // TRUNK
        const trunkGeo = new THREE.BoxGeometry(0.8, 0.12, 1.85);
        const trunk = new THREE.Mesh(trunkGeo, paintMat.clone());
        trunk.position.set(-1.6, 1.65, 0);
        trunk.rotation.z = -0.03;
        group.add(trunk);

        // CABIN (windshield area)
        const cabinGeo = new THREE.BoxGeometry(1.8, 0.9, 1.75);
        const cabin = new THREE.Mesh(cabinGeo, paintMat.clone());
        cabin.position.set(-0.15, 1.95, 0);
        group.add(cabin);

        // WINDSHIELD (front)
        const wsGeo = new THREE.PlaneGeometry(1.7, 0.85);
        const ws = new THREE.Mesh(wsGeo, glassMat);
        ws.position.set(0.72, 2.0, 0);
        ws.rotation.y = Math.PI / 2;
        ws.rotation.x = 0;
        group.add(ws);

        // REAR WINDOW
        const rwGeo = new THREE.PlaneGeometry(1.7, 0.75);
        const rw = new THREE.Mesh(rwGeo, glassMat.clone());
        rw.position.set(-1.07, 2.0, 0);
        rw.rotation.y = -Math.PI / 2;
        group.add(rw);

        // SIDE WINDOWS
        const swGeo = new THREE.PlaneGeometry(1.6, 0.7);
        const swL = new THREE.Mesh(swGeo, glassMat.clone());
        swL.position.set(-0.15, 2.05, 0.88);
        group.add(swL);
        const swR = new THREE.Mesh(swGeo, glassMat.clone());
        swR.position.set(-0.15, 2.05, -0.88);
        swR.rotation.y = Math.PI;
        group.add(swR);

        // HEADLIGHTS (front)
        const hlGeo = new THREE.BoxGeometry(0.1, 0.25, 0.4);
        const hlMat = new THREE.MeshBasicMaterial({ color: 0xffffcc, transparent: true, opacity: 0.6 });
        const hlL = new THREE.Mesh(hlGeo, hlMat);
        hlL.position.set(2.26, 1.1, 0.6);
        group.add(hlL);
        const hlR = new THREE.Mesh(hlGeo, hlMat.clone());
        hlR.position.set(2.26, 1.1, -0.6);
        group.add(hlR);

        // TAILLIGHTS
        const tlGeo = new THREE.BoxGeometry(0.1, 0.2, 0.35);
        const tlMat = new THREE.MeshBasicMaterial({ color: 0xff2200, transparent: true, opacity: 0.7 });
        const tlL = new THREE.Mesh(tlGeo, tlMat);
        tlL.position.set(-2.26, 1.1, 0.55);
        group.add(tlL);
        const tlR = new THREE.Mesh(tlGeo, tlMat.clone());
        tlR.position.set(-2.26, 1.1, -0.55);
        group.add(tlR);

        // BUMPERS
        const bumpGeo = new THREE.BoxGeometry(0.15, 0.35, 2.0);
        const frontBump = new THREE.Mesh(bumpGeo, chromeMat);
        frontBump.position.set(2.32, 0.65, 0);
        group.add(frontBump);
        const rearBump = new THREE.Mesh(bumpGeo, chromeMat.clone());
        rearBump.position.set(-2.32, 0.65, 0);
        group.add(rearBump);

        // WHEELS with rims (4 wheels)
        const wheelPositions = [
            [1.3, 0.35, 1.05],
            [1.3, 0.35, -1.05],
            [-1.3, 0.35, 1.05],
            [-1.3, 0.35, -1.05]
        ];

        wheelPositions.forEach(pos => {
            // Tire
            const tireGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.28, 12);
            const tire = new THREE.Mesh(tireGeo, darkMat);
            tire.rotation.x = Math.PI / 2;
            tire.position.set(...pos);
            group.add(tire);

            // Rim
            const rimGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.30, 8);
            const rimMat = new THREE.MeshLambertMaterial({ color: 0xaaaaaa });
            const rim = new THREE.Mesh(rimGeo, rimMat);
            rim.rotation.x = Math.PI / 2;
            rim.position.set(...pos);
            group.add(rim);
        });

        // SIDE MIRRORS
        const mirGeo = new THREE.BoxGeometry(0.15, 0.12, 0.2);
        const mirL = new THREE.Mesh(mirGeo, chromeMat.clone());
        mirL.position.set(0.8, 1.7, 1.1);
        group.add(mirL);
        const mirR = new THREE.Mesh(mirGeo, chromeMat.clone());
        mirR.position.set(0.8, 1.7, -1.1);
        group.add(mirR);

        // ROOF RACK (on some cars)
        if (Math.random() > 0.6) {
            const rackGeo = new THREE.BoxGeometry(1.4, 0.06, 1.5);
            const rack = new THREE.Mesh(rackGeo, chromeMat.clone());
            rack.position.y = 2.42;
            rack.position.x = -0.15;
            group.add(rack);
        }

        // Damage: random dents, tilt
        const damageLevel = Math.random();
        if (damageLevel > 0.5) {
            // Tilted / crashed
            group.rotation.set(
                (Math.random() - 0.5) * 0.12,
                Math.random() * Math.PI * 2,
                (Math.random() - 0.5) * 0.1
            );
        } else {
            group.rotation.y = Math.random() * Math.PI * 2;
        }

        // Some cars are burned
        if (Math.random() > 0.7) {
            group.children.forEach(child => {
                if (child.material && child.material.color) {
                    child.material = child.material.clone();
                    child.material.color.multiplyScalar(0.3);
                }
            });
        }

        group.position.copy(position);
        this.scene.add(group);
    }

    createRoads() {
        const roadTex = TextureGen.concreteRoadTexture();
        const W = this.worldSize * 0.92;

        // Main arteries + city grid every 60 units
        const roads = [
            // Main cross arteries
            { x: 0,    z: 0,    w: W,   d: 18 },
            { x: 0,    z: 0,    w: 18,  d: W  },
            // Secondary grid — horizontal
            { x: 0, z:  120, w: W * 0.85, d: 12 },
            { x: 0, z: -120, w: W * 0.85, d: 12 },
            { x: 0, z:  240, w: W * 0.75, d: 12 },
            { x: 0, z: -240, w: W * 0.75, d: 12 },
            { x: 0, z:  360, w: W * 0.65, d: 10 },
            { x: 0, z: -360, w: W * 0.65, d: 10 },
            { x: 0, z:  480, w: W * 0.55, d: 10 },
            { x: 0, z: -480, w: W * 0.55, d: 10 },
            { x: 0, z:  600, w: W * 0.45, d: 10 },
            { x: 0, z: -600, w: W * 0.45, d: 10 },
            // Secondary grid — vertical
            { x:  120, z: 0, w: 12, d: W * 0.85 },
            { x: -120, z: 0, w: 12, d: W * 0.85 },
            { x:  240, z: 0, w: 12, d: W * 0.75 },
            { x: -240, z: 0, w: 12, d: W * 0.75 },
            { x:  360, z: 0, w: 10, d: W * 0.65 },
            { x: -360, z: 0, w: 10, d: W * 0.65 },
            { x:  480, z: 0, w: 10, d: W * 0.55 },
            { x: -480, z: 0, w: 10, d: W * 0.55 },
            { x:  600, z: 0, w: 10, d: W * 0.45 },
            { x: -600, z: 0, w: 10, d: W * 0.45 },
            // Diagonal boulevards (angled 45°)
            { x:  200, z:  200, w: W * 0.4, d: 10 },
            { x: -200, z: -200, w: W * 0.4, d: 10 },
        ];

        const curbMat = new THREE.MeshLambertMaterial({ color: 0x999990 });
        for (const road of roads) {
            const geo = new THREE.PlaneGeometry(road.w, road.d);
            const tex = roadTex.clone();
            tex.repeat.set(road.w / 14, road.d / 14);
            const mat = new THREE.MeshLambertMaterial({ map: tex, color: 0xaaaaaa });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.rotation.x = -Math.PI / 2;
            mesh.position.set(road.x, 0.02, road.z);
            this.scene.add(mesh);

            // Curbs
            if (road.w > road.d) {
                const cg = new THREE.BoxGeometry(road.w, 0.25, 0.4);
                const cN = new THREE.Mesh(cg, curbMat.clone());
                cN.position.set(road.x, 0.12, road.z - road.d / 2 - 0.2);
                this.scene.add(cN);
                const cS = cN.clone();
                cS.position.z = road.z + road.d / 2 + 0.2;
                this.scene.add(cS);
            } else {
                const cg = new THREE.BoxGeometry(0.4, 0.25, road.d);
                const cE = new THREE.Mesh(cg, curbMat.clone());
                cE.position.set(road.x - road.w / 2 - 0.2, 0.12, road.z);
                this.scene.add(cE);
                const cW = cE.clone();
                cW.position.x = road.x + road.w / 2 + 0.2;
                this.scene.add(cW);
            }
        }
    }

    createRivers() {
        const riverMat = new THREE.MeshLambertMaterial({
            color: 0x1a4a8a, transparent: true, opacity: 0.82
        });
        const bridgeMat = new THREE.MeshLambertMaterial({ color: 0x888880 });
        const W = this.worldSize * 0.88;
        const riverW = 28;
        const riverDepth = 0.6;

        // Two rivers: one horizontal (Z axis), one vertical (X axis)
        const rivers = [
            { axis: 'z', offset:  300 },
            { axis: 'z', offset: -300 },
            { axis: 'x', offset:  300 },
            { axis: 'x', offset: -300 },
        ];

        for (const r of rivers) {
            // River bed (slightly below ground)
            const bedGeo = r.axis === 'z'
                ? new THREE.BoxGeometry(W, riverDepth, riverW)
                : new THREE.BoxGeometry(riverW, riverDepth, W);
            const bed = new THREE.Mesh(bedGeo, new THREE.MeshLambertMaterial({ color: 0x334455 }));
            bed.position.set(
                r.axis === 'x' ? r.offset : 0,
                -riverDepth / 2 - 0.1,
                r.axis === 'z' ? r.offset : 0
            );
            this.scene.add(bed);

            // Water surface
            const waterGeo = r.axis === 'z'
                ? new THREE.PlaneGeometry(W, riverW)
                : new THREE.PlaneGeometry(riverW, W);
            const water = new THREE.Mesh(waterGeo, riverMat.clone());
            water.rotation.x = -Math.PI / 2;
            water.position.set(
                r.axis === 'x' ? r.offset : 0,
                0.05,
                r.axis === 'z' ? r.offset : 0
            );
            this.scene.add(water);
            if (!this.rivers) this.rivers = [];
            this.rivers.push(water);

            // Concrete embankments
            for (const side of [-1, 1]) {
                const embankGeo = r.axis === 'z'
                    ? new THREE.BoxGeometry(W, 1.2, 3)
                    : new THREE.BoxGeometry(3, 1.2, W);
                const embank = new THREE.Mesh(embankGeo, bridgeMat.clone());
                const off = riverW / 2 + 1.5;
                embank.position.set(
                    r.axis === 'x' ? r.offset : (r.axis === 'z' ? 0 : side * off),
                    0.4,
                    r.axis === 'z' ? r.offset + side * off : 0
                );
                if (r.axis === 'x') {
                    embank.position.x = r.offset;
                    embank.position.z = side * off;
                }
                this.scene.add(embank);
            }

            // Bridges where main roads cross
            const crossings = [-480, -240, 0, 240, 480];
            for (const cx of crossings) {
                const bridgeGeo = r.axis === 'z'
                    ? new THREE.BoxGeometry(18, 0.8, riverW + 4)
                    : new THREE.BoxGeometry(riverW + 4, 0.8, 18);
                const bridge = new THREE.Mesh(bridgeGeo, bridgeMat.clone());
                bridge.position.set(
                    r.axis === 'z' ? cx : r.offset,
                    0.5,
                    r.axis === 'z' ? r.offset : cx
                );
                this.scene.add(bridge);

                // Bridge railings
                for (const side of [-1, 1]) {
                    const railGeo = r.axis === 'z'
                        ? new THREE.BoxGeometry(18, 1.2, 0.3)
                        : new THREE.BoxGeometry(0.3, 1.2, 18);
                    const rail = new THREE.Mesh(railGeo, new THREE.MeshLambertMaterial({ color: 0x777770 }));
                    rail.position.set(
                        r.axis === 'z' ? cx : r.offset,
                        1.1,
                        r.axis === 'z' ? r.offset + side * (riverW / 2 + 2) : cx + side * (riverW / 2 + 2)
                    );
                    if (r.axis === 'x') {
                        rail.position.x = r.offset + side * (riverW / 2 + 2);
                        rail.position.z = cx;
                    }
                    this.scene.add(rail);
                }
            }
        }
    }

    createSkyscrapers() {
        // Downtown cluster near center and secondary districts
        const districts = [
            { cx:   0, cz:   0, count: 10, minH: 80,  maxH: 220 }, // CBD
            { cx: 300, cz: 300, count:  7, minH: 50,  maxH: 140 },
            { cx:-300, cz: 300, count:  6, minH: 45,  maxH: 120 },
            { cx: 300, cz:-300, count:  6, minH: 45,  maxH: 120 },
            { cx:-300, cz:-300, count:  5, minH: 40,  maxH: 100 },
        ];

        const glassMats = [
            new THREE.MeshLambertMaterial({ color: 0x223355 }),
            new THREE.MeshLambertMaterial({ color: 0x334422 }),
            new THREE.MeshLambertMaterial({ color: 0x442233 }),
            new THREE.MeshLambertMaterial({ color: 0x334455 }),
            new THREE.MeshLambertMaterial({ color: 0x555533 }),
        ];
        const concreteMat = new THREE.MeshLambertMaterial({ color: 0x666660 });

        for (const d of districts) {
            for (let i = 0; i < d.count; i++) {
                const x = d.cx + (Math.random() - 0.5) * 160;
                const z = d.cz + (Math.random() - 0.5) * 160;
                // Skip river zones
                if (Math.abs(z - 300) < 20 || Math.abs(z + 300) < 20) continue;
                if (Math.abs(x - 300) < 20 || Math.abs(x + 300) < 20) continue;

                const w = 14 + Math.random() * 20;
                const dep = 14 + Math.random() * 20;
                const h = d.minH + Math.random() * (d.maxH - d.minH);
                const mat = glassMats[Math.floor(Math.random() * glassMats.length)].clone();

                const group = new THREE.Group();

                // Main tower body
                const towerGeo = new THREE.BoxGeometry(w, h, dep);
                const tower = new THREE.Mesh(towerGeo, mat);
                tower.position.y = h / 2;
                group.add(tower);

                // Setback upper section
                const topW = w * 0.65;
                const topD = dep * 0.65;
                const topH = h * 0.25;
                const topGeo = new THREE.BoxGeometry(topW, topH, topD);
                const top = new THREE.Mesh(topGeo, mat.clone());
                top.position.y = h + topH / 2;
                group.add(top);

                // Antenna spire
                const spireGeo = new THREE.CylinderGeometry(0.3, 0.8, h * 0.1, 6);
                const spire = new THREE.Mesh(spireGeo, concreteMat.clone());
                spire.position.y = h + topH + h * 0.05;
                group.add(spire);

                // Window grid (emissive planes)
                const winMat = new THREE.MeshBasicMaterial({ color: 0xffcc66, transparent: true, opacity: 0.75 });
                const winGeo = new THREE.PlaneGeometry(1.5, 2);
                for (let wy = 4; wy < h - 3; wy += 5) {
                    for (let wx = -w / 2 + 2.5; wx < w / 2 - 1.5; wx += 4) {
                        if (Math.random() > 0.6) {
                            const wf = new THREE.Mesh(winGeo, winMat);
                            wf.position.set(wx, wy, dep / 2 + 0.05);
                            group.add(wf);
                            const wb = wf.clone();
                            wb.position.z = -dep / 2 - 0.05;
                            wb.rotation.y = Math.PI;
                            group.add(wb);
                        }
                    }
                }

                // Podium base
                const podGeo = new THREE.BoxGeometry(w + 6, 4, dep + 6);
                const pod = new THREE.Mesh(podGeo, concreteMat.clone());
                pod.position.y = 2;
                group.add(pod);

                // Warning light on tip
                const warnLight = new THREE.PointLight(0xff2200, 1.5, 30);
                warnLight.position.y = h + topH + h * 0.11;
                group.add(warnLight);

                group.position.set(x, 0, z);
                group.userData.size = { x: (w + 6) / 2 + 1, z: (dep + 6) / 2 + 1 };
                this.scene.add(group);
                this.buildings.push(group);
            }
        }
    }

    createDecorations() {
        // Many more street lights across the bigger world
        for (let i = 0; i < 80; i++) {
            this.createStreetLight(new THREE.Vector3(
                (Math.random() - 0.5) * this.worldSize * 0.8,
                0,
                (Math.random() - 0.5) * this.worldSize * 0.8
            ));
        }

        // Barricades
        for (let i = 0; i < 30; i++) {
            this.createBarricade(new THREE.Vector3(
                (Math.random() - 0.5) * this.worldSize * 0.7,
                0,
                (Math.random() - 0.5) * this.worldSize * 0.7
            ));
        }

        // Park trees (simple cylinders + spheres)
        const trunkMat = new THREE.MeshLambertMaterial({ color: 0x4a3010 });
        const leafMat  = new THREE.MeshLambertMaterial({ color: 0x2a6a1a });
        for (let i = 0; i < 200; i++) {
            const tx = (Math.random() - 0.5) * this.worldSize * 0.85;
            const tz = (Math.random() - 0.5) * this.worldSize * 0.85;
            const th = 4 + Math.random() * 5;
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.4, th, 6), trunkMat.clone());
            trunk.position.set(tx, th / 2, tz);
            this.scene.add(trunk);
            const leaves = new THREE.Mesh(new THREE.SphereGeometry(2.5 + Math.random() * 1.5, 7, 7), leafMat.clone());
            leaves.position.set(tx, th + 1.5, tz);
            this.scene.add(leaves);
        }

        // Park benches along main roads
        const benchMat = new THREE.MeshLambertMaterial({ color: 0x6b4020 });
        for (let i = 0; i < 40; i++) {
            const bx = (Math.random() - 0.5) * this.worldSize * 0.7;
            const bz = (Math.random() - 0.5) * this.worldSize * 0.7;
            const bench = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.2, 0.5), benchMat.clone());
            bench.position.set(bx, 0.5, bz);
            bench.rotation.y = Math.random() * Math.PI;
            this.scene.add(bench);
        }
    }

    createStreetLight(position) {
        const group = new THREE.Group();
        const poleMat = new THREE.MeshLambertMaterial({ color: 0x555555 });

        // Pole
        const poleGeo = new THREE.CylinderGeometry(0.08, 0.12, 7, 6);
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.y = 3.5;
        if (Math.random() > 0.5) pole.rotation.z = (Math.random() - 0.5) * 0.3;
        group.add(pole);

        // Arm
        const armGeo = new THREE.BoxGeometry(2, 0.1, 0.1);
        const arm = new THREE.Mesh(armGeo, poleMat);
        arm.position.set(1, 7, 0);
        group.add(arm);

        // Light fixture
        const fixGeo = new THREE.BoxGeometry(0.6, 0.15, 0.3);
        const fix = new THREE.Mesh(fixGeo, poleMat.clone());
        fix.position.set(1.8, 6.85, 0);
        group.add(fix);

        // Some still work (tracked for animation in main loop, not setInterval)
        if (Math.random() > 0.7) {
            const glowGeo = new THREE.SphereGeometry(1.2, 8, 8);
            const glowMat = new THREE.MeshBasicMaterial({ color: 0xffaa66, transparent: true, opacity: 0.4 });
            const glow = new THREE.Mesh(glowGeo, glowMat);
            glow.position.set(1.8, 6.8, 0);
            group.add(glow);
            this.animatedObjects.push({
                type: 'flicker',
                light: glow.material,
                phase: Math.random() * 100
            });
        }

        group.position.copy(position);
        this.scene.add(group);
    }

    createBarricade(position) {
        const group = new THREE.Group();
        const count = 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < count; i++) {
            const geo = new THREE.BoxGeometry(3, 1.3, 0.7);
            const mat = new THREE.MeshLambertMaterial({ color: 0x666660 });
            const barrier = new THREE.Mesh(geo, mat);
            barrier.position.set(i * 2.2 - count, 0.65, (Math.random() - 0.5) * 0.3);
            barrier.rotation.y = (Math.random() - 0.5) * 0.2;
            group.add(barrier);
        }
        group.position.copy(position);
        group.rotation.y = Math.random() * Math.PI;
        this.scene.add(group);
    }

    createOcean() {
        const waterTex = TextureGen.waterTexture();

        // Large ocean plane on one side of the map
        const oceanGeo = new THREE.PlaneGeometry(this.worldSize * 1.5, 300);
        const oceanMat = new THREE.MeshLambertMaterial({
            map: waterTex,
            color: 0x224466,
            transparent: true,
            opacity: 0.85
        });
        const ocean = new THREE.Mesh(oceanGeo, oceanMat);
        ocean.rotation.x = -Math.PI / 2;
        ocean.position.set(0, -0.5, this.worldSize / 2 + 100);
        this.scene.add(ocean);
        this.ocean = ocean;
        this.oceanMat = oceanMat;

        // Deeper ocean (second layer for depth illusion)
        const deepGeo = new THREE.PlaneGeometry(this.worldSize * 1.5, 300);
        const deepMat = new THREE.MeshLambertMaterial({
            color: 0x0a1a30,
        });
        const deep = new THREE.Mesh(deepGeo, deepMat);
        deep.rotation.x = -Math.PI / 2;
        deep.position.set(0, -2, this.worldSize / 2 + 100);
        this.scene.add(deep);

        // Beach / shoreline (sand strip)
        const beachGeo = new THREE.PlaneGeometry(this.worldSize * 1.5, 25);
        const beachMat = new THREE.MeshLambertMaterial({ color: 0xc2a868 });
        const beach = new THREE.Mesh(beachGeo, beachMat);
        beach.rotation.x = -Math.PI / 2;
        beach.position.set(0, -0.02, this.worldSize / 2 - 5);
        this.scene.add(beach);

        // Fog fades into ocean horizon
    }

    createFog() {
        // Less dense fog for the bigger world so player can see farther
        this.scene.fog = new THREE.FogExp2(0x1a0f10, 0.0018);
    }

    createPickups() {
        const pickupTypes = ['health', 'shield', 'ammo_railgun', 'ammo_rocket', 'ammo_emp', 'ammo_flame'];

        // Fewer pickups for performance (20 instead of 40)
        for (let i = 0; i < 20; i++) {
            const type = pickupTypes[Math.floor(Math.random() * pickupTypes.length)];
            const position = new THREE.Vector3(
                (Math.random() - 0.5) * this.worldSize * 0.6,
                1,
                (Math.random() - 0.5) * this.worldSize * 0.6
            );
            this.createPickup(type, position);
        }
    }

    createPickup(type, position) {
        const group = new THREE.Group();
        let color;

        switch (type) {
            case 'health': color = 0x00ff66; break;
            case 'shield': color = 0x0088ff; break;
            default: color = 0xffaa00; break;
        }

        const boxGeo = new THREE.BoxGeometry(0.7, 0.7, 0.7);
        const boxMat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.8
        });
        group.add(new THREE.Mesh(boxGeo, boxMat));

        // NO point light per pickup (huge performance drain!)
        // Just emissive mesh only
        const glowGeo = new THREE.SphereGeometry(0.7, 6, 6);
        const glowMat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.12
        });
        group.add(new THREE.Mesh(glowGeo, glowMat));

        group.position.copy(position);
        group.userData = { type, collected: false };

        this.scene.add(group);
        this.pickups.push(group);
    }

    updatePickups(playerPosition, weaponSystem, playerState) {
        const pickupRadius = 3;

        for (const pickup of this.pickups) {
            if (pickup.userData.collected) continue;

            pickup.position.y = 1 + Math.sin(Date.now() * 0.003 + pickup.position.x) * 0.3;
            pickup.children[0].rotation.y += 0.02;
            pickup.children[0].rotation.x += 0.01;

            const dist = pickup.position.distanceTo(playerPosition);
            if (dist < pickupRadius) {
                const type = pickup.userData.type;
                let collected = false;

                if (type === 'health' && playerState.health < 100) {
                    playerState.health = Math.min(100, playerState.health + 30);
                    collected = true;
                } else if (type === 'shield' && playerState.shield < 100) {
                    playerState.shield = Math.min(100, playerState.shield + 25);
                    collected = true;
                } else if (type === 'ammo_railgun') {
                    weaponSystem.addAmmo('railgun', 10);
                    collected = true;
                } else if (type === 'ammo_rocket') {
                    weaponSystem.addAmmo('rocket', 5);
                    collected = true;
                } else if (type === 'ammo_emp') {
                    weaponSystem.addAmmo('emp', 8);
                    collected = true;
                } else if (type === 'ammo_flame') {
                    weaponSystem.addAmmo('flamethrower', 50);
                    collected = true;
                }

                if (collected) {
                    pickup.userData.collected = true;
                    this.scene.remove(pickup);
                    audioEngine.playPickup();

                    setTimeout(() => {
                        pickup.userData.collected = false;
                        pickup.position.set(
                            (Math.random() - 0.5) * this.worldSize * 0.6,
                            1,
                            (Math.random() - 0.5) * this.worldSize * 0.6
                        );
                        this.scene.add(pickup);
                    }, 30000);
                }
            }
        }
    }

    createFires() {
        // Fewer fires, no setInterval
        for (let i = 0; i < 8; i++) {
            const firePos = new THREE.Vector3(
                (Math.random() - 0.5) * this.worldSize * 0.5,
                0,
                (Math.random() - 0.5) * this.worldSize * 0.5
            );

            // ONE light per fire group
            const fireLight = new THREE.PointLight(0xff6622, 2, 18);
            fireLight.position.copy(firePos);
            fireLight.position.y = 2;
            this.scene.add(fireLight);

            // Fire spheres (3 per fire, not 5)
            const spheres = [];
            for (let j = 0; j < 3; j++) {
                const fGeo = new THREE.SphereGeometry(0.2 + Math.random() * 0.2, 4, 4);
                const fMat = new THREE.MeshBasicMaterial({
                    color: new THREE.Color().setHSL(0.05 + Math.random() * 0.04, 1, 0.5),
                    transparent: true,
                    opacity: 0.7
                });
                const fSphere = new THREE.Mesh(fGeo, fMat);
                fSphere.position.copy(firePos);
                fSphere.position.y = Math.random() * 2.5;
                fSphere.position.x += (Math.random() - 0.5) * 1;
                fSphere.position.z += (Math.random() - 0.5) * 1;
                this.scene.add(fSphere);
                spheres.push(fSphere);
            }

            this.fireObjects.push({
                light: fireLight,
                spheres: spheres,
                basePos: firePos.clone(),
                baseIntensity: 1.5 + Math.random()
            });
        }
    }

    updateFires(time) {
        for (const fire of this.fireObjects) {
            fire.light.intensity = fire.baseIntensity + Math.sin(time * 8 + fire.basePos.x) * 1;
            fire.spheres.forEach((s, i) => {
                s.position.y = fire.basePos.y + 0.5 + Math.sin(time * 3 + i * 2) * 0.5 + i * 0.5;
                s.material.opacity = 0.3 + Math.sin(time * 5 + i) * 0.3;
                s.scale.setScalar(0.8 + Math.sin(time * 4 + i * 3) * 0.3);
            });
        }
    }

    updateAnimations(time) {
        // Flickering street lights
        for (const obj of this.animatedObjects) {
            if (obj.type === 'flicker') {
                const flick = Math.sin(time * 15 + obj.phase) * Math.sin(time * 23 + obj.phase);
                obj.light.intensity = flick > 0.3 ? 0.8 : 0;
            }
        }

        // Ocean wave animation
        if (this.ocean) {
            const tex = this.oceanMat.map;
            if (tex) {
                tex.offset.x = Math.sin(time * 0.3) * 0.02;
                tex.offset.y = time * 0.01;
            }
        }

        // Interior ceiling fans rotation
        for (const fan of this.interiorFans) {
            fan.rotation.y += 0.05;
        }
    }

    createParticles() {
        // Fewer particles (150 instead of 500)
        const particleCount = 150;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * this.worldSize;
            positions[i * 3 + 1] = Math.random() * 25;
            positions[i * 3 + 2] = (Math.random() - 0.5) * this.worldSize;

            if (Math.random() > 0.85) {
                colors[i * 3] = 1;
                colors[i * 3 + 1] = 0.3;
                colors[i * 3 + 2] = 0;
            } else {
                colors[i * 3] = 0.3;
                colors[i * 3 + 1] = 0.3;
                colors[i * 3 + 2] = 0.3;
            }
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.15,
            vertexColors: true,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    updateParticles() {
        if (!this.particles) return;

        const positions = this.particles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += Math.sin(Date.now() * 0.00008 + i) * 0.015;
            positions[i + 1] += 0.015;
            positions[i + 2] += Math.cos(Date.now() * 0.00008 + i) * 0.015;

            if (positions[i + 1] > 25) {
                positions[i + 1] = 0;
                positions[i] = (Math.random() - 0.5) * this.worldSize;
                positions[i + 2] = (Math.random() - 0.5) * this.worldSize;
            }
        }
        this.particles.geometry.attributes.position.needsUpdate = true;
    }
}
