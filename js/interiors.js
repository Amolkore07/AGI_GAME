/* ============================================
   INTERIOR GENERATOR
   Creates detailed house interiors with furniture
   Sofa, chairs, fans, stairs, windows, cupboards
   ============================================ */

class InteriorGenerator {
    constructor(scene) {
        this.scene = scene;
    }

    createInterior(buildingGroup, w, h, d) {
        const interiorGroup = new THREE.Group();

        // Interior floor
        const floorMat = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
        const floorGeo = new THREE.PlaneGeometry(w - 1, d - 1);
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0.1;
        interiorGroup.add(floor);

        // Interior walls (slightly inside the building)
        const wallMat = new THREE.MeshLambertMaterial({ color: 0xBBAA88, side: THREE.DoubleSide });
        const wallInset = 0.3;

        // Back wall
        const backWall = new THREE.Mesh(
            new THREE.PlaneGeometry(w - 1, h * 0.6),
            wallMat
        );
        backWall.position.set(0, h * 0.3, d / 2 - wallInset);
        backWall.rotation.y = Math.PI;
        interiorGroup.add(backWall);

        // Left wall
        const leftWall = new THREE.Mesh(
            new THREE.PlaneGeometry(d - 1, h * 0.6),
            wallMat.clone()
        );
        leftWall.position.set(-w / 2 + wallInset, h * 0.3, 0);
        leftWall.rotation.y = Math.PI / 2;
        interiorGroup.add(leftWall);

        // Right wall
        const rightWall = new THREE.Mesh(
            new THREE.PlaneGeometry(d - 1, h * 0.6),
            wallMat.clone()
        );
        rightWall.position.set(w / 2 - wallInset, h * 0.3, 0);
        rightWall.rotation.y = -Math.PI / 2;
        interiorGroup.add(rightWall);

        // Ceiling
        const ceilMat = new THREE.MeshLambertMaterial({ color: 0xCCBB99, side: THREE.DoubleSide });
        const ceiling = new THREE.Mesh(
            new THREE.PlaneGeometry(w - 1, d - 1),
            ceilMat
        );
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = h * 0.6;
        interiorGroup.add(ceiling);

        // Add furniture
        this.addSofa(interiorGroup, w, d);
        this.addChairs(interiorGroup, w, d);
        this.addTable(interiorGroup, w, d);
        this.addFan(interiorGroup, w, h, d);
        this.addCupboard(interiorGroup, w, d);
        this.addWindows(interiorGroup, w, h, d);
        this.addLamp(interiorGroup, w, d);

        // If building is tall enough, add stairs
        if (h > 15) {
            this.addStairs(interiorGroup, w, h, d);
            // Second floor
            const floor2 = new THREE.Mesh(
                new THREE.PlaneGeometry(w - 2, d - 1),
                floorMat.clone()
            );
            floor2.rotation.x = -Math.PI / 2;
            floor2.position.set(-0.5, h * 0.3, 0);
            interiorGroup.add(floor2);
        }

        buildingGroup.add(interiorGroup);
        return interiorGroup;
    }

    addSofa(group, w, d) {
        const sofaGroup = new THREE.Group();
        const fabricMat = new THREE.MeshLambertMaterial({ color: 0x664433 });
        const cushionMat = new THREE.MeshLambertMaterial({ color: 0x885544 });

        // Base
        const base = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, 0.4, 0.9),
            fabricMat
        );
        base.position.y = 0.3;
        sofaGroup.add(base);

        // Back
        const back = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, 0.8, 0.2),
            fabricMat
        );
        back.position.set(0, 0.7, 0.35);
        sofaGroup.add(back);

        // Arms
        const armGeo = new THREE.BoxGeometry(0.2, 0.5, 0.9);
        const armL = new THREE.Mesh(armGeo, fabricMat.clone());
        armL.position.set(-1.25, 0.55, 0);
        sofaGroup.add(armL);
        const armR = new THREE.Mesh(armGeo, fabricMat.clone());
        armR.position.set(1.25, 0.55, 0);
        sofaGroup.add(armR);

        // Cushions
        for (let i = -1; i <= 1; i++) {
            const cushion = new THREE.Mesh(
                new THREE.BoxGeometry(0.7, 0.15, 0.7),
                cushionMat
            );
            cushion.position.set(i * 0.8, 0.55, -0.05);
            sofaGroup.add(cushion);
        }

        // Pillows
        const pillowMat = new THREE.MeshLambertMaterial({ color: 0xCC8866 });
        const pillow = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.3, 0.15),
            pillowMat
        );
        pillow.position.set(-0.9, 0.65, 0.15);
        pillow.rotation.z = 0.2;
        sofaGroup.add(pillow);

        sofaGroup.position.set(0, 0, d / 2 - 1.5);
        group.add(sofaGroup);
    }

    addChairs(group, w, d) {
        // Two chairs around the table area
        this.createChair(group, -w / 4, 0, -d / 4 + 1, 0);
        this.createChair(group, -w / 4 + 1.5, 0, -d / 4 + 1, Math.PI);
    }

    createChair(group, x, y, z, rotY) {
        const chairGroup = new THREE.Group();
        const woodMat = new THREE.MeshLambertMaterial({ color: 0x6B4226 });
        const seatMat = new THREE.MeshLambertMaterial({ color: 0x884422 });

        // Seat
        const seat = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.06, 0.5),
            seatMat
        );
        seat.position.y = 0.5;
        chairGroup.add(seat);

        // Back
        const backRest = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.6, 0.06),
            woodMat
        );
        backRest.position.set(0, 0.8, 0.22);
        chairGroup.add(backRest);

        // 4 Legs
        const legGeo = new THREE.BoxGeometry(0.05, 0.5, 0.05);
        const positions = [
            [-0.2, 0.25, -0.2],
            [0.2, 0.25, -0.2],
            [-0.2, 0.25, 0.2],
            [0.2, 0.25, 0.2]
        ];
        positions.forEach(pos => {
            const leg = new THREE.Mesh(legGeo, woodMat);
            leg.position.set(...pos);
            chairGroup.add(leg);
        });

        chairGroup.position.set(x, y, z);
        chairGroup.rotation.y = rotY;
        group.add(chairGroup);
    }

    addTable(group, w, d) {
        const tableGroup = new THREE.Group();
        const woodMat = new THREE.MeshLambertMaterial({ color: 0x5C3317 });

        // Table top
        const top = new THREE.Mesh(
            new THREE.BoxGeometry(1.4, 0.08, 0.8),
            woodMat
        );
        top.position.y = 0.75;
        tableGroup.add(top);

        // Table legs
        const legGeo = new THREE.BoxGeometry(0.06, 0.75, 0.06);
        const legPositions = [
            [-0.6, 0.375, -0.3],
            [0.6, 0.375, -0.3],
            [-0.6, 0.375, 0.3],
            [0.6, 0.375, 0.3]
        ];
        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(legGeo, woodMat);
            leg.position.set(...pos);
            tableGroup.add(leg);
        });

        // Items on table: a cup and a book
        const cupMat = new THREE.MeshLambertMaterial({ color: 0xeeeeee });
        const cup = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.06, 0.12, 8),
            cupMat
        );
        cup.position.set(0.3, 0.86, 0.1);
        tableGroup.add(cup);

        const bookMat = new THREE.MeshLambertMaterial({ color: 0x880000 });
        const book = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.04, 0.15),
            bookMat
        );
        book.position.set(-0.2, 0.81, -0.1);
        book.rotation.y = 0.3;
        tableGroup.add(book);

        tableGroup.position.set(-w / 4 + 0.75, 0, -d / 4 + 1);
        group.add(tableGroup);
    }

    addFan(group, w, h, d) {
        const fanGroup = new THREE.Group();
        const metalMat = new THREE.MeshLambertMaterial({ color: 0x888888 });

        // Rod
        const rod = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.03, 1.5, 6),
            metalMat
        );
        rod.position.y = h * 0.6 - 0.75;
        fanGroup.add(rod);

        // Motor housing
        const motor = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.12, 0.2, 8),
            metalMat
        );
        motor.position.y = h * 0.6 - 1.5;
        fanGroup.add(motor);

        // Blades
        const bladeMat = new THREE.MeshLambertMaterial({ color: 0x776655 });
        for (let i = 0; i < 4; i++) {
            const blade = new THREE.Mesh(
                new THREE.BoxGeometry(0.8, 0.03, 0.15),
                bladeMat
            );
            blade.position.y = h * 0.6 - 1.55;
            blade.position.x = Math.cos(i * Math.PI / 2) * 0.45;
            blade.position.z = Math.sin(i * Math.PI / 2) * 0.45;
            blade.rotation.y = i * Math.PI / 2;
            fanGroup.add(blade);
        }

        // Store fan ref for rotation animation
        fanGroup.userData.isFan = true;
        fanGroup.userData.bladeStartIdx = 2; // Index of first blade child
        fanGroup.position.set(0, 0, 0);
        group.add(fanGroup);

        return fanGroup;
    }

    addStairs(group, w, h, d) {
        const stairMat = new THREE.MeshLambertMaterial({ color: 0x7B6B5A });
        const railMat = new THREE.MeshLambertMaterial({ color: 0x555555 });
        const stairWidth = 1.2;
        const stepCount = 10;
        const totalHeight = h * 0.3;
        const stepHeight = totalHeight / stepCount;
        const stepDepth = 0.35;

        for (let i = 0; i < stepCount; i++) {
            const step = new THREE.Mesh(
                new THREE.BoxGeometry(stairWidth, stepHeight, stepDepth),
                stairMat
            );
            step.position.set(
                w / 2 - stairWidth / 2 - 0.8,
                i * stepHeight + stepHeight / 2,
                -d / 2 + 1 + i * stepDepth
            );
            group.add(step);
        }

        // Railing
        const railGeo = new THREE.BoxGeometry(0.05, totalHeight + 0.5, 0.05);
        const rail1 = new THREE.Mesh(railGeo, railMat);
        rail1.position.set(
            w / 2 - stairWidth - 0.8 + 0.05,
            totalHeight / 2,
            -d / 2 + 1
        );
        group.add(rail1);

        const rail2 = new THREE.Mesh(railGeo.clone(), railMat);
        rail2.position.set(
            w / 2 - stairWidth - 0.8 + 0.05,
            totalHeight / 2 + 0.3,
            -d / 2 + 1 + stepCount * stepDepth
        );
        group.add(rail2);

        // Handrail
        const handLen = Math.sqrt(totalHeight * totalHeight + (stepCount * stepDepth) * (stepCount * stepDepth));
        const handAngle = Math.atan2(totalHeight, stepCount * stepDepth);
        const handrail = new THREE.Mesh(
            new THREE.BoxGeometry(0.04, handLen, 0.04),
            railMat
        );
        handrail.position.set(
            w / 2 - stairWidth - 0.8 + 0.05,
            totalHeight / 2 + 0.3,
            -d / 2 + 1 + (stepCount * stepDepth) / 2
        );
        handrail.rotation.x = -handAngle + Math.PI / 2;
        group.add(handrail);
    }

    addCupboard(group, w, d) {
        const cupboardGroup = new THREE.Group();
        const woodMat = new THREE.MeshLambertMaterial({ color: 0x5C4033 });
        const handleMat = new THREE.MeshLambertMaterial({ color: 0xCCAA00 });

        // Main body
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 2.0, 0.5),
            woodMat
        );
        body.position.y = 1.0;
        cupboardGroup.add(body);

        // Divider shelf
        const shelf = new THREE.Mesh(
            new THREE.BoxGeometry(1.1, 0.04, 0.45),
            woodMat
        );
        shelf.position.y = 1.0;
        cupboardGroup.add(shelf);

        // Doors (visual lines)
        const doorLine = new THREE.Mesh(
            new THREE.BoxGeometry(0.02, 1.9, 0.02),
            new THREE.MeshLambertMaterial({ color: 0x3a2a1a })
        );
        doorLine.position.set(0, 1.0, -0.26);
        cupboardGroup.add(doorLine);

        // Handles
        for (let i = -1; i <= 1; i += 2) {
            const handle = new THREE.Mesh(
                new THREE.SphereGeometry(0.03, 6, 6),
                handleMat
            );
            handle.position.set(i * 0.12, 1.0, -0.27);
            cupboardGroup.add(handle);
        }

        // Top decoration
        const topMat = new THREE.MeshLambertMaterial({ color: 0x4a3a2a });
        const topPiece = new THREE.Mesh(
            new THREE.BoxGeometry(1.3, 0.08, 0.55),
            topMat
        );
        topPiece.position.y = 2.04;
        cupboardGroup.add(topPiece);

        cupboardGroup.position.set(w / 2 - 1.2, 0, d / 4);
        group.add(cupboardGroup);
    }

    addWindows(group, w, h, d) {
        // Interior window frames (light coming through)
        const frameMat = new THREE.MeshLambertMaterial({ color: 0x444444 });
        const lightMat = new THREE.MeshBasicMaterial({
            color: 0xffeedd,
            transparent: true,
            opacity: 0.25
        });

        // Left wall window
        const frameL = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 1.2, 1.0),
            frameMat
        );
        frameL.position.set(-w / 2 + 0.35, h * 0.25, 0);
        group.add(frameL);

        const lightL = new THREE.Mesh(
            new THREE.PlaneGeometry(0.9, 1.1),
            lightMat
        );
        lightL.position.set(-w / 2 + 0.36, h * 0.25, 0);
        lightL.rotation.y = Math.PI / 2;
        group.add(lightL);

        // Right wall window
        const frameR = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 1.2, 1.0),
            frameMat
        );
        frameR.position.set(w / 2 - 0.35, h * 0.25, 0);
        group.add(frameR);

        const lightR = new THREE.Mesh(
            new THREE.PlaneGeometry(0.9, 1.1),
            lightMat
        );
        lightR.position.set(w / 2 - 0.36, h * 0.25, 0);
        lightR.rotation.y = -Math.PI / 2;
        group.add(lightR);
    }

    addLamp(group, w, d) {
        const lampGroup = new THREE.Group();
        const poleMat = new THREE.MeshLambertMaterial({ color: 0x555555 });
        const shadeMat = new THREE.MeshLambertMaterial({ color: 0xDDCC99 });

        // Base
        const base = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.18, 0.05, 8),
            poleMat
        );
        base.position.y = 0.025;
        lampGroup.add(base);

        // Pole
        const pole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.03, 1.4, 6),
            poleMat
        );
        pole.position.y = 0.75;
        lampGroup.add(pole);

        // Shade
        const shade = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.25, 0.3, 8, 1, true),
            shadeMat
        );
        shade.position.y = 1.5;
        lampGroup.add(shade);

        // Light (removed PointLight for massive perf boost)
        const lightGeo = new THREE.SphereGeometry(0.12, 6, 6);
        const lightMat = new THREE.MeshBasicMaterial({ color: 0xffddaa });
        const light = new THREE.Mesh(lightGeo, lightMat);
        light.position.y = 1.45;
        lampGroup.add(light);

        lampGroup.position.set(w / 4, 0, d / 2 - 1);
        group.add(lampGroup);
    }
}
