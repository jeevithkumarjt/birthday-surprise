/* Audio system using Web Audio API — no external CDN dependency */
class AudioSystem {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.musicSource = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.sfxContext = null;
    this.isMusicPlaying = true;
    this.supported = true;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioContext = new AudioContext();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 0.15;
        this.masterGain.connect(this.audioContext.destination);

        this.musicGain = this.audioContext.createGain();
        this.musicGain.gain.value = 0.6;
        this.musicGain.connect(this.masterGain);

        this.sfxGain = this.audioContext.createGain();
        this.sfxGain.gain.value = 0.8;
        this.sfxGain.connect(this.masterGain);
      } else {
        this.supported = false;
      }
    } catch (e) {
      this.supported = false;
      console.warn('Web Audio API not supported');
    }

    this.initEventListeners();
  }

  initEventListeners() {
    const toggle = document.getElementById('music-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => this.toggleMusic());
    }
  }

  toggleMusic() {
    if (!this.supported) return;

    this.isMusicPlaying = !this.isMusicPlaying;
    this.musicGain.gain.setValueAtTime(
      this.musicGain.gain.value,
      this.audioContext.currentTime
    );
    this.musicGain.gain.exponentialRampToValueAtTime(
      this.isMusicPlaying ? 0.6 : 0.001,
      this.audioContext.currentTime + 2
    );

    const label = document.querySelector('.music-label');
    if (label) {
      label.textContent = this.isMusicPlaying ? 'Music: On' : 'Music: Off';
    }

    if (this.isMusicPlaying) {
      this.playMusic();
    } else {
      this.stopMusic();
    }
  }

  playMusic() {
    if (!this.supported || !this.audioContext) return;

    if (this.musicSource) {
      try {
        this.musicSource.stop();
      } catch (e) {}
    }

    const oscillator = this.audioContext.createOscillator();
    const filter = this.audioContext.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.value = 200;
    filter.Q.value = 1;

    oscillator.type = 'sine';
    oscillator.connect(filter);
    filter.connect(this.musicGain);

    oscillator.start();

    this.breathPattern(oscillator, filter);

    this.musicSource = oscillator;

    const melody = this.createMelody();
    melody.connect(this.musicGain);
    melody.start();
    this.melodySource = melody;

    this.musicSource = oscillator;
  }

  breathPattern(oscillator, filter) {
    const now = this.audioContext.currentTime;
    const baseFreq = 65;

    const frequencies = [baseFreq, baseFreq * 1.5, baseFreq * 2, baseFreq * 1.5];
    const times = [2, 3, 2, 4];

    let t = 0;
    frequencies.forEach((freq, i) => {
      setTimeout(() => {
        filter.frequency.exponentialRampToValueAtTime(
          Math.max(freq * 2, 100),
          this.audioContext.currentTime + times[i]
        );
      }, t * 1000);
      t += times[i];
    });
  }

  createMelody() {
    const now = this.audioContext.currentTime;
    const melody = this.audioContext.createOscillator();
    const melodyGain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    melody.type = 'triangle';
    melodyGain.gain.value = 0.3;
    filter.type = 'lowpass';
    filter.frequency.value = 800;

    melody.connect(melodyGain);
    melodyGain.connect(filter);
    filter.connect(this.musicGain);

    const happyBirthdayNotes = [
      { note: 264, dur: 0.5 }, { note: 264, dur: 0.5 },
      { note: 297, dur: 1 }, { note: 264, dur: 1 },
      { note: 330, dur: 1 }, { note: 321, dur: 2 },
      { note: 264, dur: 0.5 }, { note: 264, dur: 0.5 },
      { note: 297, dur: 1 }, { note: 264, dur: 1 },
      { note: 352, dur: 1 }, { note: 330, dur: 2 }
    ];

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = 0;
    gainNode.connect(melodyGain);

    let currentTime = now + 2;
    happyBirthdayNotes.forEach(({ note, dur }) => {
      const osc = this.audioContext.createOscillator();
      const env = this.audioContext.createGain();
      osc.type = 'sine';
      osc.frequency.value = note;
      env.gain.setValueAtTime(0, currentTime);
      env.gain.linearRampToValueAtTime(0.15, currentTime + 0.02);
      env.gain.exponentialRampToValueAtTime(0.001, currentTime + dur);
      osc.connect(env);
      env.connect(gainNode);
      osc.start(currentTime);
      osc.stop(currentTime + dur + 0.1);
      currentTime += dur;
    });

    return gainNode;
  }

  stopMusic() {
    if (!this.supported) return;
    if (this.musicSource) {
      try {
        this.musicSource.stop();
      } catch (e) {}
    }
    if (this.melodySource) {
      try {
        this.melodySource.stop();
      } catch (e) {}
    }
    this.musicSource = null;
    this.melodySource = null;
  }

  playClick() {
    if (!this.supported || !this.audioContext) return;
    const osc = this.audioContext.createOscillator();
    const env = this.audioContext.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880;
    env.gain.setValueAtTime(0, this.audioContext.currentTime);
    env.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.01);
    env.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);
    osc.connect(env);
    env.connect(this.sfxGain);
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.15);
  }

  playPop() {
    if (!this.supported || !this.audioContext) return;
    const osc = this.audioContext.createOscillator();
    const env = this.audioContext.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 440;
    env.gain.setValueAtTime(0, this.audioContext.currentTime);
    env.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.02);
    env.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.25);
    osc.connect(env);
    env.connect(this.sfxGain);
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2000;
    osc.connect(filter);
    filter.connect(env);
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.25);

    setTimeout(() => {
      const osc2 = this.audioContext.createOscillator();
      const env2 = this.audioContext.createGain();
      osc2.type = 'sine';
      osc2.frequency.value = 660;
      env2.gain.setValueAtTime(0, this.audioContext.currentTime);
      env2.gain.linearRampToValueAtTime(0.25, this.audioContext.currentTime + 0.01);
      env2.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
      osc2.connect(env2);
      env2.connect(this.sfxGain);
      osc2.start();
      osc2.stop(this.audioContext.currentTime + 0.2);
    }, 30);
  }

  playCandleBlow() {
    if (!this.supported || !this.audioContext) return;

    const noiseBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.3, this.audioContext.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }

    const noise = this.audioContext.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.3);

    const env = this.audioContext.createGain();
    env.gain.setValueAtTime(0, this.audioContext.currentTime);
    env.gain.linearRampToValueAtTime(0.4, this.audioContext.currentTime + 0.02);
    env.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);

    noise.connect(filter);
    filter.connect(env);
    env.connect(this.sfxGain);
    noise.start();
    noise.stop(this.audioContext.currentTime + 0.3);
  }

  playWhoosh() {
    if (!this.supported || !this.audioContext) return;
    const osc = this.audioContext.createOscillator();
    const env = this.audioContext.createGain();
    osc.type = 'sweep';
    osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2000, this.audioContext.currentTime + 0.15);
    env.gain.setValueAtTime(0, this.audioContext.currentTime);
    env.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.02);
    env.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);
    osc.connect(env);
    env.connect(this.sfxGain);
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.15);
  }

  playChime() {
    if (!this.supported || !this.audioContext) return;
    const now = this.audioContext.currentTime;

    const notes = [523, 587, 659, 784, 659, 587];
    notes.forEach((note, i) => {
      setTimeout(() => {
        const osc = this.audioContext.createOscillator();
        const env = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.value = note;
        filter.type = 'lowpass';
        filter.frequency.value = 2000;

        env.gain.setValueAtTime(0, this.audioContext.currentTime);
        env.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.01);
        env.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1);

        osc.connect(filter);
        filter.connect(env);
        env.connect(this.sfxGain);
        osc.start();
        osc.stop(this.audioContext.currentTime + 1);
      }, i * 120);
    });
  }

  playConfettiSound() {
    if (!this.supported || !this.audioContext) return;
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const osc = this.audioContext.createOscillator();
        const env = this.audioContext.createGain();
        const note = 400 + Math.random() * 600;
        const dur = 0.3 + Math.random() * 0.4;

        osc.type = 'sine';
        osc.frequency.value = note;

        env.gain.setValueAtTime(0, this.audioContext.currentTime);
        env.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 0.01);
        env.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + dur);

        osc.connect(env);
        env.connect(this.sfxGain);
        osc.start();
        osc.stop(this.audioContext.currentTime + dur);
      }, i * 50);
    }
  }

  vibrate(duration) {
    if (navigator.vibrate) {
      try {
        navigator.vibrate(duration);
      } catch (e) {}
    }
  }

  async unlock() {
    if (!this.supported || !this.audioContext) return;
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  start() {
    this.playMusic();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AudioSystem;
}
