import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { RADAR_DIMENSIONS, COMPARE_COLORS } from '../utils/radar';

interface RadarData {
  name: string;
  values: number[];
  baseline?: boolean; // 是否为参考基准线
}

interface RadarChartProps {
  datasets: RadarData[];
  size?: number;
  levels?: number;
}

/**
 * 12 维归一化雷达图（SVG 绘制）
 * 支持单个或多个数据集叠加
 */
export default function RadarChart({ datasets, size = 360, levels = 4 }: RadarChartProps) {
  const center = size / 2;
  const radius = center - 58; // 留出标签空间
  const angleStep = (Math.PI * 2) / RADAR_DIMENSIONS.length;
  const angleOffset = angleStep / 2; // 旋转半格，避免标签落在 x/y 轴上

  // 计算每个维度的坐标点
  const getPoint = (index: number, value: number) => {
    const angle = angleStep * index - Math.PI / 2 + angleOffset; // 从正上方开始，偏移半格
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // 外圈顶点
  const outerPoints = RADAR_DIMENSIONS.map((_, i) => getPoint(i, 100));

  // 网格层级
  const gridLevels = useMemo(() => {
    const levels_arr = [];
    for (let l = 1; l <= levels; l++) {
      const pct = (l / levels) * 100;
      const pts = RADAR_DIMENSIONS.map((_, i) => getPoint(i, pct));
      levels_arr.push(pts);
    }
    return levels_arr;
  }, [radius]);

  return (
    <div className="flex flex-col items-center overflow-visible">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} overflow="visible">
        {/* 网格层 */}
        {gridLevels.map((pts, l) => (
          <polygon
            key={`grid-${l}`}
            points={pts.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
          />
        ))}

        {/* 轴线 */}
        {RADAR_DIMENSIONS.map((_, i) => {
          const p = outerPoints[i];
          return (
            <line
              key={`axis-${i}`}
              x1={center}
              y1={center}
              x2={p.x}
              y2={p.y}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={1}
            />
          );
        })}

        {/* 数据多边形 */}
        {datasets.map((data, di) => {
          const isBaseline = data.baseline;
          const color = isBaseline
            ? { fill: 'rgba(255,255,255,0.02)', stroke: 'rgba(255,255,255,0.2)' }
            : COMPARE_COLORS[di % COMPARE_COLORS.length];
          const points = data.values.map((v, i) => getPoint(i, v));

          return (
            <motion.g
              key={`data-${di}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.05, delay: di * 0.15, ease: [0.43, 0.13, 0.23, 0.96] }}
              style={{ transformOrigin: `${center}px ${center}px` }}
            >
              <polygon
                points={points.map(p => `${p.x},${p.y}`).join(' ')}
                fill={color.fill}
                stroke={color.stroke}
                strokeWidth={isBaseline ? 2.5 : 2}
                strokeDasharray={isBaseline ? '4 4' : undefined}
              />
              {/* 数据点小圆 — 基准线不绘制 */}
              {!isBaseline && points.map((p, i) => (
                <motion.circle
                  key={`dot-${di}-${i}`}
                  cx={p.x}
                  cy={p.y}
                  r={3}
                  fill={color.stroke}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 + di * 0.15 + i * 0.02 }}
                />
              ))}
            </motion.g>
          );
        })}

        {/* 维度标签 */}
        {RADAR_DIMENSIONS.map((dim, i) => {
          const labelR = radius + 24;
          const angle = angleStep * i - Math.PI / 2 + angleOffset;
          const x = center + labelR * Math.cos(angle);
          const y = center + labelR * Math.sin(angle);
          const isLeft = Math.cos(angle) < -0.1;
          const isRight = Math.cos(angle) > 0.1;
          const textAnchor = isLeft ? 'end' : isRight ? 'start' : 'middle';
          const dy = Math.abs(Math.sin(angle)) < 0.2 ? '0.4em' : '0';

          // 按归类分组颜色
          const categoryColors: Record<string, string> = {
            appearance: '#CD9575',
            aroma: '#F5C842',
            flavor: '#E88078',
            aftertaste: '#C8A8D0',
          };

          return (
            <text
              key={`label-${i}`}
              x={x}
              y={y}
              dy={dy}
              textAnchor={textAnchor}
              fill={categoryColors[dim.category] || '#B0A69D'}
              fontSize={12}
              fontFamily="'Playfair Display', 'Noto Serif SC', Georgia, serif"
              fontWeight={500}
            >
              {dim.label}
            </text>
          );
        })}
      </svg>

      {/* 图例 */}
      {datasets.length > 1 && (
        <div className="flex flex-wrap justify-center gap-3 mt-3">
          {datasets.map((data, di) => {
            const color = COMPARE_COLORS[di % COMPARE_COLORS.length];
            return (
              <div key={`legend-${di}`} className="flex items-center gap-1.5 text-xs text-noir-300">
                <span
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: color.stroke }}
                />
                {data.name}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
