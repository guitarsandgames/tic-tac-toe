import { SoundTheme, Player } from '../types';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.8;
  private currentFanfareNodes: { stop: () => void }[] = [];
  private isPlayingFanfare: boolean = false;
  public onMusicStateChange?: (isPlaying: boolean) => void;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopFanfare();
    }
  }

  public getMuted() {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume() {
    return this.volume;
  }

  /**
   * Distinct, flashy sound when Player X makes a move
   */
  public playPlayerXSound(theme: SoundTheme = 'cyber') {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 0.9, now);
    masterGain.connect(ctx.destination);

    if (theme === 'cyber') {
      // Cyber Zap / Laser pulse + high sparkle
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(220, now + 0.18);

      osc2.frequency.setValueAtTime(1320, now);
      osc2.frequency.exponentialRampToValueAtTime(440, now + 0.18);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3500, now);
      filter.frequency.exponentialRampToValueAtTime(800, now + 0.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(filter);
      filter.connect(masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.22);
      osc2.stop(now + 0.22);
    } else if (theme === 'retro') {
      // 8-bit snappy arpeggio (C5 -> E5 -> G5 -> C6)
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, idx) => {
        const stepTime = now + idx * 0.04;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, stepTime);
        gain.gain.setValueAtTime(0.35, stepTime);
        gain.gain.exponentialRampToValueAtTime(0.01, stepTime + 0.045);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(stepTime);
        osc.stop(stepTime + 0.05);
      });
    } else {
      // Cosmic crystalline chime
      const osc = ctx.createOscillator();
      const oscMod = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, now); // C6
      osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.25); // E6

      oscMod.type = 'sine';
      oscMod.frequency.setValueAtTime(2093, now); // C7

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      oscMod.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      oscMod.start(now);
      osc.stop(now + 0.4);
      oscMod.stop(now + 0.4);
    }
  }

  /**
   * Distinct, flashy sound when Player O makes a move
   */
  public playPlayerOSound(theme: SoundTheme = 'cyber') {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 0.9, now);
    masterGain.connect(ctx.destination);

    if (theme === 'cyber') {
      // Neon Orb drop / resonant pulse
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(320, now);
      osc1.frequency.exponentialRampToValueAtTime(580, now + 0.08);
      osc1.frequency.exponentialRampToValueAtTime(440, now + 0.25);

      osc2.frequency.setValueAtTime(640, now);
      osc2.frequency.exponentialRampToValueAtTime(880, now + 0.08);
      osc2.frequency.exponentialRampToValueAtTime(660, now + 0.25);

      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.Q.setValueAtTime(3, now);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(filter);
      filter.connect(masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.3);
      osc2.stop(now + 0.3);
    } else if (theme === 'retro') {
      // 8-bit pulse bounce (A4 -> D5 -> F#5 -> A5)
      const freqs = [440, 587.33, 739.99, 880];
      freqs.forEach((freq, idx) => {
        const stepTime = now + idx * 0.04;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, stepTime);
        gain.gain.setValueAtTime(0.4, stepTime);
        gain.gain.exponentialRampToValueAtTime(0.01, stepTime + 0.05);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(stepTime);
        osc.stop(stepTime + 0.06);
      });
    } else {
      // Cosmic warm resonant gong
      const osc = ctx.createOscillator();
      const oscSub = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(392, now); // G4
      oscSub.type = 'sine';
      oscSub.frequency.setValueAtTime(196, now); // G3

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      oscSub.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      oscSub.start(now);
      osc.stop(now + 0.45);
      oscSub.stop(now + 0.45);
    }
  }

  public playTurnSound(player: Player, theme: SoundTheme = 'cyber') {
    if (player === 'X') {
      this.playPlayerXSound(theme);
    } else {
      this.playPlayerOSound(theme);
    }
  }

  /**
   * Epic synthesized winner music / fanfare sequence
   */
  public playWinnerFanfare(winner: Player, theme: SoundTheme = 'cyber') {
    if (this.isMuted) return;
    this.stopFanfare();

    const ctx = this.initContext();
    if (!ctx) return;

    this.isPlayingFanfare = true;
    if (this.onMusicStateChange) this.onMusicStateChange(true);

    const now = ctx.currentTime + 0.05;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 0.85, now);
    masterGain.connect(ctx.destination);

    // Track active nodes to be able to stop cleanly
    const trackedStoppers: { stop: () => void }[] = [];

    const playTone = (
      freq: number,
      startTime: number,
      duration: number,
      type: OscillatorType = 'triangle',
      vol: number = 0.3,
      detune: number = 0
    ) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);
      osc.detune.setValueAtTime(detune, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(vol, startTime + 0.03);
      gain.gain.setValueAtTime(vol, startTime + duration - 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(startTime);
      osc.stop(startTime + duration);

      trackedStoppers.push({
        stop: () => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {
            // ignore
          }
        },
      });
    };

    const playBassNote = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.4, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(startTime);
      osc.stop(startTime + duration);

      trackedStoppers.push({
        stop: () => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {
            // ignore
          }
        },
      });
    };

    // Melody & Chord structure for winner fanfare
    // Key of C Major / A Minor triumphant fanfare
    const noteFreqs: Record<string, number> = {
      C3: 130.81,
      E3: 164.81,
      F3: 174.61,
      G3: 196.0,
      A3: 220.0,
      B3: 246.94,
      C4: 261.63,
      D4: 293.66,
      E4: 329.63,
      F4: 349.23,
      G4: 392.0,
      A4: 440.0,
      B4: 493.88,
      C5: 523.25,
      D5: 587.33,
      E5: 659.25,
      F5: 698.46,
      G5: 783.99,
      A5: 880.0,
      B5: 987.77,
      C6: 1046.5,
    };

    const leadType: OscillatorType = theme === 'retro' ? 'square' : theme === 'cyber' ? 'sawtooth' : 'triangle';

    // Sequence 1: Introductory fanfare fanfare roll
    const introNotes = [
      { note: 'C4', dur: 0.12, t: 0.0 },
      { note: 'E4', dur: 0.12, t: 0.12 },
      { note: 'G4', dur: 0.12, t: 0.24 },
      { note: 'C5', dur: 0.35, t: 0.36 },
      // brief pause
      { note: 'G4', dur: 0.12, t: 0.75 },
      { note: 'C5', dur: 0.45, t: 0.88 },
      // Rise:
      { note: 'D5', dur: 0.12, t: 1.4 },
      { note: 'E5', dur: 0.12, t: 1.52 },
      { note: 'F5', dur: 0.12, t: 1.64 },
      { note: 'G5', dur: 0.6, t: 1.76 },
      // Grand Finale Triumphant Chords
      { note: 'E5', dur: 0.18, t: 2.45 },
      { note: 'F5', dur: 0.18, t: 2.65 },
      { note: 'G5', dur: 0.22, t: 2.85 },
      { note: 'C6', dur: 1.6, t: 3.1 },
    ];

    introNotes.forEach(({ note, dur, t }) => {
      const f = noteFreqs[note];
      playTone(f, now + t, dur, leadType, 0.32);
      // Add slight detuned chorus for richness
      playTone(f, now + t, dur, 'sine', 0.2, 8);
    });

    // Supporting chords & Bassline
    // Bar 1 (C Major)
    playBassNote(noteFreqs['C3'], now + 0.0, 0.6);
    playTone(noteFreqs['G3'], now + 0.0, 0.6, 'triangle', 0.15);
    playTone(noteFreqs['E4'], now + 0.0, 0.6, 'sine', 0.15);

    // Bar 2 (C Major bounce)
    playBassNote(noteFreqs['C3'], now + 0.75, 0.6);
    playTone(noteFreqs['E4'], now + 0.75, 0.6, 'sine', 0.15);

    // Bar 3 (F -> G Major)
    playBassNote(noteFreqs['F3'], now + 1.4, 0.35);
    playTone(noteFreqs['A3'], now + 1.4, 0.35, 'triangle', 0.15);
    playBassNote(noteFreqs['G3'], now + 1.76, 0.65);
    playTone(noteFreqs['B3'], now + 1.76, 0.65, 'triangle', 0.18);
    playTone(noteFreqs['D4'], now + 1.76, 0.65, 'sine', 0.18);

    // Bar 4: Climax Grand C Major Chord (C - E - G - C - E)
    const climaxTime = now + 3.1;
    const climaxDur = 1.6;
    playBassNote(noteFreqs['C3'], climaxTime, climaxDur);
    playTone(noteFreqs['G3'], climaxTime, climaxDur, 'triangle', 0.25);
    playTone(noteFreqs['C4'], climaxTime, climaxDur, 'sine', 0.25);
    playTone(noteFreqs['E4'], climaxTime, climaxDur, 'triangle', 0.25);
    playTone(noteFreqs['G4'], climaxTime, climaxDur, 'sine', 0.25);
    playTone(noteFreqs['E5'], climaxTime, climaxDur, 'triangle', 0.25);

    // Sparkle victory arpeggios at climax
    const sparkleNotes = ['C5', 'E5', 'G5', 'C6', 'E6', 'G6'];
    sparkleNotes.forEach((note, sIdx) => {
      const sFreq = noteFreqs[note] || 1318.51;
      playTone(sFreq, climaxTime + 0.1 + sIdx * 0.08, 0.35, 'sine', 0.18);
    });

    this.currentFanfareNodes = trackedStoppers;

    // Auto mark finished after music duration
    const totalDuration = 4.8 * 1000;
    setTimeout(() => {
      if (this.isPlayingFanfare) {
        this.isPlayingFanfare = false;
        if (this.onMusicStateChange) this.onMusicStateChange(false);
      }
    }, totalDuration);
  }

  /**
   * Sound played during a draw/tie game
   */
  public playTieSound() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume * 0.7, now);
    masterGain.connect(ctx.destination);

    // Wobble descending minor notes
    const freqs = [392, 369.99, 349.23, 311.13, 293.66];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const time = now + idx * 0.1;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.12);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(time);
      osc.stop(time + 0.14);
    });
  }

  /**
   * Subtle tactile hover sound for grid cells & buttons
   */
  public playHoverSound() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(750, now);
    osc.frequency.exponentialRampToValueAtTime(950, now + 0.03);

    gain.gain.setValueAtTime(this.volume * 0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  /**
   * Crisp button click sound
   */
  public playClickSound() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.05);

    gain.gain.setValueAtTime(this.volume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  /**
   * Stop active victory music immediately
   */
  public stopFanfare() {
    this.currentFanfareNodes.forEach((node) => node.stop());
    this.currentFanfareNodes = [];
    if (this.isPlayingFanfare) {
      this.isPlayingFanfare = false;
      if (this.onMusicStateChange) this.onMusicStateChange(false);
    }
  }

  public getIsPlayingFanfare() {
    return this.isPlayingFanfare;
  }
}

export const soundEngine = new SoundEngine();
