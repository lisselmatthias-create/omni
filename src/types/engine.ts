import type { AetherParam, EngineType } from './scene';

export type EngineManifest = {
  type: EngineType;
  label: string;
  description: string;
  category: 'simulation' | 'generative' | 'signal' | 'transform';
  defaultParameters: Record<string, AetherParam>;
  thumbnail?: string;
  requiresCompute: boolean;
  pingPong: boolean;
  maxInstances?: number;
};

export type EngineFactory = {
  manifest: EngineManifest;
  create: (device: GPUDevice, width: number, height: number) => Promise<EngineRuntime>;
};

export type EngineRuntime = {
  engineType: EngineType;
  resize: (width: number, height: number) => void;
  setParam: (id: string, value: unknown) => void;
  render: (
    commandEncoder: GPUCommandEncoder,
    outputTexture: GPUTexture,
    audioData: Float32Array,
    time: number,
    dt: number
  ) => void;
  destroy: () => void;
};
