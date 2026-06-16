import type { EngineRuntime, EngineManifest } from '../../types/engine';
import type { AetherParam } from '../../types/scene';
import { PingPongTextures, createStorageTexture, createSampler } from '../../gpu/resources';
import rdWgsl from './rd.wgsl?raw';

function param(
  id: string, label: string, type: AetherParam['type'], value: unknown,
  min?: number, max?: number, display: AetherParam['display'] = 'knob'
): AetherParam {
  return { id, label, type, value, defaultValue: value, min, max, display, modulatable: true, smoothingMs: 80 };
}

export const RD_MANIFEST: EngineManifest = {
  type: 'reaction-diffusion',
  label: 'Reaction-Diffusion',
  description: 'Gray-Scott reaction-diffusion simulation with audio-reactive parameters',
  category: 'simulation',
  requiresCompute: true,
  pingPong: true,
  defaultParameters: {
    feed:       param('feed',       'Feed Rate',   'float', 0.055, 0.01, 0.1,  'knob'),
    kill:       param('kill',       'Kill Rate',   'float', 0.062, 0.04, 0.07, 'knob'),
    diffA:      param('diffA',      'Diff A',      'float', 1.0,   0.1,  2.0,  'knob'),
    diffB:      param('diffB',      'Diff B',      'float', 0.5,   0.05, 1.0,  'knob'),
    speed:      param('speed',      'Speed',       'float', 1.0,   0.1,  3.0,  'knob'),
    audioFeed:  param('audioFeed',  'Audio→Feed',  'float', 1.0,   0,    3.0,  'knob'),
    audioKill:  param('audioKill',  'Audio→Kill',  'float', 0.5,   0,    3.0,  'knob'),
    audioDiff:  param('audioDiff',  'Audio→Diff',  'float', 0.5,   0,    3.0,  'knob'),
    colorMode:  param('colorMode',  'Color Mode',  'int',   0,     0,    3,    'dropdown'),
    colorScale: param('colorScale', 'Color Scale', 'float', 2.0,   0.5,  5.0,  'knob'),
    seedMode:   param('seedMode',   'Seed Mode',   'int',   0,     0,    2,    'dropdown'),
  },
};

export async function createRdEngine(
  device: GPUDevice,
  width: number,
  height: number
): Promise<EngineRuntime> {
  let W = width, H = height;

  let pingPong = new PingPongTextures(device, W, H, 'rgba16float', 'rd-sim');
  let colorOut = createStorageTexture(device, W, H, 'rgba16float', 'rd-color');
  const sampler = createSampler(device, { addressModeU: 'repeat', addressModeV: 'repeat', magFilter: 'linear', minFilter: 'linear' });

  const GLOBALS_SIZE = 16 * 4;
  const PARAMS_SIZE  = 16 * 4;

  const globalsBuffer = device.createBuffer({ size: GLOBALS_SIZE, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, label: 'rd-globals' });
  const paramsBuffer  = device.createBuffer({ size: PARAMS_SIZE,  usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, label: 'rd-params'  });

  const shaderModule = device.createShaderModule({ code: rdWgsl, label: 'rd-shader' });

  const simPipeline = await device.createComputePipelineAsync({
    label: 'rd-sim',
    layout: 'auto',
    compute: { module: shaderModule, entryPoint: 'simulate' },
  });
  const visPipeline = await device.createComputePipelineAsync({
    label: 'rd-vis',
    layout: 'auto',
    compute: { module: shaderModule, entryPoint: 'visualize' },
  });

  const params: Record<string, AetherParam> = { ...RD_MANIFEST.defaultParameters };

  function uploadParams(): void {
    const d = new Float32Array(16);
    d[0]  = params.feed.value as number;
    d[1]  = params.kill.value as number;
    d[2]  = params.diffA.value as number;
    d[3]  = params.diffB.value as number;
    d[4]  = params.speed.value as number;
    d[5]  = params.audioFeed.value as number;
    d[6]  = params.audioKill.value as number;
    d[7]  = params.audioDiff.value as number;
    d[8]  = params.colorMode.value as number;
    d[9]  = params.colorScale.value as number;
    d[10] = params.seedMode.value as number;
    d[11] = 0;
    device.queue.writeBuffer(paramsBuffer, 0, d);
  }

  function buildSimBG(): GPUBindGroup {
    return device.createBindGroup({
      layout: simPipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: globalsBuffer } },
        { binding: 1, resource: { buffer: paramsBuffer } },
        { binding: 2, resource: sampler },
        { binding: 3, resource: pingPong.read.createView() },
        { binding: 4, resource: pingPong.write.createView() },
        { binding: 5, resource: colorOut.createView() },
      ],
    });
  }

  function buildVisBG(): GPUBindGroup {
    return device.createBindGroup({
      layout: visPipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: globalsBuffer } },
        { binding: 1, resource: { buffer: paramsBuffer } },
        { binding: 2, resource: sampler },
        { binding: 3, resource: pingPong.read.createView() },
        { binding: 4, resource: pingPong.write.createView() },
        { binding: 5, resource: colorOut.createView() },
      ],
    });
  }

  // Seed initial state
  function seed(): void {
    const data = new Float32Array(W * H * 4);
    for (let i = 0; i < W * H; i++) {
      data[i * 4 + 0] = 1.0; // A = 1
      data[i * 4 + 1] = 0.0; // B = 0
      data[i * 4 + 2] = 0.0;
      data[i * 4 + 3] = 1.0;
    }
    // Seed a small region in center
    const cx = Math.floor(W / 2), cy = Math.floor(H / 2);
    for (let dy = -10; dy <= 10; dy++) {
      for (let dx = -10; dx <= 10; dx++) {
        const x = cx + dx, y = cy + dy;
        if (x >= 0 && x < W && y >= 0 && y < H) {
          const idx = (y * W + x) * 4;
          data[idx + 0] = 0.5;
          data[idx + 1] = 0.25;
        }
      }
    }
    device.queue.writeTexture(
      { texture: pingPong.read },
      data,
      { bytesPerRow: W * 4 * 4 },
      { width: W, height: H }
    );
  }

  uploadParams();
  seed();

  return {
    engineType: 'reaction-diffusion',

    resize(w: number, h: number): void {
      W = w; H = h;
      pingPong.destroy();
      colorOut.destroy();
      pingPong = new PingPongTextures(device, W, H, 'rgba16float', 'rd-sim');
      colorOut = createStorageTexture(device, W, H, 'rgba16float', 'rd-color');
      seed();
    },

    setParam(id: string, value: unknown): void {
      if (params[id]) {
        params[id] = { ...params[id], value };
        uploadParams();
      }
    },

    render(
      encoder: GPUCommandEncoder,
      outputTexture: GPUTexture,
      audioData: Float32Array,
      time: number,
      dt: number
    ): void {
      const globals = new Float32Array(16);
      globals[0] = time;
      globals[1] = dt;
      globals[2] = W;
      globals[3] = H;
      globals[4] = 120;
      globals[5] = audioData[11] ?? 0;
      globals[6] = audioData[2]  ?? 0;
      globals[7] = audioData[4]  ?? 0;
      globals[8] = audioData[6]  ?? 0;
      globals[9] = audioData[0]  ?? 0;
      device.queue.writeBuffer(globalsBuffer, 0, globals);

      // Run several simulation steps per frame for speed
      const steps = Math.max(1, Math.round((params.speed.value as number) * 4));
      for (let s = 0; s < steps; s++) {
        const simBG = buildSimBG();
        const simPass = encoder.beginComputePass({ label: 'rd-sim' });
        simPass.setPipeline(simPipeline);
        simPass.setBindGroup(0, simBG);
        simPass.dispatchWorkgroups(Math.ceil(W / 8), Math.ceil(H / 8));
        simPass.end();
        pingPong.swap();
      }

      // Visualize
      const visBG = buildVisBG();
      const visPass = encoder.beginComputePass({ label: 'rd-vis' });
      visPass.setPipeline(visPipeline);
      visPass.setBindGroup(0, visBG);
      visPass.dispatchWorkgroups(Math.ceil(W / 8), Math.ceil(H / 8));
      visPass.end();

      // Copy to output
      encoder.copyTextureToTexture(
        { texture: colorOut },
        { texture: outputTexture },
        { width: Math.min(W, outputTexture.width), height: Math.min(H, outputTexture.height) }
      );
    },

    destroy(): void {
      pingPong.destroy();
      colorOut.destroy();
      globalsBuffer.destroy();
      paramsBuffer.destroy();
    },
  };
}
