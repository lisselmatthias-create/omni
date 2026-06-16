import type { EngineRuntime } from '../../types/engine';
import type { EngineManifest } from '../../types/engine';
import type { AetherParam } from '../../types/scene';
import { createStorageTexture } from '../../gpu/resources';

// Import the WGSL source at build time via Vite's ?raw import
// We inline it as a string constant to avoid dynamic import issues
import sdfWgsl from './sdf.wgsl?raw';

function param(
  id: string, label: string, type: AetherParam['type'], value: unknown,
  min?: number, max?: number, display: AetherParam['display'] = 'knob'
): AetherParam {
  return { id, label, type, value, defaultValue: value, min, max, display, modulatable: true, smoothingMs: 50 };
}

export const SDF_MANIFEST: EngineManifest = {
  type: 'sdf',
  label: 'SDF Raymarcher',
  description: 'GPU raymarching through signed distance functions with audio reactivity',
  category: 'generative',
  requiresCompute: true,
  pingPong: false,
  defaultParameters: {
    sceneId:       param('sceneId',       'Scene',         'int',   0,    0, 5,   'dropdown'),
    isoValue:      param('isoValue',      'Iso Value',     'float', 0.35, 0, 1,   'knob'),
    roughness:     param('roughness',     'Roughness',     'float', 0.4,  0, 1,   'knob'),
    metallic:      param('metallic',      'Metallic',      'float', 0.2,  0, 1,   'knob'),
    colorR:        param('colorR',        'Color R',       'float', 0.0,  0, 1,   'slider'),
    colorG:        param('colorG',        'Color G',       'float', 0.96, 0, 1,   'slider'),
    colorB:        param('colorB',        'Color B',       'float', 1.0,  0, 1,   'slider'),
    glowIntensity: param('glowIntensity', 'Glow',          'float', 0.5,  0, 3,   'knob'),
    glowRadius:    param('glowRadius',    'Glow Radius',   'float', 1.0,  0, 5,   'knob'),
    rimPower:      param('rimPower',      'Rim Power',     'float', 3.0,  1, 10,  'knob'),
    aoStrength:    param('aoStrength',    'AO Strength',   'float', 1.0,  0, 2,   'knob'),
    shadowSoftness:param('shadowSoftness','Shadow Soft',   'float', 8.0,  1, 32,  'knob'),
    camDist:       param('camDist',       'Cam Dist',      'float', 1.0,  0.5, 3, 'knob'),
    camFov:        param('camFov',        'FOV',           'float', 60.0, 20, 120,'knob'),
    audioReact:    param('audioReact',    'Audio React',   'float', 1.0,  0, 2,   'knob'),
    morphSpeed:    param('morphSpeed',    'Morph Speed',   'float', 0.3,  0, 2,   'knob'),
  },
};

export async function createSdfEngine(
  device: GPUDevice,
  width: number,
  height: number
): Promise<EngineRuntime> {
  let W = width, H = height;

  // Output texture
  let outTexture = createStorageTexture(device, W, H, 'rgba16float', 'sdf-out');

  // Uniform buffers
  const GLOBALS_SIZE = 16 * 4;
  const PARAMS_SIZE = 20 * 4;

  const globalsBuffer = device.createBuffer({
    size: GLOBALS_SIZE,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    label: 'sdf-globals',
  });
  const paramsBuffer = device.createBuffer({
    size: PARAMS_SIZE,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    label: 'sdf-params',
  });

  // Current param values
  const params = { ...SDF_MANIFEST.defaultParameters };

  // Compile compute pipeline
  const shaderModule = device.createShaderModule({ code: sdfWgsl, label: 'sdf-shader' });
  const pipeline = await device.createComputePipelineAsync({
    label: 'sdf-pipeline',
    layout: 'auto',
    compute: { module: shaderModule, entryPoint: 'main' },
  });

  let bindGroup = buildBindGroup();

  function buildBindGroup(): GPUBindGroup {
    return device.createBindGroup({
      label: 'sdf-bg',
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: globalsBuffer } },
        { binding: 1, resource: { buffer: paramsBuffer } },
        { binding: 2, resource: outTexture.createView() },
      ],
    });
  }

  function uploadParams(): void {
    const data = new Float32Array(20);
    const p = params;
    data[0]  = p.sceneId.value as number;
    data[1]  = p.isoValue.value as number;
    data[2]  = p.roughness.value as number;
    data[3]  = p.metallic.value as number;
    data[4]  = p.colorR.value as number;
    data[5]  = p.colorG.value as number;
    data[6]  = p.colorB.value as number;
    data[7]  = p.glowIntensity.value as number;
    data[8]  = p.glowRadius.value as number;
    data[9]  = p.rimPower.value as number;
    data[10] = p.aoStrength.value as number;
    data[11] = p.shadowSoftness.value as number;
    data[12] = p.camDist.value as number;
    data[13] = p.camFov.value as number;
    data[14] = p.audioReact.value as number;
    data[15] = p.morphSpeed.value as number;
    device.queue.writeBuffer(paramsBuffer, 0, data);
  }

  uploadParams();

  return {
    engineType: 'sdf',

    resize(w: number, h: number): void {
      W = w; H = h;
      outTexture.destroy();
      outTexture = createStorageTexture(device, W, H, 'rgba16float', 'sdf-out');
      bindGroup = buildBindGroup();
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
      // Upload globals from audioData
      // audioData layout: [rms, peak, bass, lowMid, mid, highMid, treble, centroid, flux, onset, beatPulse, bpmPhase, kick, snare, vocal, noiseFloor]
      const globals = new Float32Array(16);
      globals[0] = time;
      globals[1] = dt;
      globals[2] = W;
      globals[3] = H;
      globals[4] = 120; // bpm placeholder
      globals[5] = audioData[11] ?? 0; // bpmPhase
      globals[6] = audioData[2]  ?? 0; // bass
      globals[7] = audioData[4]  ?? 0; // mid
      globals[8] = audioData[6]  ?? 0; // treble
      globals[9] = audioData[0]  ?? 0; // rms
      device.queue.writeBuffer(globalsBuffer, 0, globals);

      // Dispatch compute
      const pass = encoder.beginComputePass({ label: 'sdf-compute' });
      pass.setPipeline(pipeline);
      pass.setBindGroup(0, bindGroup);
      pass.dispatchWorkgroups(Math.ceil(W / 8), Math.ceil(H / 8));
      pass.end();

      // Copy compute output to the engine output texture
      encoder.copyTextureToTexture(
        { texture: outTexture },
        { texture: outputTexture },
        { width: Math.min(W, outputTexture.width), height: Math.min(H, outputTexture.height) }
      );
    },

    destroy(): void {
      outTexture.destroy();
      globalsBuffer.destroy();
      paramsBuffer.destroy();
    },
  };
}
