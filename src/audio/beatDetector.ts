export class BeatDetector {
  private history: number[] = [];
  private readonly historySize = 43; // ~1 second at 43fps
  private lastBeat = 0;
  private bpm = 120;
  private beatIntervals: number[] = [];
  private readonly maxIntervals = 8;

  update(energy: number, time: number): { beatPulse: number; bpm: number; bpmPhase: number } {
    this.history.push(energy);
    if (this.history.length > this.historySize) this.history.shift();

    const mean = this.history.reduce((a, b) => a + b, 0) / this.history.length;
    const variance = this.history.reduce((a, b) => a + (b - mean) ** 2, 0) / this.history.length;
    const threshold = mean + 0.5 * Math.sqrt(variance);

    let beatPulse = 0;
    if (energy > threshold && energy > 0.02) {
      const timeSinceLast = time - this.lastBeat;
      if (timeSinceLast > 0.25) { // debounce 250ms
        this.lastBeat = time;
        beatPulse = 1;
        if (timeSinceLast < 2.0) {
          this.beatIntervals.push(timeSinceLast);
          if (this.beatIntervals.length > this.maxIntervals) this.beatIntervals.shift();
          const avgInterval = this.beatIntervals.reduce((a, b) => a + b, 0) / this.beatIntervals.length;
          this.bpm = Math.round(60 / avgInterval);
          this.bpm = Math.max(60, Math.min(200, this.bpm));
        }
      }
    }

    const expectedInterval = 60 / this.bpm;
    const timeSinceBeat = (time - this.lastBeat) % expectedInterval;
    const bpmPhase = timeSinceBeat / expectedInterval;

    return { beatPulse, bpm: this.bpm, bpmPhase };
  }

  reset(): void {
    this.history = [];
    this.lastBeat = 0;
    this.beatIntervals = [];
    this.bpm = 120;
  }
}
