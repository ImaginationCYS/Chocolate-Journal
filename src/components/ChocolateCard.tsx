import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Calendar } from 'lucide-react';
import { ChocolateReview } from '../types';
import ScoreCircle from './ScoreCircle';
import { formatDate, formatPrice, getOriginFlag } from '../utils/helpers';

interface ChocolateCardProps {
  review: ChocolateReview;
  index: number;
  onToggleFavorite: (id: string) => void;
}

export default function ChocolateCard({ review, index, onToggleFavorite }: ChocolateCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -4 }}
      onClick={() => navigate(`/detail/${review.id}`)}
      className="glass-card-hover p-5 cursor-pointer group relative overflow-hidden"
    >
      {/* 背景装饰 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-gold-500/[0.03] to-transparent rounded-bl-full pointer-events-none" />

      {/* 头部信息 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg font-semibold text-noir-50 truncate group-hover:text-gold-300 transition-colors duration-300">
            {review.name}
          </h3>
          <p className="text-sm text-noir-400 mt-0.5">{review.brand}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(review.id); }}
          className={`p-1.5 rounded-lg transition-all duration-300 ${
            review.isFavorite
              ? 'text-rose-400 bg-rose-500/10'
              : 'text-noir-500 hover:text-rose-400 hover:bg-rose-500/5'
          }`}
        >
          <Heart size={16} fill={review.isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* 关键指标 */}
      <div className="flex items-center gap-3 mb-4 text-xs text-noir-400">
        <span className="inline-flex items-center gap-1">
          <MapPin size={12} />
          {getOriginFlag(review.origin)} {review.origin || '未知产地'}
        </span>
        {review.cocoaPercentage != null && (
          <>
            <span className="text-noir-600">·</span>
            <span>{review.cocoaPercentage}% 可可</span>
          </>
        )}
        {review.purchaseDate && (
          <>
            <span className="text-noir-600">·</span>
            <span className="inline-flex items-center gap-1">
              <Calendar size={12} />
              {formatDate(review.purchaseDate)}
            </span>
          </>
        )}
      </div>

      {/* 风味标签 */}
      {review.aroma?.aromas?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {review.aroma.aromas.slice(0, 4).map((a) => (
            <span key={a} className="tag tag-default text-[11px]">{a}</span>
          ))}
          {review.aroma.aromas.length > 4 && (
            <span className="tag tag-default text-[11px]">+{review.aroma.aromas.length - 4}</span>
          )}
        </div>
      )}

      {/* 底部分数 */}
      <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
        <div className="flex items-center gap-3">
          <ScoreCircle score={review.totalScore} size="sm" animate={false} />
          <div className="flex gap-3 text-xs text-noir-400">
            {review.appearance?.gloss != null && (
              <div className="flex flex-col">
                <span className="text-noir-500">外观</span>
                <span className="font-medium text-noir-300">{review.appearance.gloss + review.appearance.snap + review.appearance.texture}/20</span>
              </div>
            )}
            {review.aroma?.purity != null && (
              <div className="flex flex-col">
                <span className="text-noir-500">香气</span>
                <span className="font-medium text-noir-300">{review.aroma.purity + review.aroma.intensity + review.aroma.complexity}/20</span>
              </div>
            )}
            {review.flavor?.balance != null && (
              <div className="flex flex-col">
                <span className="text-noir-500">风味</span>
                <span className="font-medium text-noir-300">{review.flavor.balance + review.flavor.clarity + review.flavor.tannin}/45</span>
              </div>
            )}
          </div>
        </div>
        {review.price != null && <div className="text-xs text-noir-500">{formatPrice(review.price)}</div>}
      </div>
    </motion.div>
  );
}
