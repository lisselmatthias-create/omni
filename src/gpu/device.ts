export type GPUContext = {
  device: GPUDevice;
  adapter: GPUAdapter;
};

export async function initGPU(): Promise<GPUContext> {
  if (!navigator.gpu) {
    throw new Error('WebGPU is not supported in this browser.');
  }
  const adapter = await navigator.gpu.requestAdapter({
    powerPreference: 'high-performance',
  });
  if (!adapter) {
    throw new Error('No suitable GPU adapter found.');
  }
  const device = await adapter.requestDevice({
    requiredFeatures: [],
    requiredLimits: {
      maxStorageBufferBindingSize: adapter.limits.maxStorageBufferBindingSize,
      maxBufferSize: adapter.limits.maxBufferSize,
    },
  });
  device.lost.then(info => {
    console.error('GPU device lost:', info.reason, info.message);
  });
  return { device, adapter };
}

export function createRenderPipeline(
  device: GPUDevice,
  descriptor: GPURenderPipelineDescriptor
): GPURenderPipeline {
  return device.createRenderPipeline(descriptor);
}

export function createComputePipeline(
  device: GPUDevice,
  descriptor: GPUComputePipelineDescriptor
): GPUComputePipeline {
  return device.createComputePipeline(descriptor);
}
