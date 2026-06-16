import { useRef, useCallback } from 'react';
import { useUIStore } from '../../state/uiStore';

type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  layerId?: string;
  paramId?: string;
  color?: string;
  vertical?: boolean;
  width?: number;
  height?: number;
};

export function AetherSlider({ label, value, min, max, onChange, layerId, paramId, color = '#00f5ff', vertical = false, width = 120, height = 20 }: SliderProps) {
  const trackRef = useRef<SVGSVGElement>(null);
  const beginDragMod = useUIStore(s => s.beginDragMod);
  const norm = (value - min) / (max - min);

  const getValFromEvent = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!trackRef.current) return value;
    const rect = trackRef.current.getBoundingClientRect();
    const t = vertical
      ? 1 - (e.clientY - rect.top) / rect.height
      : (e.clientX - rect.left) / rect.width;
    return min + Math.max(0, Math.min(1, t)) * (max - min);
  }, [value, min, max, vertical]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.altKey && layerId && paramId) {
      beginDragMod(layerId, paramId, label, e.clientX, e.clientY);
      return;
    }
    onChange(getValFromEvent(e));
    const onMove = (me: MouseEvent) => onChange(getValFromEvent(me));
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    e.preventDefault();
  }, [onChange, getValFromEvent, layerId, paramId, label, beginDragMod]);

  const W = vertical ? height : width;
  const H = vertical ? width : height;
  const fillW = vertical ? W : norm * W;
  const fillH = vertical ? (1 - norm) * H : H;
  const fillX = 0;
  const fillY = vertical ? norm * H : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {label && <div style={{ fontSize: 9, color: '#8899aa', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>}
      <svg ref={trackRef} width={W} height={H} style={{ cursor: vertical ? 'ns-resize' : 'ew-resize' }} onMouseDown={onMouseDown}>
        <rect x={0} y={0} width={W} height={H} fill="#162331" rx={2} />
        <rect x={fillX} y={fillY} width={fillW} height={fillH} fill={color} rx={2}
          style={{ filter: `drop-shadow(0 0 2px ${color})` }} />
      </svg>
    </div>
  );
}
