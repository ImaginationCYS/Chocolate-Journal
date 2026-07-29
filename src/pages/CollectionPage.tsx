import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, Plus, ArrowUpDown, LayoutGrid, List } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import ChocolateCard from '../components/ChocolateCard';
import EmptyState from '../components/EmptyState';
import { useChocolate } from '../context/ChocolateContext';
import { GRADE_CONFIG, Grade } from '../types';

type SortKey = 'date' | 'score' | 'name' | 'price';

export default function CollectionPage() {
  const navigate = useNavigate();
  const { reviews, toggleFav } = useChocolate();

  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState<Grade | 'all'>('all');
  const [originFilter, setOriginFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('score');
  const [sortAsc, setSortAsc] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const origins = useMemo(() => {
    const set = new Set(reviews.map(r => r.origin).filter(Boolean));
    return Array.from(set);
  }, [reviews]);

  const filtered = useMemo(() => {
    let result = [...reviews];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.brand.toLowerCase().includes(q) ||
        r.origin.toLowerCase().includes(q) ||
        r.aroma.aromas.some(a => a.includes(q)) ||
        r.tags.some(t => t.includes(q))
      );
    }

    if (gradeFilter !== 'all') {
      result = result.filter(r => r.grade === gradeFilter);
    }

    if (originFilter) {
      result = result.filter(r => r.origin === originFilter);
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case 'date': cmp = new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime(); break;
        case 'score': cmp = b.totalScore - a.totalScore; break;
        case 'name': cmp = a.name.localeCompare(b.name); break;
        case 'price': cmp = b.price - a.price; break;
      }
      return sortAsc ? -cmp : cmp;
    });

    return result;
  }, [reviews, search, gradeFilter, originFilter, sortBy, sortAsc]);

  return (
    <AnimatedPage>
      <div className="page-container">
        {/* 页头 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-noir-50">巧克力收藏</h1>
            <p className="text-sm text-noir-400 mt-1">
              共 {reviews.length} 款 · 筛选出 {filtered.length} 款
            </p>
          </div>
          <button onClick={() => navigate('/add')} className="btn-gold flex items-center gap-2 self-start">
            <Plus size={16} />
            新品鉴
          </button>
        </div>

        {/* 搜索和过滤 */}
        <div className="glass-card p-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="搜索名称、品牌、产地或风味……"
                className="input-field pl-10"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-noir-500 hover:text-noir-300">
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-ghost flex items-center gap-1.5 ${showFilters ? 'text-gold-400' : ''}`}
            >
              <SlidersHorizontal size={16} />
              <span className="hidden sm:inline text-sm">筛选</span>
            </button>
            <button
              onClick={() => setSortAsc(!sortAsc)}
              className="btn-ghost p-2"
              title={sortAsc ? '升序' : '降序'}
            >
              <ArrowUpDown size={16} className={sortAsc ? 'rotate-180 transition-transform' : 'transition-transform'} />
            </button>
          </div>

          {/* 展开的过滤器 */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-white/[0.05] space-y-4">
                  {/* 等级过滤 */}
                  <div>
                    <p className="text-xs text-noir-500 mb-2">等级筛选</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setGradeFilter('all')}
                        className={`tag text-xs ${gradeFilter === 'all' ? 'tag-selected' : 'tag-default'}`}
                      >
                        全部
                      </button>
                      {(Object.entries(GRADE_CONFIG) as [Grade, typeof GRADE_CONFIG['legendary']][]).map(([grade, config]) => (
                        <button
                          key={grade}
                          onClick={() => setGradeFilter(grade)}
                          className={`tag text-xs ${gradeFilter === grade ? 'tag-selected' : 'tag-default'}`}
                        >
                          {config.label} ({config.range})
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 排序 */}
                  <div>
                    <p className="text-xs text-noir-500 mb-2">排序方式</p>
                    <div className="flex flex-wrap gap-2">
                      {([
                        { key: 'date' as const, label: '日期' },
                        { key: 'score' as const, label: '评分' },
                        { key: 'name' as const, label: '名称' },
                        { key: 'price' as const, label: '价格' },
                      ]).map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => setSortBy(key)}
                          className={`tag text-xs ${sortBy === key ? 'tag-selected' : 'tag-default'}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 产地过滤 */}
                  {origins.length > 0 && (
                    <div>
                      <p className="text-xs text-noir-500 mb-2">产地筛选</p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setOriginFilter('')}
                          className={`tag text-xs ${!originFilter ? 'tag-selected' : 'tag-default'}`}
                        >
                          全部
                        </button>
                        {origins.map(o => (
                          <button
                            key={o}
                            onClick={() => setOriginFilter(o)}
                            className={`tag text-xs ${originFilter === o ? 'tag-selected' : 'tag-default'}`}
                          >
                            {o}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 列表 */}
        {filtered.length === 0 ? (
          <EmptyState
            icon="🔍"
            title={reviews.length === 0 ? "还没有收藏" : "没有匹配的结果"}
            description={reviews.length === 0
              ? "开始你的第一次巧克力品鉴，记录每一块的独特风味"
              : "试试调整筛选条件或搜索关键词"
            }
            action={
              reviews.length === 0 ? (
                <button onClick={() => navigate('/add')} className="btn-gold flex items-center gap-2">
                  <Plus size={16} />
                  开始品鉴
                </button>
              ) : (
                <button onClick={() => { setSearch(''); setGradeFilter('all'); setOriginFilter(''); }} className="btn-outline">
                  清除筛选
                </button>
              )
            }
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((review, i) => (
              <ChocolateCard
                key={review.id}
                review={review}
                index={i}
                onToggleFavorite={toggleFav}
              />
            ))}
          </div>
        )}
      </div>
    </AnimatedPage>
  );
}
