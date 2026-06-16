import { useUIStore } from '../../state/uiStore';
import { useSceneStore } from '../../state/sceneStore';

const C = { panel: '#090d14', border: '#162331', cyan: '#00f5ff', magenta: '#ff2bd6', lime: '#b7ff35', bg: '#03050a' };

export function TopBar() {
  const { fps, frameTime, isRecording, setRecording, toggleLayerStack, toggleInspector, toggleAudioAnalyzer, toggleEngineLibrary, audioInputActive, setAudioInputActive } = useUIStore();
  const { scene, setBPM, setClockRunning } = useSceneStore();

  return (
    <div style={{
      height: 40, background: C.panel, borderBottom: `1px solid ${C.border}`,
      display: 'flex', alignItems: 'center', padding: '0 12px', gap: 12, flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 3, color: C.cyan, textShadow: `0 0 8px ${C.cyan}`, marginRight: 8 }}>
        AETHERVJ
      </div>

      {/* Scene name */}
      <div style={{ fontSize: 11, color: '#556', flex: 1 }}>{scene.name}</div>

      {/* BPM */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 9, color: '#445', textTransform: 'uppercase' }}>BPM</span>
        <input
          type="number" value={scene.bpm} min={40} max={300}
          onChange={e => setBPM(parseInt(e.target.value, 10) || 120)}
          style={{ width: 48, background: C.bg, border: `1px solid ${C.border}`, color: C.lime, fontSize: 12, padding: '2px 4px', borderRadius: 3, textAlign: 'center' }}
        />
        <div
          onClick={() => setClockRunning(!scene.masterClock.running)}
          style={{
            width: 8, height: 8, borderRadius: '50%',
            background: scene.masterClock.running ? C.lime : '#162331',
            cursor: 'pointer',
            boxShadow: scene.masterClock.running ? `0 0 6px ${C.lime}` : 'none',
          }}
        />
      </div>

      {/* Audio input */}
      <button
        onClick={() => setAudioInputActive(!audioInputActive)}
        style={{
          background: audioInputActive ? 'rgba(0,245,255,0.1)' : 'transparent',
          border: `1px solid ${audioInputActive ? C.cyan : C.border}`,
          color: audioInputActive ? C.cyan : '#445',
          fontSize: 9, padding: '3px 8px', borderRadius: 3, cursor: 'pointer',
          textTransform: 'uppercase', letterSpacing: 1,
        }}
      >
        {audioInputActive ? 'Audio On' : 'Audio Off'}
      </button>

      {/* Panel toggles */}
      {[
        { label: 'Layers', fn: toggleLayerStack },
        { label: 'Inspector', fn: toggleInspector },
        { label: 'Audio', fn: toggleAudioAnalyzer },
        { label: 'Library', fn: toggleEngineLibrary },
      ].map(({ label, fn }) => (
        <button key={label} onClick={fn} style={{
          background: 'transparent', border: `1px solid ${C.border}`,
          color: '#445', fontSize: 9, padding: '3px 7px', borderRadius: 3,
          cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 1,
        }}>
          {label}
        </button>
      ))}

      {/* REC */}
      <button
        onClick={() => setRecording(!isRecording)}
        style={{
          background: isRecording ? 'rgba(255,49,88,0.15)' : 'transparent',
          border: `1px solid ${isRecording ? '#ff3158' : C.border}`,
          color: isRecording ? '#ff3158' : '#445',
          fontSize: 9, padding: '3px 8px', borderRadius: 3, cursor: 'pointer',
          textTransform: 'uppercase', letterSpacing: 1,
        }}
      >
        {isRecording ? 'REC' : 'Rec'}
      </button>

      {/* FPS */}
      <div style={{ fontSize: 9, color: fps > 50 ? '#334' : '#ffb000', fontVariantNumeric: 'tabular-nums', minWidth: 50, textAlign: 'right' }}>
        {fps} FPS
      </div>
    </div>
  );
}
