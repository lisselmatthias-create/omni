export const AUDIO_WORKLET_CODE = /* js */`
class AetherAnalyzerProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._buffer = new Float32Array(2048);
    this._writePos = 0;
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;
    const ch = input[0];
    for (let i = 0; i < ch.length; i++) {
      this._buffer[this._writePos++ % 2048] = ch[i];
    }
    this.port.postMessage({ type: 'samples', data: this._buffer.slice() });
    return true;
  }
}

registerProcessor('aether-analyzer', AetherAnalyzerProcessor);
`;

export function createWorkletBlobURL(): string {
  const blob = new Blob([AUDIO_WORKLET_CODE], { type: 'application/javascript' });
  return URL.createObjectURL(blob);
}
