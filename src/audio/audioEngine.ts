import type { AudioFeatures } from '../types/modulation';
import { BeatDetector } from './beatDetector';
import { createWorkletBlobURL } from './audioWorklet';

export class AudioEngine {
  private context: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private stream: MediaStream | null = null;
  private beatDetector = new BeatDetector();
  private freqData: Uint8Array | null = null;
  private timeData: Float32Array | null = null;
  private prevFreqData: Uint8Array | null = null;
  private fftSize = 2048;
  private workletUrl: string | null = null;

  private _features: AudioFeatures = {
    rms: 0, peak: 0, bass: 0, lowMid: 0, mid: 0, highMid: 0, treble: 0,
    spectralCentroid: 0, spectralFlux: 0, onset: 0, beatPulse: 0, bpmPhase: 0,
    kickConfidence: 0, snareConfidence: 0, vocalPresence: 0, noiseFloor: 0,
  };

  get features(): AudioFeatures { return this._features; }
  get isActive(): boolean { return this.context !== null && this.context.state === 'running'; }

  async start(deviceId?: string): Promise<void> {
    if (this.context) await this.stop();

    this.context = new AudioContext({ sampleRate: 48000 });

    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = this.fftSize;
    this.analyser.smoothingTimeConstant = 0.8;

    this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
    this.timeData = new Float32Array(this.analyser.fftSize);
    this.prevFreqData = new Uint8Array(this.analyser.frequencyBinCount);

    const constraints: MediaStreamConstraints = {
      audio: deviceId
        ? { deviceId: { exact: deviceId }, echoCancellation: false, noiseSuppression: false, autoGainControl: false }
        : { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      video: false,
    };

    this.stream = await navigator.mediaDevices.getUserMedia(constraints);
    this.sourceNode = this.context.createMediaStreamSource(this.stream);

    try {
      this.workletUrl = createWorkletBlobURL();
      await this.context.audioWorklet.addModule(this.workletUrl);
      this.workletNode = new AudioWorkletNode(this.context, 'aether-analyzer');
      this.sourceNode.connect(this.workletNode);
      this.workletNode.connect(this.analyser);
    } catch {
      // fallback: connect directly
      this.sourceNode.connect(this.analyser);
    }
  }

  async stop(): Promise<void> {
    this.stream?.getTracks().forEach(t => t.stop());
    await this.context?.close();
    this.context = null;
    this.analyser = null;
    this.sourceNode = null;
    this.workletNode = null;
    this.stream = null;
    if (this.workletUrl) {
      URL.revokeObjectURL(this.workletUrl);
      this.workletUrl = null;
    }
    this.beatDetector.reset();
    this._features = {
      rms: 0, peak: 0, bass: 0, lowMid: 0, mid: 0, highMid: 0, treble: 0,
      spectralCentroid: 0, spectralFlux: 0, onset: 0, beatPulse: 0, bpmPhase: 0,
      kickConfidence: 0, snareConfidence: 0, vocalPresence: 0, noiseFloor: 0,
    };
  }

  analyze(time: number): AudioFeatures {
    if (!this.analyser || !this.freqData || !this.timeData || !this.prevFreqData) {
      return this._features;
    }

    this.analyser.getByteFrequencyData(this.freqData);
    this.analyser.getFloatTimeDomainData(this.timeData);

    const sampleRate = this.context?.sampleRate ?? 48000;
    const binCount = this.freqData.length;
    const nyquist = sampleRate / 2;
    const binHz = nyquist / binCount;

    // Band ranges (Hz)
    const bands = {
      bass:    [20, 250],
      lowMid:  [250, 500],
      mid:     [500, 2000],
      highMid: [2000, 4000],
      treble:  [4000, 20000],
      vocal:   [300, 3000],
    };

    const bandEnergy = (lo: number, hi: number): number => {
      const loIdx = Math.floor(lo / binHz);
      const hiIdx = Math.min(Math.ceil(hi / binHz), binCount - 1);
      let sum = 0;
      for (let i = loIdx; i <= hiIdx; i++) sum += this.freqData![i] / 255;
      return sum / Math.max(1, hiIdx - loIdx + 1);
    };

    // RMS
    let rmsSum = 0;
    let peak = 0;
    for (let i = 0; i < this.timeData.length; i++) {
      const s = this.timeData[i];
      rmsSum += s * s;
      if (Math.abs(s) > peak) peak = Math.abs(s);
    }
    const rms = Math.sqrt(rmsSum / this.timeData.length);

    // Spectral centroid
    let weightedSum = 0, totalMag = 0;
    for (let i = 0; i < binCount; i++) {
      const mag = this.freqData[i] / 255;
      weightedSum += i * mag;
      totalMag += mag;
    }
    const spectralCentroid = totalMag > 0 ? (weightedSum / totalMag) * binHz / nyquist : 0;

    // Spectral flux
    let flux = 0;
    for (let i = 0; i < binCount; i++) {
      const diff = (this.freqData[i] - this.prevFreqData[i]) / 255;
      if (diff > 0) flux += diff;
    }
    this.prevFreqData.set(this.freqData);
    const spectralFlux = flux / binCount;

    // Noise floor estimate (lowest 10% of bins)
    const sortedMags = Array.from(this.freqData).sort((a, b) => a - b);
    const noiseFloor = sortedMags.slice(0, Math.floor(binCount * 0.1))
      .reduce((a, b) => a + b, 0) / (binCount * 0.1) / 255;

    // Kick confidence: strong sub-bass energy + onset
    const subBass = bandEnergy(20, 100);
    const kickConfidence = Math.min(1, subBass * 2 * (1 + spectralFlux * 5));

    // Snare confidence: mid energy + spectral flux
    const midE = bandEnergy(200, 800);
    const snareConfidence = Math.min(1, midE * 1.5 * (1 + spectralFlux * 3));

    // Vocal presence: energy in vocal range minus noise floor
    const vocalPresence = Math.max(0, bandEnergy(bands.vocal[0], bands.vocal[1]) - noiseFloor * 2);

    const bass = bandEnergy(bands.bass[0], bands.bass[1]);
    const { beatPulse, bpm: _bpm, bpmPhase } = this.beatDetector.update(bass + rms * 0.5, time);

    const onset = spectralFlux > 0.02 ? Math.min(1, spectralFlux * 20) : 0;

    this._features = {
      rms,
      peak,
      bass,
      lowMid: bandEnergy(bands.lowMid[0], bands.lowMid[1]),
      mid: bandEnergy(bands.mid[0], bands.mid[1]),
      highMid: bandEnergy(bands.highMid[0], bands.highMid[1]),
      treble: bandEnergy(bands.treble[0], bands.treble[1]),
      spectralCentroid,
      spectralFlux,
      onset,
      beatPulse,
      bpmPhase,
      kickConfidence,
      snareConfidence,
      vocalPresence,
      noiseFloor,
    };

    return this._features;
  }

  getFrequencyData(): Uint8Array | null { return this.freqData; }
  getBPM(): number { return this.beatDetector['bpm']; }
}
