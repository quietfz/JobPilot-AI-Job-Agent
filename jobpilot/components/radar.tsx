'use client';

interface RadarItem {
  label: string;
  value: number;
}

export function RadarChart({
  data,
  size = 236,
  benchmark = 70,
}: {
  data: RadarItem[];
  size?: number;
  benchmark?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.34;
  const n = Math.max(3, data.length);
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i: number, value: number) => {
    const r = (Math.max(0, Math.min(100, value)) / 100) * radius;
    return [cx + r * Math.cos(angle(i)), cy + r * Math.sin(angle(i))] as const;
  };
  const polygon = (values: number[]) =>
    values.map((v, i) => point(i, v).join(',')).join(' ');

  const grids = [25, 50, 75, 100];

  return (
    <svg width={size} height={size} className="overflow-visible">
      {grids.map((g) => (
        <polygon
          key={g}
          points={polygon(Array(n).fill(g))}
          fill={g === 100 ? 'rgba(47,75,255,0.03)' : 'none'}
          stroke="#E4E7F0"
          strokeWidth={1}
        />
      ))}
      {Array.from({ length: n }).map((_, i) => {
        const [x, y] = point(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#E4E7F0" strokeWidth={1} />;
      })}

      <polygon
        points={polygon(Array(n).fill(benchmark))}
        fill="none"
        stroke="#B9C0D4"
        strokeWidth={1}
        strokeDasharray="4 4"
      />

      <polygon
        points={polygon(data.map((d) => d.value))}
        fill="rgba(47,75,255,0.14)"
        stroke="#2F4BFF"
        strokeWidth={2}
        strokeLinejoin="round"
        style={{ transition: 'all 600ms cubic-bezier(0.22,1,0.36,1)' }}
      />

      {data.map((d, i) => {
        const [x, y] = point(i, d.value);
        const [lx, ly] = point(i, 122);
        return (
          <g key={d.label}>
            <circle cx={x} cy={y} r={3.4} fill="#2F4BFF" />
            <text
              x={lx}
              y={ly}
              textAnchor={Math.abs(lx - cx) < 3 ? 'middle' : lx > cx ? 'start' : 'end'}
              dominantBaseline="middle"
              className="fill-ink-500 text-[10px] font-medium"
            >
              {d.label}
            </text>
            <text
              x={lx}
              y={ly + 12}
              textAnchor={Math.abs(lx - cx) < 3 ? 'middle' : lx > cx ? 'start' : 'end'}
              dominantBaseline="middle"
              className="fill-brand-500 text-[10px] font-semibold"
            >
              {Math.round(d.value)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
