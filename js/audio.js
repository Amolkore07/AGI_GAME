/* ============================================
   AUDIO ENGINE - Web Audio API Sound System
   Creates all game sounds procedurally
   ============================================ */

class AudioEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.initialized = false;
        this.musicPlaying = false;
    }

    init() {
        if (this.initialized) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.5;
        this.masterGain.connect(this.ctx.destination);
        this.initialized = true;
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // Generate a gunshot sound
    playGunshot(type = 'plasma') {
        if (!this.initialized) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        if (type === 'plasma') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(3000, now);
            filter.frequency.exponentialRampToValueAtTime(200, now + 0.15);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        } else if (type === 'railgun') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(2000, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.4);
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(5000, now);
            gain.gain.setValueAtTime(0.5, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        } else if (type === 'flame') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.setValueAtTime(250, now + 0.05);
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(500, now);
            filter.Q.value = 0.5;
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.setValueAtTime(0.001, now + 0.1);
        } else if (type === 'rocket') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1000, now);
            gain.gain.setValueAtTime(0.4, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        } else if (type === 'emp') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(4000, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.5);
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(1000, now);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        }

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.5);
    }

    // Explosion sound
    playExplosion(intensity = 1) {
        if (!this.initialized) return;
        const now = this.ctx.currentTime;

        // Noise burst
        const bufferSize = this.ctx.sampleRate * 0.8;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800 * intensity, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + 0.5);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.6 * intensity, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        noise.start(now);

        // Sub-bass thump
        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(60 * intensity, now);
        sub.frequency.exponentialRampToValueAtTime(20, now + 0.5);
        subGain.gain.setValueAtTime(0.5 * intensity, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        sub.connect(subGain);
        subGain.connect(this.masterGain);
        sub.start(now);
        sub.stop(now + 0.7);
    }

    // Robot death sound
    playRobotDeath() {
        if (!this.initialized) return;
        const now = this.ctx.currentTime;

        // Electronic spark
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.setValueAtTime(400, now + 0.1);
        osc.frequency.setValueAtTime(2000, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.6);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.7);

        this.playExplosion(0.5);
    }

    // Hit marker sound
    playHitMarker() {
        if (!this.initialized) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1500, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.06);
    }

    // Player damage sound
    playDamage() {
        if (!this.initialized) return;
        const now = this.ctx.currentTime;

        const bufferSize = this.ctx.sampleRate * 0.3;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        noise.connect(gain);
        gain.connect(this.masterGain);
        noise.start(now);
    }

    // Pickup sound
    playPickup() {
        if (!this.initialized) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.setValueAtTime(900, now + 0.1);
        osc.frequency.setValueAtTime(1200, now + 0.2);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.35);
    }

    // Ambient drone for atmosphere
    startAmbience() {
        if (!this.initialized || this.musicPlaying) return;
        this.musicPlaying = true;

        const now = this.ctx.currentTime;

        // Deep drone
        const drone1 = this.ctx.createOscillator();
        const droneGain1 = this.ctx.createGain();
        drone1.type = 'sine';
        drone1.frequency.value = 40;
        droneGain1.gain.value = 0.05;
        drone1.connect(droneGain1);
        droneGain1.connect(this.masterGain);
        drone1.start(now);

        // High tension
        const drone2 = this.ctx.createOscillator();
        const droneGain2 = this.ctx.createGain();
        drone2.type = 'triangle';
        drone2.frequency.value = 220;
        droneGain2.gain.value = 0.02;
        drone2.connect(droneGain2);
        droneGain2.connect(this.masterGain);
        drone2.start(now);

        // LFO modulation
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.value = 0.1;
        lfoGain.gain.value = 5;
        lfo.connect(lfoGain);
        lfoGain.connect(drone1.frequency);
        lfo.start(now);

        this.ambientNodes = [drone1, drone2, lfo];
    }

    stopAmbience() {
        if (this.ambientNodes) {
            this.ambientNodes.forEach(n => {
                try { n.stop(); } catch (e) { }
            });
            this.ambientNodes = null;
        }
        this.musicPlaying = false;
    }

    // Reload sound
    playReload() {
        if (!this.initialized) return;
        const now = this.ctx.currentTime;

        // Click
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.setValueAtTime(500, now + 0.05);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.1);

        // Slide
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(200, now + 0.3);
        osc2.frequency.setValueAtTime(400, now + 0.45);
        gain2.gain.setValueAtTime(0, now);
        gain2.gain.setValueAtTime(0.08, now + 0.3);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc2.connect(gain2);
        gain2.connect(this.masterGain);
        osc2.start(now + 0.3);
        osc2.stop(now + 0.55);
    }

    // EMP discharge
    playEMP() {
        if (!this.initialized) return;
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(5000, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.8);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2000, now);
        filter.frequency.exponentialRampToValueAtTime(200, now + 0.8);
        filter.Q.value = 5;

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.9);
    }

    // Footstep sound
    playFootstep() {
        if (!this.initialized) return;
        const now = this.ctx.currentTime;

        const bufferSize = this.ctx.sampleRate * 0.1;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.05));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 300;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        noise.start(now);
    }
}

const audioEngine = new AudioEngine();
