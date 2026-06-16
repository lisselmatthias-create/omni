export type AudioFeatures = {
  rms: number;
  peak: number;
  bass: number;
  lowMid: number;
  mid: number;
  highMid: number;
  treble: number;
  spectralCentroid: number;
  spectralFlux: number;
  onset: number;
  beatPulse: number;
  bpmPhase: number;
  kickConfidence: number;
  snareConfidence: number;
  vocalPresence: number;
  noiseFloor: number;
};

export type LFOState = {
  id: string;
  phase: number;
  value: number;
};

export type ModulationFrame = {
  audio: AudioFeatures;
  lfos: LFOState[];
  time: number;
  bpm: number;
  beat: number;
};
