import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, Star, Library, ArrowRight, Sparkles } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import ScoreCircle from '../components/ScoreCircle';
import ChocolateCard from '../components/ChocolateCard';
import EmptyState from '../components/EmptyState';
import { useChocolate } from '../context/ChocolateContext';
import { GRADE_CONFIG, Grade } from '../types';

const gradeIcons: Record<Grade, string> = {
  legendary: '👑',
  excellent: '⭐',
  good: '👍',
  passable: '👌',
  fail: '👎',
};

export default function HomePage() {
  const navigate = useNavigate();
  const { reviews, stats, toggleFav } = useChocolate();

  const recentReviews = reviews.slice(0, 4);
  const topReview = reviews.length > 0 ? reviews.reduce((a, b) => a.totalScore > b.totalScore ? a : b) : null;

  return (
    <AnimatedPage>
      <div className="page-container">
        {/* Hero 区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative overflow-hidden glass-card p-8 md:p-12 mb-8"
        >
          {/* 装饰背景 */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-gold-500/[0.06] to-transparent rounded-bl-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-amber-500/[0.04] to-transparent rounded-tr-full pointer-events-none" />

          <div className="relative">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-300 text-xs font-medium mb-4"
            >
              <Sparkles size={12} />
              精品巧克力品鉴日志
            </motion.div>

            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-noir-50 mb-6" style={{ lineHeight: 1.5 }}>
              好的巧克力，<br />
              <motion.span
                style={{ color: '#CD9575', display: 'inline-block' }}
                whileHover={{ scale: 1.06, filter: 'brightness(1.3) drop-shadow(0 0 8px rgba(205,149,117,0.4))' }}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              >苦是骨架，</motion.span>
              <motion.span
                style={{ color: '#F5C842', display: 'inline-block' }}
                whileHover={{ scale: 1.06, filter: 'brightness(1.3) drop-shadow(0 0 8px rgba(245,200,66,0.4))' }}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              >酸是灵魂，</motion.span><br />
              <motion.span
                style={{ color: '#E88078', display: 'inline-block' }}
                whileHover={{ scale: 1.06, filter: 'brightness(1.3) drop-shadow(0 0 8px rgba(232,128,120,0.4))' }}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              >甜是血肉，</motion.span>
              <motion.span
                style={{ color: '#C8A8D0', display: 'inline-block' }}
                whileHover={{ scale: 1.06, filter: 'brightness(1.3) drop-shadow(0 0 8px rgba(200,168,208,0.4))' }}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              >余韵才是品格。</motion.span>
            </h1>
            <p className="text-noir-400 max-w-2xl mb-8 text-base md:text-lg" style={{ lineHeight: 1.8 }}>
              用专业的五感品鉴法，记录每一块精品巧克力的风土、工艺与故事。<br />
              比葡萄酒更复杂，比咖啡更细腻——欢迎踏入这个精致的感官世界。
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => navigate('/add')} className="btn-gold flex items-center gap-2">
                <Plus size={18} />
                开始品鉴
              </button>
              <button onClick={() => navigate('/collection')} className="btn-outline flex items-center gap-2">
                <Library size={16} />
                查看收藏
              </button>
            </div>
          </div>
        </motion.div>

        {reviews.length === 0 ? (
          /* 空状态 */
          <EmptyState
            icon="🍫"
            title="还没有品鉴记录"
            description="开始你的第一次巧克力品鉴之旅吧！按照专业的五感品鉴法，记录下你对每一块巧克力的感受与评分。"
            action={
              <button onClick={() => navigate('/add')} className="btn-gold flex items-center gap-2">
                <Plus size={16} />
                首次品鉴
              </button>
            }
          />
        ) : (
          <>
            {/* 统计概览卡片 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
              <StatCard
                icon={<Library size={18} />}
                label="品鉴总数"
                value={stats.total}
                suffix="款"
                delay={0.25}
              />
              <StatCard
                icon={<TrendingUp size={18} />}
                label="平均得分"
                value={stats.average.toFixed(1)}
                suffix="分"
                delay={0.3}
              />
              <StatCard
                icon={<Star size={18} />}
                label="最高得分"
                value={stats.highest}
                suffix="分"
                delay={0.35}
                highlight
              />
              <StatCard
                icon={<span className="text-base">❤️</span>}
                label="收藏夹"
                value={stats.favorites}
                suffix="款"
                delay={0.4}
              />
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* 最近品鉴 */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display text-xl font-semibold text-noir-100">最近品鉴</h2>
                  <button
                    onClick={() => navigate('/collection')}
                    className="flex items-center gap-1 text-sm text-noir-400 hover:text-gold-300 transition-colors"
                  >
                    查看全部 <ArrowRight size={14} />
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {recentReviews.map((review, i) => (
                    <ChocolateCard
                      key={review.id}
                      review={review}
                      index={i}
                      onToggleFavorite={toggleFav}
                    />
                  ))}
                </div>
              </div>

              {/* 侧边栏 */}
              <div className="space-y-6">
                {/* 王者之选 */}
                {topReview && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="glass-card p-6 text-center"
                  >
                    <div className="text-3xl mb-2">👑</div>
                    <p className="text-xs text-noir-500 mb-1">最高评分</p>
                    <p className="font-display font-semibold text-noir-100 mb-3 truncate">{topReview.name}</p>
                    <ScoreCircle score={topReview.totalScore} size="lg" showLabel />
                    <p className="text-xs text-noir-400 mt-3">{topReview.brand} · {topReview.origin}</p>
                  </motion.div>
                )}

                {/* 等级分布 */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="glass-card p-5"
                >
                  <h3 className="font-display text-sm font-semibold text-noir-200 mb-4">等级分布</h3>
                  <div className="space-y-2">
                    {(Object.entries(GRADE_CONFIG) as [Grade, typeof GRADE_CONFIG['legendary']][]).map(([grade, config]) => {
                      const count = stats.byGrade[grade] || 0;
                      const maxCount = Math.max(...Object.values(stats.byGrade), 1);
                      const barWidth = (count / maxCount) * 100;
                      return (
                        <div key={grade} className="flex items-center gap-2 text-xs">
                          <span className="w-5">{gradeIcons[grade]}</span>
                          <span className={`w-14 ${config.color} font-medium`}>{config.label}</span>
                          <div className="flex-1 h-1.5 rounded-full bg-noir-800 overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${config.bgColor.replace('/10', '')}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${barWidth}%` }}
                              transition={{ duration: 0.8, delay: 0.6 }}
                            />
                          </div>
                          <span className="w-6 text-right text-noir-400">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </div>
    </AnimatedPage>
  );
}

function StatCard({ icon, label, value, suffix, delay, highlight }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  suffix: string;
  delay: number;
  highlight?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`glass-card p-4 ${highlight ? 'border-gold-500/20' : ''}`}
    >
      <div className={`flex items-center gap-2 mb-2 ${highlight ? 'text-gold-400' : 'text-noir-400'}`}>
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <motion.span
          className={`font-display text-2xl font-bold ${highlight ? 'text-gold-300' : 'text-noir-100'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: delay + 0.2 }}
        >
          {value}
        </motion.span>
        <span className="text-xs text-noir-500">{suffix}</span>
      </div>
    </motion.div>
  );
}
