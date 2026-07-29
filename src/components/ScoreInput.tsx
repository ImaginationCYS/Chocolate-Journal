import { motion } from 'framer-motion';

interface ScoreInputProps {
  label: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
  description?: string;
  color?: string;
}

export default function ScoreInput({ label, value, max, onChange, description, color = '#CD9575' }: ScoreInputProps) {
  const percentage = (value / max) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-noir-300">{label}</span>
        <motion.span
          key={value}
          initial={{ scale: 1.3, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-lg font-bold font-display"
          style={{ color }}
        >
          {value}<span className="text-lg text-noir-500">/{max}</span>
        </motion.span>
      </div>

      {/* 滑轨 + 滑块层叠 */}
      <div className="relative h-6 flex items-center">
        {/* 底层滑轨 */}
        <div className="absolute inset-y-0 left-0 right-0 flex items-center pointer-events-none">
          <div className="w-full h-2 rounded-full bg-noir-800 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: color, width: `${percentage}%` }}
              transition={{ duration: 0.15 }}
            />
          </div>
        </div>

        {/* 上层原生滑块，覆盖滑轨 */}
        <input
          type="range"
          min={0}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="relative w-full h-full appearance-none bg-transparent cursor-pointer z-10
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-noir-950
            [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:active:scale-95
            [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-noir-950 [&::-moz-range-thumb]:cursor-pointer"
        />
      </div>

      {/* 注入滑块颜色 + 阴影 */}
      <style>{`
        input[type=range]::-webkit-slider-thumb {
          background: ${color};
          box-shadow: 0 2px 6px rgba(0,0,0,0.5), 0 0 14px ${color}66;
        }
        input[type=range]::-moz-range-thumb {
          background: ${color};
          box-shadow: 0 2px 6px rgba(0,0,0,0.5), 0 0 14px ${color}66;
        }
      `}</style>

      {description && (
        <p className="text-sm text-noir-500">{description}</p>
      )}
    </div>
  );
}
