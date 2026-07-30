import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowLeft, BarChart3, MapPin, Check } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import RadarChart from '../components/RadarChart';
import EmptyState from '../components/EmptyState';
import { useChocolate } from '../context/ChocolateContext';
import { GRADE_CONFIG } from '../types';
import { getNormalizedScores, getNormalizedScoresFloor, getNormalizedScoresZScore, COMPARE_COLORS, RADAR_DIMENSIONS } from '../utils/radar';

const MAX_COMPARE = COMPARE_COLORS.length;

export default function ComparePage() {
  const { reviews } = useChocolate();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [normalizeMode, setNormalizeMode] = useState<'linear' | 'floor' | 'zscore'>('linear');

  const filtered = useMemo(() => {
    if (!search.trim()) return reviews;
    const q = search.toLowerCase();
    return reviews.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.brand.toLowerCase().includes(q) ||
      r.origin.toLowerCase().includes(q)
    );
  }, [reviews, search]);

  const selectedReviews = useMemo(
    () => selectedIds.map(id => reviews.find(r => r.id === id)).filter(Boolean),
    [selectedIds, reviews]
  ) as typeof reviews;

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : prev.length >= MAX_COMPARE
          ? prev
          : [...prev, id]
    );
  };

  return (
    <AnimatedPage>
      <div className="page-container max-w-6xl">
        {/* 页头 */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold text-noir-50">风味雷达对比</h1>
            <p className="text-sm text-noir-400 mt-1">
              选择 {MAX_COMPARE} 款以内的巧克力进行 12 维风味对比
            </p>
          </div>
          {selectedIds.length > 0 && (
            <button
              onClick={() => setSelectedIds([])}
              className="btn-ghost text-sm text-noir-400 hover:text-noir-200"
            >
              清除全部
            </button>
          )}
        </div>

        {/* 已选卡片 */}
        {selectedReviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 mb-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 size={14} className="text-cocoa-400" />
              <span className="text-xs font-medium text-noir-400">
                已选 {selectedReviews.length}/{MAX_COMPARE} 款
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedReviews.map((r, i) => {
                const color = COMPARE_COLORS[i % COMPARE_COLORS.length];
                return (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
                    style={{
                      backgroundColor: `${color.stroke}18`,
                      borderColor: `${color.stroke}40`,
                      borderWidth: 1,
                      color: color.stroke,
                    }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color.stroke }} />
                    {r.name}
                    <button
                      onClick={() => toggleSelect(r.id)}
                      className="ml-0.5 hover:opacity-70"
                    >
                      <X size={12} />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-5 gap-6">
          {/* 左侧：选择列表 */}
          <div className="lg:col-span-2">
            <div className="glass-card p-3 mb-4">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-500" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="搜索巧克力..."
                  className="input-field pl-9 text-sm"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-noir-500 hover:text-noir-300">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
              {filtered.length === 0 ? (
                <div className="text-center py-8 text-noir-500 text-sm">没有匹配的巧克力</div>
              ) : (
                filtered.map((review) => {
                  const isSelected = selectedIds.includes(review.id);
                  const selIndex = selectedIds.indexOf(review.id);
                  const color = selIndex >= 0 ? COMPARE_COLORS[selIndex % COMPARE_COLORS.length] : null;

                  return (
                    <motion.button
                      key={review.id}
                      layout
                      onClick={() => toggleSelect(review.id)}
                      className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                        isSelected
                          ? 'bg-white/[0.06]'
                          : 'hover:bg-white/[0.03]'
                      }`}
                      style={isSelected && color ? {
                        borderColor: `${color.stroke}40`,
                        borderWidth: 1,
                      } : {
                        borderColor: 'transparent',
                        borderWidth: 1,
                      }}
                    >
                      {/* 选中指示器 */}
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                          isSelected ? '' : 'border border-noir-600'
                        }`}
                        style={{
                          backgroundColor: isSelected ? color?.stroke : 'transparent',
                        }}
                      >
                        {isSelected && <Check size={12} className="text-noir-950" strokeWidth={3} />}
                      </div>

                      {/* 信息 */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-noir-100 truncate">{review.name}</div>
                        <div className="flex items-center gap-1.5 text-[11px] text-noir-500 mt-0.5">
                          <MapPin size={10} />
                          {review.origin || '未知'} · {review.totalScore}分
                        </div>
                      </div>

                      {/* 等级标签 */}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                        GRADE_CONFIG[review.grade].bgColor
                      } ${GRADE_CONFIG[review.grade].color}`}>
                        {GRADE_CONFIG[review.grade].label}
                      </span>
                    </motion.button>
                  );
                })
              )}
            </div>
          </div>

          {/* 右侧：雷达图 */}
          <div className="lg:col-span-3">
            {selectedReviews.length === 0 ? (
              <div className="glass-card h-full min-h-[400px] flex items-center justify-center">
                <EmptyState
                  icon={<BarChart3 size={48} />}
                  title="选择巧克力开始对比"
                  description="从左侧列表中选择 2~6 款巧克力，它们的 12 维风味雷达图将叠加显示，方便直观比较"
                />
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-6 overflow-visible"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-sm font-semibold text-noir-200">12 维风味雷达图</h3>
                  <div className="flex items-center gap-1 bg-noir-800/50 rounded-lg p-0.5">
                    <button onClick={() => setNormalizeMode('linear')} className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all duration-200 ${normalizeMode === 'linear' ? 'bg-gold-500/20 text-gold-300' : 'text-noir-500 hover:text-noir-300'}`}>原始</button>
                    <button onClick={() => setNormalizeMode('floor')} className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all duration-200 ${normalizeMode === 'floor' ? 'bg-gold-500/20 text-gold-300' : 'text-noir-500 hover:text-noir-300'}`}>基准线</button>
                    <button onClick={() => setNormalizeMode('zscore')} className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all duration-200 ${normalizeMode === 'zscore' ? 'bg-gold-500/20 text-gold-300' : 'text-noir-500 hover:text-noir-300'}`}>Z-Score</button>
                  </div>
                </div>
                <div className="flex justify-center overflow-visible" key={normalizeMode}>
                <RadarChart
                  datasets={[
                    ...selectedReviews.map((r, i) => ({
                      name: r.name,
                      values: normalizeMode === 'floor'
                        ? getNormalizedScoresFloor(r)
                        : normalizeMode === 'zscore'
                          ? getNormalizedScoresZScore(r, reviews)
                          : getNormalizedScores(r),
                    })),
                    ...(normalizeMode === 'zscore'
                      ? [{ name: '平均基准', values: Array(12).fill(50), baseline: true }]
                      : []),
                  ]}
                  size={380}
                />
                </div>

                {/* 对比表格 */}
                {selectedReviews.length >= 2 && (
                  <div className="mt-6 overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-white/[0.06]">
                          <th className="text-left py-2 pr-4 text-noir-500 font-medium">维度</th>
                          {selectedReviews.map((r, i) => {
                            const color = COMPARE_COLORS[i % COMPARE_COLORS.length];
                            return (
                              <th key={r.id} className="text-center py-2 px-2 font-medium" style={{ color: color.stroke }}>
                                {r.name}
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {RADAR_DIMENSIONS.map((dim) => {
                          const categoryColors: Record<string, string> = {
                            appearance: '#CD9575',
                            aroma: '#F5C842',
                            flavor: '#E88078',
                            aftertaste: '#C8A8D0',
                          };
                          return (
                            <tr key={dim.key} className="border-b border-white/[0.03]">
                              <td className="py-2 pr-4 text-noir-400" style={{ color: categoryColors[dim.category] }}>
                                {dim.label}
                              </td>
                              {selectedReviews.map((r, i) => {
                                const cat = r[dim.category] as unknown as Record<string, number>;
                                const raw = cat[dim.key];
                                const pct = Math.round((raw / dim.max) * 100);
                                const color = COMPARE_COLORS[i % COMPARE_COLORS.length];
                                return (
                                  <td key={r.id} className="text-center py-2 px-2">
                                    <div className="flex items-center justify-center gap-1">
                                      <span className="font-medium text-noir-200">{raw}</span>
                                      <span className="text-noir-600">/{dim.max}</span>
                                    </div>
                                    {/* 迷你进度条 */}
                                    <div className="mt-1 h-1 rounded-full bg-noir-800 overflow-hidden max-w-[60px] mx-auto">
                                      <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{ width: `${pct}%`, backgroundColor: color.stroke }}
                                      />
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
