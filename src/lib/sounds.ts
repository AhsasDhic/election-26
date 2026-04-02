"use client";

class SoundEffects {
  private ctx: AudioContext | null = null;
  public enabled = false;

  public enable() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.enabled = true;
  }

  public disable() {
    this.enabled = false;
  }

  public playPop() {
    if (!this.enabled) return;
    try {
      if (!this.ctx) this.enable();
      if (!this.ctx) return;
      
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      // Professional modern UI "pop" sound
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(300, t + 0.05);
      
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.15, t + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      
      osc.start(t);
      osc.stop(t + 0.05);
    } catch (e) {
      console.error("Audio playback error:", e);
    }
  }

  public playTada() {
    if (!this.enabled) return;
    try {
      if (!this.ctx) this.enable();
      if (!this.ctx) return;
      
      const t = this.ctx.currentTime;
      
      const playChime = (freq: number, timeOffset: number, duration: number, vol: number = 0.1) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + timeOffset);
        
        gain.gain.setValueAtTime(0, t + timeOffset);
        gain.gain.linearRampToValueAtTime(vol, t + timeOffset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + timeOffset + duration);
        
        osc.start(t + timeOffset);
        osc.stop(t + timeOffset + duration);
      };

      // Shimmering success chord (E Major 7th arpeggio)
      playChime(659.25, 0, 0.4, 0.1);       // E5
      playChime(830.61, 0.08, 0.4, 0.1);    // G#5
      playChime(987.77, 0.16, 0.4, 0.1);    // B5
      playChime(1244.51, 0.24, 0.6, 0.15);  // D#6
    } catch (e) {
      console.error("Audio playback error:", e);
    }
  }
}

// Export singleton instance
export const sounds = new SoundEffects();
