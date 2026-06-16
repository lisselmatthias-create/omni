export class UniformBuffer {
  readonly buffer: GPUBuffer;
  private data: Float32Array;
  private readonly device: GPUDevice;

  constructor(device: GPUDevice, floatCount: number, label?: string) {
    this.device = device;
    this.data = new Float32Array(Math.ceil(floatCount / 4) * 4);
    this.buffer = device.createBuffer({
      label,
      size: this.data.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
  }

  setFloat(offset: number, value: number): void {
    this.data[offset] = value;
  }

  setVec2(offset: number, x: number, y: number): void {
    this.data[offset] = x;
    this.data[offset + 1] = y;
  }

  setVec4(offset: number, x: number, y: number, z: number, w: number): void {
    this.data[offset] = x;
    this.data[offset + 1] = y;
    this.data[offset + 2] = z;
    this.data[offset + 3] = w;
  }

  upload(): void {
    this.device.queue.writeBuffer(this.buffer, 0, this.data);
  }

  destroy(): void {
    this.buffer.destroy();
  }
}

export type GlobalUniforms = {
  time: number;
  dt: number;
  width: number;
  height: number;
  bpm: number;
  bpmPhase: number;
  bass: number;
  mid: number;
  treble: number;
  rms: number;
};

export class GlobalUniformBuffer {
  readonly ub: UniformBuffer;

  constructor(device: GPUDevice) {
    this.ub = new UniformBuffer(device, 16, 'GlobalUniforms');
  }

  update(device: GPUDevice, uniforms: GlobalUniforms): void {
    const { time, dt, width, height, bpm, bpmPhase, bass, mid, treble, rms } = uniforms;
    this.ub.setFloat(0, time);
    this.ub.setFloat(1, dt);
    this.ub.setFloat(2, width);
    this.ub.setFloat(3, height);
    this.ub.setFloat(4, bpm);
    this.ub.setFloat(5, bpmPhase);
    this.ub.setFloat(6, bass);
    this.ub.setFloat(7, mid);
    this.ub.setFloat(8, treble);
    this.ub.setFloat(9, rms);
    this.ub.upload();
  }

  get buffer(): GPUBuffer { return this.ub.buffer; }

  destroy(): void { this.ub.destroy(); }
}
