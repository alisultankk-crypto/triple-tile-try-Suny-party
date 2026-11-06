/**
 * 8-Bit Retro Chiptune & Arcade Sound Engine.
 * 100% Procedural Web Audio API with Pulse/Square waves, fast arpeggios,
 * triangle bass, noise bursts, and classic retro gamer SFX.
 */

import { MagicEffectType } from '../types/game';

class CosmicAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private bgmIntervalId: number | null = null;
  private bgmStep: number = 0;

  constructor() {}

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.isMuted ? 0 : 0.55;
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.55, this.ctx.currentTime, 0.05);
    }
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setTargetAtTime(muted ? 0 : 0.16, this.ctx.currentTime, 0.05);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  // ==========================================
  // 🕹️ 8-BIT RETRO CHIPTUNE SOUND EFFECTS
  // ==========================================

  /**
   * 8-битный короткий 'пип' при нажатии на карточку
   */
  public playTileTap() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const pitches = [523.25, 587.33, 659.25, 783.99]; // C5, D5, E5, G5
    const pitch = pitches[Math.floor(Math.random() * pitches.length)];

    osc.type = 'square'; // Classic NES pulse wave
    osc.frequency.setValueAtTime(pitch, t);
    osc.frequency.setValueAtTime(pitch * 1.5, t + 0.03); // Quick chiptune jump

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.09);
  }

  public playCardSound(variant: number) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const artifact = Math.max(0, variant) % 42;
    const pitch = 360 + (artifact % 7) * 47;
    const duration = 0.24 + (artifact % 4) * 0.04;
    const notes = artifact % 3 === 0 ? [1, 1.5, 2.25] : artifact % 3 === 1 ? [1, 1.25, 2] : [1, 1.6, 2.4];

    for (const [index, ratio] of notes.entries()) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = now + index * 0.035;
      osc.type = artifact % 2 === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(pitch * ratio, start);
      osc.frequency.exponentialRampToValueAtTime(pitch * ratio * (0.985 + (artifact % 5) * 0.01), start + duration);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(index === 0 ? 0.1 : 0.045, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(start);
      osc.stop(start + duration + 0.02);
    }
  }

  public playMatchChime() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    [1046.5, 1568, 2093].forEach((frequency, index) => {
      const start = now + index * 0.045;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(index === 0 ? 0.16 : 0.1, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.34);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(start);
      osc.stop(start + 0.36);
    });
  }

  public playPaintShot() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.18);
    gain.gain.setValueAtTime(0.13, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.21);
  }

  public playPaintHit() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const noiseBuffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.12), this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const noise = this.ctx.createBufferSource();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    noise.buffer = noiseBuffer;
    filter.type = 'lowpass';
    filter.frequency.value = 850;
    gain.gain.setValueAtTime(0.26, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(now);
  }

  public playPaintMiss() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.24);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.26);
  }

  /**
   * 8-битный пружинистый прыжок / забавный звук
   */
  public playFunnyBoing() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.18);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.23);
  }

  /**
   * 8-битный классический звук монетки при сборе 3 карт (Coin pickup)
   */
  public playTileEliminate() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    // B5 (987.77 Hz) to E6 (1318.51 Hz) - legendary NES coin interval
    osc.frequency.setValueAtTime(987.77, t);
    osc.frequency.setValueAtTime(1318.51, t + 0.08);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.setValueAtTime(0.3, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.38);
  }

  /**
   * 8-битный звук супер-заклинания при трипле
   */
  public playMagicBurst(effectType: MagicEffectType = 'arcane') {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;

    switch (effectType) {
      case 'fire': {
        // 8-bit explosion noise + square sweep
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(450, t);
        osc.frequency.exponentialRampToValueAtTime(80, t + 0.25);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.3);
        break;
      }
      case 'frost': {
        // High sparkling square chiptune
        [1046.5, 1318.5, 1567.98, 2093.0].forEach((freq, i) => {
          const stepT = t + i * 0.04;
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, stepT);
          gain.gain.setValueAtTime(0.18, stepT);
          gain.gain.exponentialRampToValueAtTime(0.001, stepT + 0.1);
          osc.connect(gain);
          gain.connect(this.masterGain!);
          osc.start(stepT);
          osc.stop(stepT + 0.12);
        });
        break;
      }
      case 'void': {
        // Mysterious 8-bit laser pulse
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(140, t + 0.2);
        gain.gain.setValueAtTime(0.28, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.24);
        break;
      }
      default: {
        // Classic 8-bit power zap
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, t);
        osc.frequency.linearRampToValueAtTime(880, t + 0.08);
        osc.frequency.linearRampToValueAtTime(1320, t + 0.16);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.24);
        break;
      }
    }
  }

  /**
   * Использование бустера (8-bit 1-up powerup)
   */
  public playBoosterUse() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    // E5, G5, E6, C6, D6, G6
    const freqs = [659.25, 783.99, 1318.51, 1046.5, 1174.66, 1567.98];
    freqs.forEach((freq, i) => {
      const t = this.ctx!.currentTime + i * 0.05;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(t);
      osc.stop(t + 0.1);
    });
  }

  /**
   * 8-битный звук поражения (Descent jingle)
   */
  public playGameOver() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const notes = [
      { f: 493.88, d: 0.14 }, // B4
      { f: 466.16, d: 0.14 }, // Bb4
      { f: 440.0, d: 0.14 },  // A4
      { f: 392.0, d: 0.4 },   // G4
    ];

    let timeAcc = 0;
    notes.forEach(({ f, d }) => {
      const t = this.ctx!.currentTime + timeAcc;
      timeAcc += d;

      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(f, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + d);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(t);
      osc.stop(t + d + 0.02);
    });
  }

  /**
   * 8-битный фанфар победы (8-Bit Victory Fanfare)
   */
  // Compatibility aliases
  public playMagicEffect(type: MagicEffectType = 'arcane', _combo?: number) {
    this.playMagicBurst(type);
  }

  public playVictory() {
    this.playLevelWin();
  }

  public playDefeat() {
    this.playGameOver();
  }

  public playSlotWarning() {
    this.playFunnyBoing();
  }

  public playBooster() {
    this.playBoosterUse();
  }

  public playTileElimination(_count?: number) {
    this.playTileEliminate();
  }

  public playLevelWin() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const notes = [
      { f: 523.25, d: 0.1 },  // C5
      { f: 523.25, d: 0.1 },  // C5
      { f: 523.25, d: 0.1 },  // C5
      { f: 523.25, d: 0.25 }, // C5
      { f: 415.3, d: 0.25 },  // Ab4
      { f: 466.16, d: 0.25 }, // Bb4
      { f: 523.25, d: 0.18 }, // C5
      { f: 0, d: 0.05 },      // rest
      { f: 466.16, d: 0.12 }, // Bb4
      { f: 523.25, d: 0.6 },  // C5
    ];

    let timeAcc = 0;
    notes.forEach(({ f, d }) => {
      if (f > 0) {
        const t = this.ctx!.currentTime + timeAcc;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(f, t);

        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + d);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(t);
        osc.stop(t + d + 0.02);
      }
      timeAcc += d;
    });
  }

  // ==========================================
  // 🎶 НАСТОЯЩАЯ 8-БИТНАЯ ЧИПТЮН МЕЛОДИЯ
  // ==========================================

  public toggleBGM(): boolean {
    this.initCtx();
    if (this.bgmPlaying) {
      this.stopBGM();
      return false;
    } else {
      this.startBGM();
      return true;
    }
  }

  public isBgmRunning(): boolean {
    return this.bgmPlaying;
  }

  /** Calm space synth with drifting notes and occasional satellite-like radio pings. */
  public startBGM() {
    if (this.bgmPlaying || !this.ctx || !this.masterGain) return;
    this.bgmPlaying = true;
    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.value = this.isMuted ? 0 : 0.16;
    this.bgmGain.connect(this.masterGain);

    const leadNotes = [
      523.25, 0, 659.25, 0, 783.99, 0, 659.25, 0,
      587.33, 0, 698.46, 0, 880, 0, 698.46, 0,
      493.88, 0, 587.33, 0, 739.99, 0, 587.33, 0,
      440, 0, 523.25, 0, 659.25, 0, 783.99, 0,
    ];

    const arpeggioChords = [
      [261.63, 392, 523.25, 659.25],
      [220, 329.63, 440, 587.33],
      [246.94, 369.99, 493.88, 659.25],
      [196, 293.66, 392, 523.25],
    ];

    this.bgmStep = 0;
    const stepMs = 235;

    const tick = () => {
      if (!this.bgmPlaying || !this.ctx || !this.bgmGain) return;

      const now = this.ctx.currentTime;
      const step = this.bgmStep;
      this.bgmStep = (this.bgmStep + 1) % leadNotes.length;

      const freq = leadNotes[step];
      if (freq > 0) {
        const leadOsc = this.ctx.createOscillator();
        const leadGain = this.ctx.createGain();

        leadOsc.type = 'sine';
        leadOsc.frequency.setValueAtTime(freq, now);

        leadGain.gain.setValueAtTime(0.055, now);
        leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        leadOsc.connect(leadGain);
        leadGain.connect(this.bgmGain);

        leadOsc.start(now);
        leadOsc.stop(now + 0.3);
      }

      const chordIdx = Math.floor(step / 8) % arpeggioChords.length;
      const chord = arpeggioChords[chordIdx];
      const arpNoteFreq = chord[step % 4];
      if (arpNoteFreq) {
        const arpOsc = this.ctx.createOscillator();
        const arpGain = this.ctx.createGain();

        arpOsc.type = 'triangle';
        arpOsc.frequency.setValueAtTime(arpNoteFreq * 2, now);

        arpGain.gain.setValueAtTime(0.025, now);
        arpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        arpOsc.connect(arpGain);
        arpGain.connect(this.bgmGain);

        arpOsc.start(now);
        arpOsc.stop(now + 0.2);
      }

      if (step % 4 === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();

        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(chord[0] / 2, now);

        bassGain.gain.setValueAtTime(0.045, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        bassOsc.connect(bassGain);
        bassGain.connect(this.bgmGain);

        bassOsc.start(now);
        bassOsc.stop(now + 0.52);
      }

      if (step % 11 === 6) {
        const ping = this.ctx.createOscillator();
        const pingGain = this.ctx.createGain();
        const pingFrequency = 1200 + (step % 5) * 170;
        ping.type = 'sine';
        ping.frequency.setValueAtTime(pingFrequency * 1.4, now);
        ping.frequency.exponentialRampToValueAtTime(pingFrequency, now + 0.12);
        pingGain.gain.setValueAtTime(0.001, now);
        pingGain.gain.linearRampToValueAtTime(0.06, now + 0.02);
        pingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
        ping.connect(pingGain);
        pingGain.connect(this.bgmGain);
        ping.start(now);
        ping.stop(now + 0.5);
      }
    };

    this.bgmIntervalId = window.setInterval(tick, stepMs);
  }

  public stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmIntervalId !== null) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
  }
}

export const puzzleSounds = new CosmicAudioEngine();
