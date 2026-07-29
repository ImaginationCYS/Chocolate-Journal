import { motion } from 'framer-motion';
import { getScoreColor, getScoreBgColor } from '../types';

interface ScoreCircleProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animate?: boolean;
}

const sizeConfig = {
  sm: { dimension: 56, strokeWidth: 3, fontSize: 'text-sm' },
  md: { dimension: 80, strokeWidth: 4, fontSize: 'text-xl' },
  lg: { dimension: 120, strokeWidth: 5, fontSize: 'text-3xl' },
};

export default function ScoreCircle({ score, size = 'md', showLabel = false, animate = true }: ScoreCircleProps) {
  const { dimension, strokeWidth, fontSize } = sizeConfig[size];
  const radius = (dimension - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(score / 100, 1);
  const offset = circumference * (1 - progress);

  const scoreColorClass = getScoreColor(score);
  const scoreBgClass = getScoreBgColor(score);

  return (
    <div className="relative inline-flex flex-col items-center gap-1">
      <div className="relative" style={{ width: dimension, height: dimension }}>
        {/* 背景圆环 */}
        <svg width={dimension} height={dimension} className="-rotate-90">
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-noir-800"
          />
          {/* 进度圆环 */}
          <motion.circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className={scoreColorClass}
            initial={animate ? { strokeDashoffset: circumference } : { strokeDashoffset: offset }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
            style={{
              strokeDasharray: circumference,
            }}
          />
        </svg>
        {/* 中心分数 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className={`${fontSize} font-display font-bold ${scoreColorClass}`}
            initial={animate ? { opacity: 0, scale: 0.5 } : undefined}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {score}
          </motion.span>
        </div>
      </div>
      {showLabel && (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${scoreBgClass} ${scoreColorClass}`}>
          {score >= 90 ? '殿堂级' : score >= 80 ? '优秀级' : score >= 70 ? '良好级' : score >= 60 ? '及格级' : '不及格'}
        </span>
      )}
    </div>
  );
}
