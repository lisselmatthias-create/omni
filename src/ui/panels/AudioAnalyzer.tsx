import { useEffect, useRef } from 'react';
import { useUIStore } from '../../state/uiStore';

const C = { panel: '#090d14', border: '#162331', cyan: '#00f5ff', magenta: '#ff2bd6', lime: '#b7ff35' };

const BAND_LABELS = ['RMS', 'Bass', 'LMid', 'Mid', 'HMid', 'Treble', 'Flux', 'Onset'];

export function AudioAnalyzer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { audioFeatures, audioInputActive, setAudioInputActive } = useUIStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Draw BPM phase arc
    const af = audioFeatures;
    const vals = [af.rms, af.bass, af.lowMid, af.mid, af.highMid, af.treble, af.spectralFlux * 5, af.onset];

    const barW = W / vals.length;
    vals.forEach((v, i) => {
      const bh = Math.max(2, v * H);
      const hue = (i / vals.length) * 180;
      ctx.fillStyle = `hsl(${hue + 180}, 100%, 60%)`;
      ctx.fillRect(i * barW + 1, H - bh, barW - 2, bh);
    });

    // Beat pulse ring
    if (af.beatPulse > 0.5) {
      ctx.strokeStyle = C.cyan;
      ctx.lineWidth = 2;
      ctx.shadowColor = C.cyan;
      ctx.shadowBlur = 8;
      ctx.strokeRect(1, 1, W - 2, H - 2);
      ctx.shadowBlur = 0;
    }
  });

  return (
    <div style={{ background: C.panel, borderTop: `1px solid ${C.border}`, padding: '6px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 10, color: '#556', textTransform: 'uppercase', letterSpacing: 1, flex: 1 }}>Audio</span>
        <div
          onClick={() => setAudioInputActive(!audioInputActive)}
          style={{
            width: 10, height: 10, borderRadius: '50%',
            background: audioInputActive ? C.cyan : '#162331',
            cursor: 'pointer',
            boxShadow: audioInputActive ? `0 0 6px ${C.cyan}` : 'none',
          }}
        />
        <span style={{ fontSize: 9, color: audioInputActive ? C.cyan : '#445' }}>
          {audioInputActive ? 'LIVE' : 'OFF'}
        </span>
        <span style={{ fontSize: 9, color: '#556', marginLeft: 8 }}>
          {Math.round(audioFeatures.bpmPhase > 0 ? 120 : 0)} BPM
        </span>
      </div>
      <canvas ref={canvasRef} width={220} height={40} style={{ width: '100%', height: 40, display: 'block' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {BAND_LABELS.map(l => <span key={l} style={{ fontSize: 8, color: '#334' }}>{l}</span>)}
      </div>
    </div>
  );
}
