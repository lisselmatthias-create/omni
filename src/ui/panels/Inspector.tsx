import { useSceneStore } from '../../state/sceneStore';
import { useUIStore } from '../../state/uiStore';
import { AetherKnob } from '../controls/Knob';
import { AetherSlider } from '../controls/Slider';
import type { AetherParam } from '../../types/scene';

const C = { panel: '#090d14', border: '#162331', cyan: '#00f5ff', magenta: '#ff2bd6' };

function ParamControl({ param, layerId, onChange }: { param: AetherParam; layerId: string; onChange: (v: unknown) => void }) {
  if (param.type === 'bool') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div
          style={{ width: 28, height: 14, borderRadius: 7, background: param.value ? C.cyan : '#162331', cursor: 'pointer', transition: 'background 0.2s', position: 'relative' }}
          onClick={() => onChange(!param.value)}
        >
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: param.value ? 16 : 2, transition: 'left 0.2s' }} />
        </div>
        <span style={{ fontSize: 10, color: '#8899aa' }}>{param.label}</span>
      </div>
    );
  }

  if (param.display === 'slider') {
    return (
      <AetherSlider
        label={param.label}
        value={param.value as number}
        min={param.min ?? 0}
        max={param.max ?? 1}
        onChange={onChange}
        layerId={layerId}
        paramId={param.id}
      />
    );
  }

  if (param.display === 'dropdown' || param.type === 'enum' || param.type === 'int') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: 9, color: '#8899aa', textTransform: 'uppercase', letterSpacing: 1 }}>{param.label}</div>
        <select
          value={String(param.value)}
          onChange={e => onChange(Number(e.target.value))}
          style={{ background: '#03050a', border: '1px solid #162331', color: '#cde', fontSize: 11, padding: '2px 4px', borderRadius: 3 }}
        >
          {Array.from({ length: (param.max ?? 5) - (param.min ?? 0) + 1 }, (_, i) => (param.min ?? 0) + i).map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <AetherKnob
      label={param.label}
      value={param.value as number}
      min={param.min ?? 0}
      max={param.max ?? 1}
      onChange={onChange}
      layerId={layerId}
      paramId={param.id}
      unit={param.unit ?? ''}
    />
  );
}

export function Inspector() {
  const { selectedLayerId } = useUIStore();
  const { scene, setLayerParam } = useSceneStore();
  const layer = scene.layers.find(l => l.id === selectedLayerId);

  return (
    <div style={{ background: C.panel, borderLeft: `1px solid ${C.border}`, width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '8px 10px', borderBottom: `1px solid ${C.border}`, fontSize: 10, color: '#556', textTransform: 'uppercase', letterSpacing: 1 }}>
        Inspector
      </div>
      {!layer ? (
        <div style={{ padding: 16, fontSize: 11, color: '#334', textAlign: 'center' }}>Select a layer</div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
          <div style={{ fontSize: 12, color: C.cyan, marginBottom: 8, fontWeight: 600 }}>{layer.name}</div>
          <div style={{ fontSize: 9, color: '#445', textTransform: 'uppercase', marginBottom: 8 }}>{layer.engine.engineType}</div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {Object.values(layer.engine.parameters).map(param => (
              <ParamControl
                key={param.id}
                param={param}
                layerId={layer.id}
                onChange={(v) => setLayerParam(layer.id, param.id, v)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
