import { useSceneStore } from '../../state/sceneStore';
import { useUIStore } from '../../state/uiStore';
import type { AetherLayer } from '../../types/scene';

const C = { panel: '#090d14', border: '#162331', cyan: '#00f5ff', bg: '#03050a' };

function LayerRow({ layer, index, selected, onSelect }: { layer: AetherLayer; index: number; selected: boolean; onSelect: () => void }) {
  const { setLayerEnabled, setLayerOpacity, removeLayer } = useSceneStore();

  return (
    <div
      onClick={onSelect}
      style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px',
        background: selected ? 'rgba(0,245,255,0.06)' : 'transparent',
        borderLeft: selected ? `2px solid ${C.cyan}` : '2px solid transparent',
        cursor: 'pointer', transition: 'background 0.1s',
      }}
    >
      <div style={{
        width: 8, height: 8, borderRadius: '50%',
        background: layer.enabled ? C.cyan : '#162331',
        cursor: 'pointer', flexShrink: 0,
      }} onClick={e => { e.stopPropagation(); setLayerEnabled(layer.id, !layer.enabled); }} />

      <div style={{ flex: 1, fontSize: 11, color: '#cde', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {layer.name}
      </div>

      <div style={{ fontSize: 9, color: '#556', textTransform: 'uppercase' }}>
        {layer.engine.engineType}
      </div>

      <input
        type="range" min={0} max={1} step={0.01} value={layer.opacity}
        onChange={e => setLayerOpacity(layer.id, parseFloat(e.target.value))}
        onClick={e => e.stopPropagation()}
        style={{ width: 48, accentColor: C.cyan, cursor: 'ew-resize' }}
      />

      <button
        onClick={e => { e.stopPropagation(); removeLayer(layer.id); }}
        style={{ background: 'none', border: 'none', color: '#ff3158', cursor: 'pointer', fontSize: 12, padding: 0, lineHeight: 1 }}
      >×</button>
    </div>
  );
}

export function LayerStack() {
  const layers = useSceneStore(s => s.scene.layers);
  const { selectedLayerId, setSelectedLayer } = useUIStore();

  return (
    <div style={{ background: C.panel, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', width: 220, flexShrink: 0 }}>
      <div style={{ padding: '8px 10px', borderBottom: `1px solid ${C.border}`, fontSize: 10, color: '#556', textTransform: 'uppercase', letterSpacing: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Layers</span>
        <span style={{ color: C.cyan }}>{layers.length}</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {layers.length === 0 ? (
          <div style={{ padding: 16, fontSize: 11, color: '#334', textAlign: 'center' }}>No layers. Add an engine.</div>
        ) : (
          [...layers].reverse().map((layer, i) => (
            <LayerRow
              key={layer.id}
              layer={layer}
              index={layers.length - 1 - i}
              selected={selectedLayerId === layer.id}
              onSelect={() => setSelectedLayer(layer.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
