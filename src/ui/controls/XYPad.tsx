import { useRef, useCallback } from 'react';

type XYPadProps = {
  labelX: string;
  labelY: string;
  x: number;
  y: number;
  minX?: number; maxX?: number;
  minY?: number; maxY?: number;
  onChangeX: (v: number) => void;
  onChangeY: (v: number) => void;
  size?: number;
  colorX?: string;
  colorY?: string;
};

export function AetherXYPad({
  labelX, labelY, x, y, minX = 0, maxX = 1, minY = 0, maxY = 1,
  onChangeX, onChangeY, size = 100, colorX = '#00f5ff', colorY = '#ff2bd6'
}: XYPadProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const normX = (x - minX) / (maxX - minX);
  const normY = 1 - (y - minY) / (maxY - minY);
  const dotX = normX * size;
  const dotY = normY * size;

  const getVals = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const nx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const ny = Math.max(0, Math.min(1, (e.clientY - rect.top)  / rect.height));
    onChangeX(minX + nx * (maxX - minX));
    onChangeY(maxY - ny * (maxY - minY));
  }, [minX, maxX, minY, maxY, onChangeX, onChangeY]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    getVals(e);
    const onMove = (me: MouseEvent) => getVals(me);
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    e.preventDefault();
  }, [getVals]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <svg ref={svgRef} width={size} height={size} style={{ cursor: 'crosshair', display: 'block' }} onMouseDown={onMouseDown}>
        <rect width={size} height={size} fill="#090d14" stroke="#162331" strokeWidth={1} rx={2} />
        {/* Grid */}
        <line x1={size/2} y1={0} x2={size/2} y2={size} stroke="#162331" strokeWidth={0.5} />
        <line x1={0} y1={size/2} x2={size} y2={size/2} stroke="#162331" strokeWidth={0.5} />
        {/* Crosshairs */}
        <line x1={dotX} y1={0} x2={dotX} y2={size} stroke={colorX} strokeWidth={0.5} strokeOpacity={0.4} />
        <line x1={0} y1={dotY} x2={size} y2={dotY} stroke={colorY} strokeWidth={0.5} strokeOpacity={0.4} />
        {/* Dot */}
        <circle cx={dotX} cy={dotY} r={5} fill="none" stroke={colorX} strokeWidth={1.5}
          style={{ filter: `drop-shadow(0 0 3px ${colorX})` }} />
        <circle cx={dotX} cy={dotY} r={2} fill={colorX} />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#8899aa' }}>
        <span>{labelX}</span><span>{labelY}</span>
      </div>
    </div>
  );
}
