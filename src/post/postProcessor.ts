import type { PostEffect } from '../types/scene';
import { createRenderTexture, createSampler } from '../gpu/resources';
import bloomWgsl from './bloom.wgsl?raw';
import compositeWgsl from './composite.wgsl?raw';

export type PostProcessorConfig = {
  device: GPUDevice;
  width: number;
  height: number;
};

export class PostProcessor {
  private device: GPUDevice;
  private width: number;
  private height: number;

  private bloomThreshTex: GPUTexture;
  private bloomBlurATex: GPUTexture;
  private bloomBlurBTex: GPUTexture;
  private finalTex: GPUTexture;
  private sampler: GPUSampler;

  private globalsBuffer: GPUBuffer;
  private bloomParamsBuffer: GPUBuffer;
  private compositeParamsBuffer: GPUBuffer;

  private bloomShader: GPUShaderModule;
  private compositeShader: GPUShaderModule;

  private thresholdPipeline!: GPUComputePipeline;
  private blurHPipeline!: GPUComputePipeline;
  private blurVPipeline!: GPUComputePipeline;
  private compositePipeline!: GPUComputePipeline;

  private initialized = false;

  constructor(config: PostProcessorConfig) {
    this.device = config.device;
    this.width = config.width;
    this.height = config.height;

    this.bloomThreshTex = createRenderTexture(this.device, this.width, this.height, 'rgba16float', 'bloom-thresh');
    this.bloomBlurATex  = createRenderTexture(this.device, this.width, this.height, 'rgba16float', 'bloom-blurA');
    this.bloomBlurBTex  = createRenderTexture(this.device, this.width, this.height, 'rgba16float', 'bloom-blurB');
    this.finalTex       = createRenderTexture(this.device, this.width, this.height, 'rgba16float', 'post-final');
    this.sampler        = createSampler(this.device);

    const GLOBALS_SIZE = 16 * 4;
    const BLOOM_SIZE   = 8 * 4;
    const COMP_SIZE    = 12 * 4;

    this.globalsBuffer         = this.device.createBuffer({ size: GLOBALS_SIZE, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, label: 'post-globals' });
    this.bloomParamsBuffer     = this.device.createBuffer({ size: BLOOM_SIZE,   usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, label: 'bloom-params' });
    this.compositeParamsBuffer = this.device.createBuffer({ size: COMP_SIZE,    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, label: 'composite-params' });

    this.bloomShader     = this.device.createShaderModule({ code: bloomWgsl,     label: 'bloom-shader' });
    this.compositeShader = this.device.createShaderModule({ code: compositeWgsl, label: 'composite-shader' });
  }

  async init(): Promise<void> {
    [
      this.thresholdPipeline,
      this.blurHPipeline,
      this.blurVPipeline,
      this.compositePipeline,
    ] = await Promise.all([
      this.device.createComputePipelineAsync({ label: 'bloom-threshold', layout: 'auto', compute: { module: this.bloomShader, entryPoint: 'threshold' } }),
      this.device.createComputePipelineAsync({ label: 'bloom-blurH',     layout: 'auto', compute: { module: this.bloomShader, entryPoint: 'blurH' } }),
      this.device.createComputePipelineAsync({ label: 'bloom-blurV',     layout: 'auto', compute: { module: this.bloomShader, entryPoint: 'blurV' } }),
      this.device.createComputePipelineAsync({ label: 'composite',        layout: 'auto', compute: { module: this.compositeShader, entryPoint: 'main' } }),
    ]);
    this.initialized = true;
    this.uploadDefaultParams();
  }

  private uploadDefaultParams(): void {
    const bloom = new Float32Array(8);
    bloom[0] = 0.7;  // threshold
    bloom[1] = 1.2;  // intensity
    bloom[2] = 2.0;  // radius
    bloom[3] = 1.0;  // audioBoost
    this.device.queue.writeBuffer(this.bloomParamsBuffer, 0, bloom);

    const comp = new Float32Array(12);
    comp[0] = 1.0;   // bloomIntensity
    comp[1] = 0.5;   // chromaShift
    comp[2] = 1.2;   // vignetteStrength
    comp[3] = 0.8;   // vignetteRadius
    comp[4] = 1.1;   // exposure
    comp[5] = 1.05;  // contrast
    comp[6] = 1.2;   // saturation
    comp[7] = 1.0;   // audioChroma
    this.device.queue.writeBuffer(this.compositeParamsBuffer, 0, comp);
  }

  applyEffects(effects: PostEffect[]): void {
    if (!this.initialized) return;
    const bloom = new Float32Array(8);
    const comp  = new Float32Array(12);

    bloom[0] = 0.7; bloom[1] = 1.2; bloom[2] = 2.0; bloom[3] = 1.0;
    comp[0] = 1.0; comp[1] = 0.5; comp[2] = 1.2; comp[3] = 0.8;
    comp[4] = 1.1; comp[5] = 1.05; comp[6] = 1.2; comp[7] = 1.0;

    for (const e of effects) {
      if (!e.enabled) continue;
      if (e.type === 'bloom') {
        bloom[0] = (e.parameters.threshold as number) ?? 0.7;
        bloom[1] = (e.parameters.intensity as number) ?? 1.2;
        bloom[2] = (e.parameters.radius    as number) ?? 2.0;
        bloom[3] = (e.parameters.audioBoost as number) ?? 1.0;
      }
      if (e.type === 'chromashift') {
        comp[1] = (e.parameters.amount as number) ?? 0.5;
        comp[7] = (e.parameters.audioAmount as number) ?? 1.0;
      }
      if (e.type === 'vignette') {
        comp[2] = (e.parameters.strength as number) ?? 1.2;
        comp[3] = (e.parameters.radius   as number) ?? 0.8;
      }
      if (e.type === 'colorgrade') {
        comp[4] = (e.parameters.exposure    as number) ?? 1.1;
        comp[5] = (e.parameters.contrast    as number) ?? 1.05;
        comp[6] = (e.parameters.saturation  as number) ?? 1.2;
      }
    }
    this.device.queue.writeBuffer(this.bloomParamsBuffer, 0, bloom);
    this.device.queue.writeBuffer(this.compositeParamsBuffer, 0, comp);
  }

  process(
    encoder: GPUCommandEncoder,
    sceneTexture: GPUTexture,
    outputTexture: GPUTexture,
    audioData: Float32Array,
    time: number,
    dt: number
  ): void {
    if (!this.initialized) {
      encoder.copyTextureToTexture({ texture: sceneTexture }, { texture: outputTexture }, { width: this.width, height: this.height });
      return;
    }

    const globals = new Float32Array(16);
    globals[0] = time; globals[1] = dt;
    globals[2] = this.width; globals[3] = this.height;
    globals[5] = audioData[11] ?? 0;
    globals[6] = audioData[2]  ?? 0;
    globals[7] = audioData[4]  ?? 0;
    globals[8] = audioData[6]  ?? 0;
    globals[9] = audioData[0]  ?? 0;
    this.device.queue.writeBuffer(this.globalsBuffer, 0, globals);

    const W = this.width, H = this.height;
    const wg = (n: number) => Math.ceil(n / 8);

    // Bloom threshold
    const threshBG = this.device.createBindGroup({
      layout: this.thresholdPipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.globalsBuffer } },
        { binding: 1, resource: { buffer: this.bloomParamsBuffer } },
        { binding: 2, resource: this.sampler },
        { binding: 3, resource: sceneTexture.createView() },
        { binding: 4, resource: this.bloomThreshTex.createView() },
      ],
    });
    const p0 = encoder.beginComputePass({ label: 'bloom-threshold' });
    p0.setPipeline(this.thresholdPipeline);
    p0.setBindGroup(0, threshBG);
    p0.dispatchWorkgroups(wg(W), wg(H));
    p0.end();

    // Blur H
    const blurHBG = this.device.createBindGroup({
      layout: this.blurHPipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.globalsBuffer } },
        { binding: 1, resource: { buffer: this.bloomParamsBuffer } },
        { binding: 2, resource: this.sampler },
        { binding: 3, resource: this.bloomThreshTex.createView() },
        { binding: 4, resource: this.bloomBlurATex.createView() },
      ],
    });
    const p1 = encoder.beginComputePass({ label: 'bloom-blurH' });
    p1.setPipeline(this.blurHPipeline);
    p1.setBindGroup(0, blurHBG);
    p1.dispatchWorkgroups(wg(W), wg(H));
    p1.end();

    // Blur V
    const blurVBG = this.device.createBindGroup({
      layout: this.blurVPipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.globalsBuffer } },
        { binding: 1, resource: { buffer: this.bloomParamsBuffer } },
        { binding: 2, resource: this.sampler },
        { binding: 3, resource: this.bloomBlurATex.createView() },
        { binding: 4, resource: this.bloomBlurBTex.createView() },
      ],
    });
    const p2 = encoder.beginComputePass({ label: 'bloom-blurV' });
    p2.setPipeline(this.blurVPipeline);
    p2.setBindGroup(0, blurVBG);
    p2.dispatchWorkgroups(wg(W), wg(H));
    p2.end();

    // Composite
    const compBG = this.device.createBindGroup({
      layout: this.compositePipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this.globalsBuffer } },
        { binding: 1, resource: { buffer: this.compositeParamsBuffer } },
        { binding: 2, resource: this.sampler },
        { binding: 3, resource: sceneTexture.createView() },
        { binding: 4, resource: this.bloomBlurBTex.createView() },
        { binding: 5, resource: outputTexture.createView() },
      ],
    });
    const p3 = encoder.beginComputePass({ label: 'composite' });
    p3.setPipeline(this.compositePipeline);
    p3.setBindGroup(0, compBG);
    p3.dispatchWorkgroups(wg(W), wg(H));
    p3.end();
  }

  resize(width: number, height: number): void {
    this.width = width; this.height = height;
    this.bloomThreshTex.destroy(); this.bloomBlurATex.destroy();
    this.bloomBlurBTex.destroy();  this.finalTex.destroy();
    this.bloomThreshTex = createRenderTexture(this.device, width, height, 'rgba16float', 'bloom-thresh');
    this.bloomBlurATex  = createRenderTexture(this.device, width, height, 'rgba16float', 'bloom-blurA');
    this.bloomBlurBTex  = createRenderTexture(this.device, width, height, 'rgba16float', 'bloom-blurB');
    this.finalTex       = createRenderTexture(this.device, width, height, 'rgba16float', 'post-final');
  }

  get outputTexture(): GPUTexture { return this.finalTex; }

  destroy(): void {
    this.bloomThreshTex.destroy(); this.bloomBlurATex.destroy();
    this.bloomBlurBTex.destroy();  this.finalTex.destroy();
    this.globalsBuffer.destroy();  this.bloomParamsBuffer.destroy();
    this.compositeParamsBuffer.destroy();
  }
}
