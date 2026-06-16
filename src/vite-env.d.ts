/// <reference types="vite/client" />
/// <reference types="@webgpu/types" />

declare module '*.wgsl?raw' {
  const content: string;
  export default content;
}

// Augment canvas getContext to support 'webgpu'
interface HTMLCanvasElement {
  getContext(contextId: 'webgpu'): GPUCanvasContext | null;
}
