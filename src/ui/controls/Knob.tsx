import { useRef, useCallback, useEffect } from 'react';
import { useUIStore } from '../../state/uiStore';

type KnobProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  layerId?: string;
  paramId?: string;
  size?: number;
  color?: string;
  unit?: string;
};

export function AetherKnob({ label, value, min, max, onChange, layerId, paramId, size = 44, color = '#00f5ff', unit = '' }: KnobProps) {
  const dragRef = useRef<{ startY: number; startVal: number } | null>(null);
  const beginDragMod = useUIStore(s => s.beginDragMod);

  const normalized = (value - min) / (max - min);
  const angle = -135 + normalized * 270;

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.altKey && layerId && paramId) {
      beginDragMod(layerId, paramId, label, e.clientX, e.clientY);
      return;
    }
    dragRef.current = { startY: e.clientY, startVal: value };
    const onMove = (me: MouseEvent) => {
      if (!dragRef.current) return;
      const dy = dragRef.current.startY - me.clientY;
      const range = max - min;
      const newVal = Math.max(min, Math.min(max, dragRef.current.startVal + (dy / 120) * range));
      onChange(newVal);
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    e.preventDefault();
  }, [value, min, max, onChange, layerId, paramId, label, beginDragMod]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    const range = max - min;
    const delta = -e.deltaY / 500 * range;
    onChange(Math.max(min, Math.min(max, value + delta)));
    e.preventDefault();
  }, [value, min, max, onChange]);

  const r = size / 2 - 4;
  const cx = size / 2, cy = size / 2;
  const rad = (a: number) => (a - 90) * Math.PI / 180;
  const trackStart = rad(-135);
  const trackEnd = rad(135);
  const valEnd = rad(angle);

  const arcPath = (startA: number, endA: number, radius: number) => {
    const x1 = cx + radius * Math.cos(startA);
    const y1 = cy + radius * Math.sin(startA);
    const x2 = cx + radius * Math.cos(endA);
    const y2 = cy + radius * Math.sin(endA);
    const large = Math.abs(endA - startA) > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`;
  };

  const dotX = cx + (r - 3) * Math.cos(rad(angle));
  const dotY = cy + (r - 3) * Math.sin(rad(angle));

  const displayVal = Number.isInteger((value - min) / (max - min)) ? value.toFixed(0) : value.toFixed(2);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, userSelect: 'none' }}>
      <svg
        width={size} height={size}
        style={{ cursor: 'ns-resize', overflow: 'visible' }}
        onMouseDown={onMouseDown}
        onWheel={onWheel}
      >
        {/* Track */}
        <path d={arcPath(trackStart, trackEnd, r)} fill="none" stroke="#162331" strokeWidth={3} strokeLinecap="round" />
        {/* Value arc */}
        <path d={arcPath(trackStart, valEnd, r)} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 3px ${color})` }} />
        {/* Center circle */}
        <circle cx={cx} cy={cy} r={r * 0.35} fill="#090d14" stroke="#162331" strokeWidth={1} />
        {/* Dot */}
        <circle cx={dotX} cy={dotY} r={2.5} fill={color} style={{ filter: `drop-shadow(0 0 2px ${color})` }} />
      </svg>
      <div style={{ fontSize: 9, color: '#8899aa', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center', maxWidth: size + 8 }}>{label}</div>
      <div style={{ fontSize: 9, color: color, fontVariantNumeric: 'tabular-nums' }}>{displayVal}{unit}</div>
    </div>
  );
}
