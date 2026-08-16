import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe2, MapPin, Sprout, Leaf, ChevronRight } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import Globe from '../components/Globe';
import { useChocolate } from '../context/ChocolateContext';
import { buildFootprint, Footprint } from '../utils/globe';
import { useNavigate } from 'react-router-dom';

export default function GlobePage() {
  const navigate = useNavigate();
  const { reviews } = useChocolate();
  const [hovered, setHovered] = useState<Footprint | null>(null);
  const [hoveredRank, setHoveredRank] = useState<string | null>(null);

  const footprints = useMemo(() => buildFootprint(reviews), [reviews]);

  const totalCountries = footprints.length;
  const cocoaCountries = footprints.filter(f => f.kinds.has('cocoa')).length;
  const flavorCountries = footprints.filter(f => f.kinds.has('flavor')).length;

  return (
    <AnimatedPage>
      <div className="page-container max-w-7xl">
        {/* 页头 */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-noir-50 flex items-center gap-3">
              <span className="p-2 rounded-xl bg-gold-500/10 text-gold-400">
                <Globe2 size={22} />
              </span>
              巧克力足迹
            </h1>
            <p className="text-sm text-noir-400 mt-2">
              每一块巧克力，都是一次舌尖上的环球旅行。拖动旋转 · 滚轮缩放
            </p>
            {/* 图例 */}
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-noir-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#34D399', boxShadow: '0 0 8px rgba(52,211,153,0.7)' }} />
                可可产地
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-noir-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#C49B6C', boxShadow: '0 0 8px rgba(196,155,108,0.7)' }} />
                增味产地
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-noir-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#E8B93A', boxShadow: '0 0 8px rgba(232,185,58,0.7)' }} />
                二者兼有
              </span>
            </div>
          </div>

          {/* 统计徽章 */}
          <div className="flex items-center gap-3">
            <div className="glass-card px-4 py-2.5 flex items-center gap-2.5">
              <MapPin size={15} className="text-gold-400" />
              <div>
                <p className="font-display text-lg font-bold text-noir-50 leading-none">{totalCountries}</p>
                <p className="text-[10px] text-noir-500 mt-0.5 tracking-wide">踏足国家</p>
              </div>
            </div>
            <div className="glass-card px-4 py-2.5 flex items-center gap-2.5">
              <Sprout size={15} className="text-emerald-400" />
              <div>
                <p className="font-display text-lg font-bold text-noir-50 leading-none">{cocoaCountries}</p>
                <p className="text-[10px] text-noir-500 mt-0.5 tracking-wide">可可产地</p>
              </div>
            </div>
            <div className="glass-card px-4 py-2.5 flex items-center gap-2.5">
              <Leaf size={15} className="text-cocoa-300" />
              <div>
                <p className="font-display text-lg font-bold text-noir-50 leading-none">{flavorCountries}</p>
                <p className="text-[10px] text-noir-500 mt-0.5 tracking-wide">增味产地</p>
              </div>
            </div>
          </div>
        </div>

        {/* 主体 */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* 地球 */}
          <div className="lg:col-span-2 relative glass-card overflow-hidden min-h-[480px] md:min-h-[600px]">
            <Globe footprints={footprints} onHover={setHovered} />

            {/* 悬停信息卡片 */}
            <AnimatePresence>
              {hovered && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm glass-card p-4 pointer-events-none"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-mono font-semibold bg-noir-800 text-gold-300 px-1.5 py-0.5 rounded">
                      {hovered.code}
                    </span>
                    <span className="font-display font-semibold text-noir-100">
                      {hovered.info.zhName || hovered.info.atlasName || hovered.code}
                    </span>
                    <span className="text-xs text-noir-500 ml-auto">{hovered.count} 次</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {hovered.kinds.has('cocoa') && (
                      <span className="tag tag-default text-[10px]"><Sprout size={10} /> 可可</span>
                    )}
                    {hovered.kinds.has('flavor') && (
                      <span className="tag tag-default text-[10px]"><Leaf size={10} /> 增味</span>
                    )}
                  </div>
                  <p className="text-xs text-noir-400 line-clamp-2">
                    {hovered.names.slice(0, 3).join(' · ')}
                    {hovered.names.length > 3 && ` 等 ${hovered.names.length} 款`}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 空状态提示 */}
            {footprints.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-3xl mb-3">🌍</p>
                <p className="font-display text-noir-200 mb-1">你的巧克力之旅尚未开始</p>
                <p className="text-xs text-noir-500">记录第一块巧克力，点亮你的足迹</p>
              </div>
            )}
          </div>

          {/* 足迹榜单 */}
          <div className="glass-card p-5 flex flex-col">
            <h3 className="font-display text-sm font-semibold text-noir-200 mb-4 flex items-center gap-2">
              <MapPin size={14} className="text-gold-400" />
              足迹榜单
            </h3>
            {footprints.length > 0 ? (
              <div className="space-y-1.5 overflow-y-auto custom-scrollbar pr-1 max-h-[560px]">
                {footprints.map((fp, i) => (
                  <div
                    key={fp.code}
                    onMouseEnter={() => setHoveredRank(fp.code)}
                    onMouseLeave={() => setHoveredRank(null)}
                  >
                    <motion.button
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.3 }}
                      onClick={() => navigate('/collection')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-200 text-left group ${
                        hoveredRank === fp.code
                          ? 'bg-gold-500/10 rounded-b-none'
                          : 'hover:bg-white/[0.04]'
                      }`}
                    >
                      <span className={`font-display text-sm w-6 ${
                        i < 3 ? 'text-gold-400 font-bold' : 'text-noir-500'
                      }`}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] font-mono font-semibold bg-noir-800 text-noir-300 px-1.5 py-0.5 rounded">
                        {fp.code}
                      </span>
                      <span className="text-sm text-noir-300 flex-1 truncate group-hover:text-noir-100 transition-colors">
                        {fp.info.zhName || fp.info.atlasName || fp.code}
                      </span>
                      <span className="flex gap-1.5">
                        {fp.kinds.has('cocoa') && <Sprout size={12} className="text-emerald-400/70" />}
                        {fp.kinds.has('flavor') && <Leaf size={12} className="text-cocoa-300/70" />}
                      </span>
                      <span className="text-xs text-noir-500 w-8 text-right">{fp.count}</span>
                      <motion.span
                        animate={{ rotate: hoveredRank === fp.code ? 90 : 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <ChevronRight size={13} className="text-noir-600 group-hover:text-gold-400 transition-colors" />
                      </motion.span>
                    </motion.button>

                    {/* 悬停展开的巧克力列表 */}
                    <AnimatePresence initial={false}>
                      {hoveredRank === fp.code && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="mx-3 px-3 pb-3 pt-2 bg-gold-500/[0.06] rounded-b-xl border-x border-b border-gold-500/10">
                            {fp.names.map((name) => (
                              <div
                                key={name}
                                className="flex items-center gap-2 py-1.5 text-xs text-noir-400 border-b border-white/[0.04] last:border-0"
                              >
                                <span className="w-1 h-1 rounded-full bg-gold-400/60 flex-shrink-0" />
                                <span className="truncate hover:text-gold-300 transition-colors cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const review = reviews.find(r => r.name === name);
                                    if (review) navigate(`/detail/${review.id}`);
                                  }}
                                >
                                  {name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-noir-500 py-10 text-center">暂无足迹数据</p>
            )}
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
