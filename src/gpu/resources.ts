export function createStorageTexture(
  device: GPUDevice,
  width: number,
  height: number,
  format: GPUTextureFormat = 'rgba16float',
  label?: string
): GPUTexture {
  return device.createTexture({
    label,
    size: { width, height },
    format,
    usage:
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.STORAGE_BINDING |
      GPUTextureUsage.RENDER_ATTACHMENT |
      GPUTextureUsage.COPY_SRC |
      GPUTextureUsage.COPY_DST,
  });
}

export function createRenderTexture(
  device: GPUDevice,
  width: number,
  height: number,
  format: GPUTextureFormat = 'rgba16float',
  label?: string
): GPUTexture {
  return device.createTexture({
    label,
    size: { width, height },
    format,
    usage:
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.RENDER_ATTACHMENT |
      GPUTextureUsage.COPY_SRC,
  });
}

export function createUniformBuffer(
  device: GPUDevice,
  size: number,
  label?: string
): GPUBuffer {
  return device.createBuffer({
    label,
    size: Math.ceil(size / 16) * 16,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
}

export function createStorageBuffer(
  device: GPUDevice,
  size: number,
  label?: string
): GPUBuffer {
  return device.createBuffer({
    label,
    size: Math.ceil(size / 4) * 4,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
  });
}

export function createSampler(device: GPUDevice, options?: Partial<GPUSamplerDescriptor>): GPUSampler {
  return device.createSampler({
    addressModeU: 'repeat',
    addressModeV: 'repeat',
    magFilter: 'linear',
    minFilter: 'linear',
    mipmapFilter: 'linear',
    ...options,
  });
}

export class PingPongTextures {
  private textures: [GPUTexture, GPUTexture];
  private index = 0;

  constructor(device: GPUDevice, width: number, height: number, format: GPUTextureFormat = 'rgba16float', label?: string) {
    this.textures = [
      createStorageTexture(device, width, height, format, label ? `${label}_A` : undefined),
      createStorageTexture(device, width, height, format, label ? `${label}_B` : undefined),
    ];
  }

  get read(): GPUTexture { return this.textures[this.index]; }
  get write(): GPUTexture { return this.textures[1 - this.index]; }
  swap(): void { this.index = 1 - this.index; }

  destroy(): void {
    this.textures[0].destroy();
    this.textures[1].destroy();
  }
}
