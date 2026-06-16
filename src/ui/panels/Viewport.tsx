import { useEffect, useRef, useCallback } from 'react';
import { useUIStore } from '../../state/uiStore';
import { useSceneStore } from '../../state/sceneStore';
import { RenderGraph } from '../../gpu/renderGraph';
import { AudioEngine } from '../../audio/audioEngine';
import type { GlobalUniforms } from '../../gpu/uniforms';

const audioEngine = new AudioEngine();

export function Viewport() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const graphRef  = useRef<RenderGraph | null>(null);
  const rafRef    = useRef<number>(0);
  const startTime = useRef(performance.now() / 1000);
  const lastTime  = useRef(performance.now() / 1000);
  const fpsRef    = useRef({ frames: 0, last: performance.now() });

  const device = useUIStore(s => s.device);
  const { setFPS, setFrameTime, setAudioFeatures, audioInputActive } = useUIStore();
  const scene = useSceneStore(s => s.scene);

  // Sync audio
  useEffect(() => {
    if (audioInputActive) {
      audioEngine.start().catch(console.error);
    } else {
      audioEngine.stop().catch(console.error);
    }
  }, [audioInputActive]);

  const initGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !device) return;

    const ctx = canvas.getContext('webgpu');
    if (!ctx) return;

    const format = navigator.gpu.getPreferredCanvasFormat();
    ctx.configure({ device, format, alphaMode: 'premultiplied' });

    graphRef.current?.destroy();
    graphRef.current = new RenderGraph({
      device,
      width: canvas.width,
      height: canvas.height,
      presentationFormat: format,
    });
  }, [device]);

  useEffect(() => { initGraph(); }, [initGraph]);

  // Resize observer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const obs = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        canvas.width = Math.round(width * devicePixelRatio);
        canvas.height = Math.round(height * devicePixelRatio);
        graphRef.current?.resize(canvas.width, canvas.height);
      }
    });
    obs.observe(canvas);
    return () => obs.disconnect();
  }, []);

  // Sync layers to render graph
  useEffect(() => {
    // Engines are managed separately — just sync enabled/opacity
  }, [scene.layers]);

  // Render loop
  useEffect(() => {
    if (!device) return;

    const loop = () => {
      const now = performance.now() / 1000;
      const dt = Math.min(now - lastTime.current, 0.1);
      lastTime.current = now;
      const time = now - startTime.current;

      // Audio
      const features = audioEngine.analyze(time);
      setAudioFeatures(features);

      // FPS counter
      fpsRef.current.frames++;
      if (now * 1000 - fpsRef.current.last >= 1000) {
        setFPS(fpsRef.current.frames);
        setFrameTime(1000 / Math.max(1, fpsRef.current.frames));
        fpsRef.current = { frames: 0, last: now * 1000 };
      }

      const canvas = canvasRef.current;
      const graph = graphRef.current;
      if (canvas && graph && device) {
        const ctx = canvas.getContext('webgpu');
        if (ctx) {
          const audioArr = new Float32Array([
            features.rms, features.peak, features.bass, features.lowMid,
            features.mid, features.highMid, features.treble,
            features.spectralCentroid, features.spectralFlux, features.onset,
            features.beatPulse, features.bpmPhase, features.kickConfidence,
            features.snareConfidence, features.vocalPresence, features.noiseFloor,
          ]);

          const uniforms: GlobalUniforms = {
            time, dt,
            width: canvas.width,
            height: canvas.height,
            bpm: 120,
            bpmPhase: features.bpmPhase,
            bass: features.bass,
            mid: features.mid,
            treble: features.treble,
            rms: features.rms,
          };

          try {
            graph.render(ctx.getCurrentTexture(), audioArr, uniforms);
          } catch { /* device lost */ }
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [device, setFPS, setFrameTime, setAudioFeatures]);

  return (
    <canvas
      ref={canvasRef}
      style={{ flex: 1, display: 'block', width: '100%', height: '100%', background: '#03050a' }}
    />
  );
}
