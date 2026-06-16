export type BlendMode =
  | 'normal' | 'add' | 'multiply' | 'screen' | 'overlay'
  | 'darken' | 'lighten' | 'difference' | 'exclusion' | 'luminosity';

export type ParamType = 'float' | 'int' | 'bool' | 'color' | 'vec2' | 'vec3' | 'enum' | 'curve';
export type ParamDisplay = 'knob' | 'slider' | 'xy' | 'toggle' | 'color' | 'dropdown' | 'curve';

export type AutomationPoint = { time: number; value: number; curve: 'linear' | 'step' | 'smooth' };
export type AutomationLane = { points: AutomationPoint[]; loopLength: number };

export type AetherParam = {
  id: string;
  label: string;
  type: ParamType;
  value: unknown;
  defaultValue: unknown;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  display: ParamDisplay;
  modulatable: boolean;
  smoothingMs: number;
  automation?: AutomationLane;
};

export type ModSource =
  | 'Audio.RMS' | 'Audio.Peak' | 'Audio.Bass' | 'Audio.LowMid' | 'Audio.Mid'
  | 'Audio.HighMid' | 'Audio.Treble' | 'Audio.SpectralCentroid' | 'Audio.SpectralFlux'
  | 'Audio.Onset' | 'Audio.BeatPulse' | 'Audio.BPMPhase' | 'Audio.KickConfidence'
  | 'Audio.SnareConfidence' | 'Audio.VocalPresence' | 'Audio.NoiseFloor'
  | 'LFO.1' | 'LFO.2' | 'LFO.3' | 'LFO.4'
  | 'Env.1' | 'Env.2'
  | 'MIDI.CC' | 'OSC.param'
  | 'Manual';

export type LFOShape = 'sine' | 'triangle' | 'saw' | 'rsaw' | 'square' | 'random' | 'smoothRandom';

export type Modulator = {
  id: string;
  name: string;
  source: ModSource;
  shape?: LFOShape;
  rate?: number;
  phase?: number;
  depth: number;
  offset: number;
  attackMs: number;
  releaseMs: number;
};

export type ModMapping = {
  id: string;
  modulatorId: string;
  targetLayerId: string;
  targetParamId: string;
  min: number;
  max: number;
  curve: 'linear' | 'exp' | 'log' | 'scurve';
};

export type EngineType =
  | 'sdf' | 'tpms' | 'reaction-diffusion' | 'fluid' | 'pointcloud'
  | 'wave' | 'schrodinger' | 'fractal' | 'attractor' | 'particle'
  | 'nbody' | 'lenia' | 'hyperbolic' | 'knot' | 'spectral-pde';

export type EngineInputSlot = { id: string; label: string; type: 'texture' | 'buffer' | 'param' };
export type EngineOutputSlot = { id: string; label: string; type: 'texture' | 'buffer' };
export type EngineResourceRefs = { textures: string[]; buffers: string[]; bindGroups: string[] };

export type EngineInstance = {
  id: string;
  engineType: EngineType;
  parameters: Record<string, AetherParam>;
  inputs: EngineInputSlot[];
  outputs: EngineOutputSlot[];
  gpuResources: EngineResourceRefs;
};

export type MaskNode = {
  id: string;
  type: 'alpha' | 'luma' | 'stencil' | 'sdf';
  sourceLayerId?: string;
  inverted: boolean;
  feather: number;
};

export type PostEffect = {
  id: string;
  type: 'bloom' | 'chromashift' | 'grain' | 'vignette' | 'blur' | 'sharpen' | 'colorgrade';
  enabled: boolean;
  parameters: Record<string, number | boolean | string>;
};

export type LayerTransform = {
  x: number; y: number;
  scaleX: number; scaleY: number;
  rotation: number;
  pivotX: number; pivotY: number;
};

export type LayerRouting = {
  outputBus: 'main' | 'aux1' | 'aux2' | 'preview';
  feedbackInput?: string;
};

export type AetherLayer = {
  id: string;
  name: string;
  enabled: boolean;
  opacity: number;
  blendMode: BlendMode;
  engine: EngineInstance;
  localModulators: Modulator[];
  masks: MaskNode[];
  postChain: PostEffect[];
  transform: LayerTransform;
  routing: LayerRouting;
};

export type FusionNode = {
  id: string;
  type: 'merge' | 'mix' | 'warp' | 'displace';
  inputs: string[];
  output: string;
  parameters: Record<string, number>;
};

export type ClockState = {
  bpm: number;
  phase: number;
  beat: number;
  bar: number;
  running: boolean;
};

export type ViewState = {
  width: number;
  height: number;
  pixelRatio: number;
  fullscreen: boolean;
};

export type AudioAnalysisConfig = {
  fftSize: number;
  smoothingTimeConstant: number;
  sampleRate: number;
  inputDeviceId: string | null;
};

export type MidiMapping = {
  id: string;
  channel: number;
  cc: number;
  targetParamPath: string;
  min: number;
  max: number;
};

export type OscMapping = {
  id: string;
  address: string;
  targetParamPath: string;
  min: number;
  max: number;
};

export type ThumbnailSet = {
  preview: string | null;
  lastUpdated: number;
};

export type AetherScene = {
  id: string;
  name: string;
  bpm: number;
  masterClock: ClockState;
  viewport: ViewState;
  layers: AetherLayer[];
  fusionGraph: FusionNode[];
  globalModulators: Modulator[];
  modMappings: ModMapping[];
  postChain: PostEffect[];
  audioConfig: AudioAnalysisConfig;
  midiMappings: MidiMapping[];
  oscMappings: OscMapping[];
  thumbnails: ThumbnailSet;
  createdAt: number;
  updatedAt: number;
};
