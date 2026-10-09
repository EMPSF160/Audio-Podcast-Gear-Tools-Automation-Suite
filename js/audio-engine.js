/**
 * RØDE International - Web Audio API Acoustic Engine & Real-Time Visualizer
 */

class RodeAudioEngine {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.currentMicType = "nt1";
    this.activeToneOsc = null;
    this.noiseNode = null;
    this.gainNode = null;
    this.filterNode = null;
    this.analyser = null;
    this.animFrameId = null;
    this.labAnimFrameId = null;
    
    // DSP Settings
    this.roomType = "treated"; // treated | bedroom | echo
    this.dspNoiseGate = true;
    this.dspExciter = true;
    this.dspBigBottom = true;
    this.dspHighPass = false;

    this.initCanvas();
  }

  ensureContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  initCanvas() {
    // Top visualizer canvas
    this.canvas = document.getElementById("audio-visualizer-canvas");
    if (this.canvas) {
      this.canvasCtx = this.canvas.getContext("2d");
      this.drawIdleVisualizer(this.canvas, this.canvasCtx);
    }

    // Acoustic Lab Canvas
    this.labCanvas = document.getElementById("acoustic-lab-canvas");
    if (this.labCanvas) {
      this.labCanvasCtx = this.labCanvas.getContext("2d");
      this.drawIdleLabCanvas();
    }
  }

  drawIdleVisualizer(canvas, ctx) {
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#0c0e14";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barCount = 28;
    const barWidth = 6;
    const gap = 4;
    ctx.fillStyle = "rgba(212, 175, 55, 0.35)";

    for (let i = 0; i < barCount; i++) {
      const h = Math.max(3, Math.sin(i * 0.4) * 10 + 12);
      ctx.fillRect(i * (barWidth + gap) + 4, canvas.height - h, barWidth, h);
    }
  }

  drawIdleLabCanvas() {
    if (!this.labCanvas || !this.labCanvasCtx) return;
    const ctx = this.labCanvasCtx;
    const w = this.labCanvas.width;
    const h = this.labCanvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#080a0e";
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Flat reference curve (NT1 5th Gen response)
    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.55);

    for (let x = 0; x < w; x += 10) {
      const freqFactor = x / w;
      // Simulate ultra-flat curve with slight airy 12kHz high presence boost
      let curveY = h * 0.5;
      if (freqFactor > 0.6) {
        curveY -= Math.sin((freqFactor - 0.6) * Math.PI) * 14;
      }
      ctx.lineTo(x, curveY);
    }
    ctx.stroke();
  }

  playMicTone(micType = "nt1", filterType = "flat") {
    this.ensureContext();
    if (this.isPlaying) {
      this.stop();
      return false;
    }

    this.currentMicType = micType;
    this.isPlaying = true;

    // Create Tone Generator for rich harmonic studio warmth
    const now = this.audioCtx.currentTime;
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 64;

    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.setValueAtTime(0.01, now);
    this.gainNode.gain.exponentialRampToValueAtTime(0.18, now + 0.1);

    // Multi-oscillator cluster to simulate voice fundamental & harmonics (220Hz A3 + 440Hz + 660Hz)
    const osc1 = this.audioCtx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(220, now);

    const osc2 = this.audioCtx.createOscillator();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(440, now);

    const osc3 = this.audioCtx.createOscillator();
    osc3.type = "sine";
    osc3.frequency.setValueAtTime(660, now);

    // Apply Filter based on mode
    this.filterNode = this.audioCtx.createBiquadFilter();
    if (filterType === "clarity") {
      this.filterNode.type = "peaking";
      this.filterNode.frequency.setValueAtTime(3200, now);
      this.filterNode.gain.setValueAtTime(6, now);
    } else if (filterType === "broadcast") {
      this.filterNode.type = "lowshelf";
      this.filterNode.frequency.setValueAtTime(180, now);
      this.filterNode.gain.setValueAtTime(5, now);
    } else {
      this.filterNode.type = "allpass";
    }

    // Connect audio graph
    osc1.connect(this.filterNode);
    osc2.connect(this.filterNode);
    osc3.connect(this.filterNode);

    this.filterNode.connect(this.gainNode);
    this.gainNode.connect(this.analyser);
    this.analyser.connect(this.audioCtx.destination);

    osc1.start(now);
    osc2.start(now);
    osc3.start(now);

    this.activeToneOsc = [osc1, osc2, osc3];

    this.startCanvasAnimation();
    return true;
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    if (this.activeToneOsc) {
      this.activeToneOsc.forEach(osc => {
        try { osc.stop(); } catch(e){}
      });
      this.activeToneOsc = null;
    }
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    this.drawIdleVisualizer(this.canvas, this.canvasCtx);
  }

  startCanvasAnimation() {
    if (!this.analyser || !this.canvas || !this.canvasCtx) return;
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      if (!this.isPlaying) return;
      this.animFrameId = requestAnimationFrame(render);
      this.analyser.getByteFrequencyData(dataArray);

      const ctx = this.canvasCtx;
      const w = this.canvas.width;
      const h = this.canvas.height;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#0c0e14";
      ctx.fillRect(0, 0, w, h);

      const barWidth = 7;
      const gap = 3;
      const totalBars = Math.floor(w / (barWidth + gap));

      for (let i = 0; i < totalBars; i++) {
        const val = dataArray[i % bufferLength] || 0;
        const barHeight = Math.max(3, (val / 255) * (h - 4));

        const grad = ctx.createLinearGradient(0, h, 0, 0);
        grad.addColorStop(0, "#d4af37");
        grad.addColorStop(1, "#f7e089");

        ctx.fillStyle = grad;
        ctx.fillRect(i * (barWidth + gap) + 4, h - barHeight, barWidth, barHeight);
      }
    };

    render();
  }

  // Acoustic Lab Simulation
  simulateAcousticRoom(room, dspSettings) {
    this.roomType = room;
    if (dspSettings) {
      this.dspNoiseGate = dspSettings.noiseGate;
      this.dspExciter = dspSettings.exciter;
      this.dspBigBottom = dspSettings.bigBottom;
      this.dspHighPass = dspSettings.highPass;
    }
    this.drawLabResponse();
  }

  drawLabResponse() {
    if (!this.labCanvas || !this.labCanvasCtx) return;
    const ctx = this.labCanvasCtx;
    const w = this.labCanvas.width;
    const h = this.labCanvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#080a0e";
    ctx.fillRect(0, 0, w, h);

    // Draw Grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // Curve based on Room and DSP
    ctx.beginPath();
    ctx.lineWidth = 3;

    if (this.roomType === "treated") {
      ctx.strokeStyle = "#d4af37"; // Clean gold
    } else if (this.roomType === "bedroom") {
      ctx.strokeStyle = "#38bdf8"; // Blue with mild bumps
    } else {
      ctx.strokeStyle = "#f87171"; // Echo red with harsh reflections
    }

    ctx.moveTo(0, h * 0.5);

    for (let x = 0; x <= w; x += 8) {
      const progress = x / w;
      let y = h * 0.5;

      // Low cut
      if (this.dspHighPass && progress < 0.15) {
        y += (0.15 - progress) * 200;
      }

      // Big bottom bass boost
      if (this.dspBigBottom && progress > 0.1 && progress < 0.3) {
        y -= Math.sin((progress - 0.1) * Math.PI * 5) * 16;
      }

      // Exciter clarity boost
      if (this.dspExciter && progress > 0.6) {
        y -= Math.sin((progress - 0.6) * Math.PI * 2.5) * 14;
      }

      // Room reverb/flutter resonance simulation
      if (this.roomType === "echo") {
        y += Math.sin(x * 0.15) * 12;
      } else if (this.roomType === "bedroom") {
        y += Math.sin(x * 0.08) * 6;
      }

      ctx.lineTo(x, Math.max(10, Math.min(h - 10, y)));
    }
    ctx.stroke();
  }
}

// Global Audio Engine Instance
window.audioEngine = new RodeAudioEngine();
