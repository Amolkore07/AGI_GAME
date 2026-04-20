/* ============================================
   PROCEDURAL TEXTURE GENERATOR
   Optimized for performance
   ============================================ */

const TextureGen = {

    createCanvas(w, h) {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        return { canvas: c, ctx: c.getContext('2d') };
    },

    noise(x, y, seed) {
        const n = Math.sin(x * 127.1 + y * 311.7 + seed * 43758.5453) * 43758.5453;
        return n - Math.floor(n);
    },

    // Ground texture - cracked concrete
    groundTexture() {
        const { canvas, ctx } = this.createCanvas(256, 256);

        for (let y = 0; y < 256; y += 2) {
            for (let x = 0; x < 256; x += 2) {
                const n = this.noise(x * 0.05, y * 0.05, 1);
                const n2 = this.noise(x * 0.1, y * 0.1, 2);
                const base = 45 + n * 25 + n2 * 10;
                ctx.fillStyle = `rgb(${base + 5},${base + 3},${base})`;
                ctx.fillRect(x, y, 2, 2);
            }
        }

        // Cracks
        ctx.strokeStyle = 'rgba(20,18,15,0.6)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            let cx = Math.random() * 256;
            let cy = Math.random() * 256;
            ctx.moveTo(cx, cy);
            for (let j = 0; j < 12; j++) {
                cx += (Math.random() - 0.5) * 40;
                cy += (Math.random() - 0.5) * 40;
                ctx.lineTo(cx, cy);
            }
            ctx.stroke();
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(15, 15);
        return tex;
    },

    // Wall texture - damaged concrete
    wallTexture() {
        const { canvas, ctx } = this.createCanvas(128, 128);

        for (let y = 0; y < 128; y += 2) {
            for (let x = 0; x < 128; x += 2) {
                const n = this.noise(x * 0.08, y * 0.08, 3);
                const base = 60 + n * 30;
                ctx.fillStyle = `rgb(${base + 8},${base + 5},${base})`;
                ctx.fillRect(x, y, 2, 2);
            }
        }

        ctx.strokeStyle = 'rgba(30,28,25,0.4)';
        ctx.lineWidth = 2;
        for (let y = 32; y < 128; y += 32) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(128, y);
            ctx.stroke();
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        return tex;
    },

    // Metal texture for robots
    metalTexture(tint = [100, 100, 110]) {
        const { canvas, ctx } = this.createCanvas(64, 64);

        for (let y = 0; y < 64; y += 2) {
            for (let x = 0; x < 64; x += 2) {
                const n = this.noise(x * 0.15, y * 0.15, 4);
                const base = 0.6 + n * 0.4;
                const r = Math.floor(tint[0] * base);
                const g = Math.floor(tint[1] * base);
                const b = Math.floor(tint[2] * base);
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(x, y, 2, 2);
            }
        }
        return new THREE.CanvasTexture(canvas);
    },

    // Glow texture for robot eyes
    glowTexture(color = [255, 0, 0]) {
        const { canvas, ctx } = this.createCanvas(32, 32);
        const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        grad.addColorStop(0, `rgba(${color[0]},${color[1]},${color[2]},1)`);
        grad.addColorStop(0.5, `rgba(${color[0]},${color[1]},${color[2]},0.4)`);
        grad.addColorStop(1, `rgba(${color[0]},${color[1]},${color[2]},0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 32, 32);
        return new THREE.CanvasTexture(canvas);
    },

    // Particle texture
    particleTexture(color = [255, 200, 50]) {
        const { canvas, ctx } = this.createCanvas(16, 16);
        const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        grad.addColorStop(0, `rgba(${color[0]},${color[1]},${color[2]},1)`);
        grad.addColorStop(1, `rgba(${color[0]},${color[1]},${color[2]},0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 16, 16);
        return new THREE.CanvasTexture(canvas);
    },

    // Destroyed building texture
    destroyedWallTexture() {
        const { canvas, ctx } = this.createCanvas(128, 128);

        for (let y = 0; y < 128; y += 2) {
            for (let x = 0; x < 128; x += 2) {
                const n = this.noise(x * 0.06, y * 0.06, 7);
                const base = 35 + n * 20;
                ctx.fillStyle = `rgb(${base + 10},${base + 5},${base})`;
                ctx.fillRect(x, y, 2, 2);
            }
        }

        // Scorch marks
        for (let i = 0; i < 2; i++) {
            const x = Math.random() * 128;
            const y = Math.random() * 128;
            const r = Math.random() * 30 + 15;
            const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
            grad.addColorStop(0, 'rgba(10,8,5,0.7)');
            grad.addColorStop(1, 'rgba(20,15,10,0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        return tex;
    },

    // Concrete road texture
    concreteRoadTexture() {
        const { canvas, ctx } = this.createCanvas(256, 256);

        // Concrete base - light gray
        for (let y = 0; y < 256; y += 2) {
            for (let x = 0; x < 256; x += 2) {
                const n = this.noise(x * 0.05, y * 0.05, 10);
                const n2 = this.noise(x * 0.15, y * 0.15, 11);
                const base = 110 + n * 20 + n2 * 10;
                ctx.fillStyle = `rgb(${base},${base - 2},${base - 5})`;
                ctx.fillRect(x, y, 2, 2);
            }
        }

        // Concrete seams / expansion joints
        ctx.strokeStyle = 'rgba(60,58,55,0.5)';
        ctx.lineWidth = 2;
        // Horizontal
        ctx.beginPath(); ctx.moveTo(0, 128); ctx.lineTo(256, 128); ctx.stroke();
        // Vertical  
        ctx.beginPath(); ctx.moveTo(128, 0); ctx.lineTo(128, 256); ctx.stroke();

        // Tire marks
        ctx.strokeStyle = 'rgba(40,38,35,0.15)';
        ctx.lineWidth = 8;
        for (let i = 0; i < 2; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * 256, 0);
            ctx.bezierCurveTo(
                Math.random() * 256, 80,
                Math.random() * 256, 170,
                Math.random() * 256, 256
            );
            ctx.stroke();
        }

        // Small cracks
        ctx.strokeStyle = 'rgba(50,48,45,0.4)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            let cx = Math.random() * 256;
            let cy = Math.random() * 256;
            ctx.moveTo(cx, cy);
            for (let j = 0; j < 6; j++) {
                cx += (Math.random() - 0.5) * 25;
                cy += (Math.random() - 0.5) * 25;
                ctx.lineTo(cx, cy);
            }
            ctx.stroke();
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(8, 8);
        return tex;
    },

    // Water texture for ocean
    waterTexture() {
        const { canvas, ctx } = this.createCanvas(256, 256);

        for (let y = 0; y < 256; y += 2) {
            for (let x = 0; x < 256; x += 2) {
                const n = this.noise(x * 0.03, y * 0.03, 20);
                const n2 = this.noise(x * 0.08, y * 0.08, 21);
                const r = 5 + n * 15;
                const g = 40 + n * 30 + n2 * 20;
                const b = 80 + n * 40 + n2 * 30;
                ctx.fillStyle = `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;
                ctx.fillRect(x, y, 2, 2);
            }
        }

        // Foam/wave lines
        ctx.strokeStyle = 'rgba(180,200,220,0.15)';
        ctx.lineWidth = 3;
        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            const y = Math.random() * 256;
            ctx.moveTo(0, y);
            for (let x = 0; x < 256; x += 20) {
                ctx.lineTo(x, y + Math.sin(x * 0.05) * 8);
            }
            ctx.stroke();
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(10, 10);
        return tex;
    }
};
