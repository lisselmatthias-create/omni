import type { EngineRuntime } from '../types/engine';
import { GlobalUniformBuffer, type GlobalUniforms } from './uniforms';
import { createRenderTexture, createSampler } from './resources';

export type RenderGraphConfig = {
  device: GPUDevice;
  width: number;
  height: number;
  presentationFormat: GPUTextureFormat;
};

export type LayerEntry = {
  id: string;
  engine: EngineRuntime;
  enabled: boolean;
  opacity: number;
  blendMode: string;
};

export class RenderGraph {
  private device: GPUDevice;
  private width: number;
  private height: number;
  private presentationFormat: GPUTextureFormat;
  private globalUniforms: GlobalUniformBuffer;
  private layers: LayerEntry[] = [];
  private layerTextures: Map<string, GPUTexture> = new Map();
  private sampler: GPUSampler;
  private compositePipeline: GPURenderPipeline | null = null;

  constructor(config: RenderGraphConfig) {
    this.device = config.device;
    this.width = config.width;
    this.height = config.height;
    this.presentationFormat = config.presentationFormat;
    this.globalUniforms = new GlobalUniformBuffer(config.device);
    this.sampler = createSampler(config.device);
    this.buildCompositePipeline();
  }

  private buildCompositePipeline(): void {
    const wgsl = /* wgsl */`
      @group(0) @binding(0) var srcSampler: sampler;
      @group(0) @binding(1) var srcTexture: texture_2d<f32>;

      struct VertOut { @builtin(position) pos: vec4f, @location(0) uv: vec2f }

      @vertex fn vs(@builtin(vertex_index) i: u32) -> VertOut {
        let pos = array<vec2f,3>(vec2f(-1,-1), vec2f(3,-1), vec2f(-1,3));
        var out: VertOut;
        out.pos = vec4f(pos[i], 0, 1);
        out.uv = pos[i] * vec2f(0.5, -0.5) + 0.5;
        return out;
      }

      @fragment fn fs(in: VertOut) -> @location(0) vec4f {
        return textureSample(srcTexture, srcSampler, in.uv);
      }
    `;
    const mod = this.device.createShaderModule({ code: wgsl, label: 'composite' });
    this.compositePipeline = this.device.createRenderPipeline({
      label: 'composite',
      layout: 'auto',
      vertex: { module: mod, entryPoint: 'vs' },
      fragment: {
        module: mod, entryPoint: 'fs',
        targets: [{
          format: this.presentationFormat,
          blend: {
            color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' },
            alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' },
          },
        }],
      },
      primitive: { topology: 'triangle-list' },
    });
  }

  setLayers(layers: LayerEntry[]): void {
    // destroy stale textures
    const newIds = new Set(layers.map(l => l.id));
    for (const [id, tex] of this.layerTextures) {
      if (!newIds.has(id)) { tex.destroy(); this.layerTextures.delete(id); }
    }
    // create new textures
    for (const layer of layers) {
      if (!this.layerTextures.has(layer.id)) {
        this.layerTextures.set(layer.id, createRenderTexture(this.device, this.width, this.height, 'rgba16float', `layer_${layer.id}`));
      }
    }
    this.layers = layers;
  }

  render(
    canvasTexture: GPUTexture,
    audioData: Float32Array,
    uniforms: GlobalUniforms
  ): void {
    this.globalUniforms.update(this.device, uniforms);

    const encoder = this.device.createCommandEncoder({ label: 'aethervj-frame' });

    for (const layer of this.layers) {
      if (!layer.enabled) continue;
      const outTex = this.layerTextures.get(layer.id);
      if (!outTex) continue;
      layer.engine.render(encoder, outTex, audioData, uniforms.time, uniforms.dt);
    }

    // composite all layers onto canvas
    if (this.compositePipeline && this.layers.length > 0) {
      const view = canvasTexture.createView();
      const pass = encoder.beginRenderPass({
        colorAttachments: [{
          view,
          clearValue: { r: 0.012, g: 0.02, b: 0.039, a: 1 },
          loadOp: 'clear',
          storeOp: 'store',
        }],
      });
      // render each enabled layer
      for (const layer of this.layers) {
        if (!layer.enabled) continue;
        const tex = this.layerTextures.get(layer.id);
        if (!tex || !this.compositePipeline) continue;
        const bg = this.device.createBindGroup({
          layout: this.compositePipeline.getBindGroupLayout(0),
          entries: [
            { binding: 0, resource: this.sampler },
            { binding: 1, resource: tex.createView() },
          ],
        });
        pass.setPipeline(this.compositePipeline);
        pass.setBindGroup(0, bg);
        pass.draw(3);
      }
      pass.end();
    }

    this.device.queue.submit([encoder.finish()]);
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    for (const [id, tex] of this.layerTextures) {
      tex.destroy();
      this.layerTextures.set(id, createRenderTexture(this.device, width, height, 'rgba16float', `layer_${id}`));
    }
    for (const layer of this.layers) {
      layer.engine.resize(width, height);
    }
  }

  destroy(): void {
    this.globalUniforms.destroy();
    for (const tex of this.layerTextures.values()) tex.destroy();
    this.layerTextures.clear();
    for (const layer of this.layers) layer.engine.destroy();
  }
}
