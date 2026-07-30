import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, Star, PieChart, Target,
  MapPin, Award, Sparkles, Plus
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart as RPieChart, Pie, Cell,
  AreaChart, Area,
} from 'recharts';
import AnimatedPage from '../components/AnimatedPage';
import RadarChart from '../components/RadarChart';
import { getNormalizedScores, getNormalizedScoresFloor, getNormalizedScoresZScore } from '../utils/radar';
import EmptyState from '../components/EmptyState';
import { useChocolate } from '../context/ChocolateContext';
import { GRADE_CONFIG, Grade } from '../types';

const COLORS = {
  legendary: '#E8B93A',
  excellent: '#34D399',
  good: '#38BDF8',
  passable: '#FBBF24',
  fail: '#F87171',
};

const GRADE_LABELS: Record<Grade, string> = {
  legendary: '殿堂级',
  excellent: '精品级',
  good: '优选级',
  passable: '商业级',
  fail: '基础级',
};

export default function StatsPage() {
  const navigate = useNavigate();
  const { reviews, stats } = useChocolate();
  const [normalizeMode, setNormalizeMode] = useState<'linear' | 'floor' | 'zscore'>('linear');

  // 评分分布数据
  const scoreDistribution = useMemo(() => {
    const buckets = [
      { range: '<60', min: 0, max: 59 },
      { range: '60-69', min: 60, max: 69 },
      { range: '70-79', min: 70, max: 79 },
      { range: '80-89', min: 80, max: 89 },
      { range: '90-100', min: 90, max: 100 },
    ];
    return buckets.map(b => ({
      name: b.range,
      count: reviews.filter(r => r.totalScore >= b.min && r.totalScore <= b.max).length,
    }));
  }, [reviews]);

  // 等级分布饼图
  const gradeDistribution = useMemo(() => {
    return (Object.keys(GRADE_CONFIG) as Grade[]).map(grade => ({
      name: GRADE_LABELS[grade],
      value: stats.byGrade[grade] || 0,
      color: COLORS[grade],
    }));
  }, [stats.byGrade]);

  // 12 维雷达图数据 - 所有记录的平均归一化得分
  const avgRadarData = useMemo(() => {
    if (reviews.length === 0) return null;
    const n = reviews.length;
    const normalizeFn =
      normalizeMode === 'floor' ? getNormalizedScoresFloor
      : normalizeMode === 'zscore' ? (r: typeof reviews[0]) => getNormalizedScoresZScore(r, reviews)
      : getNormalizedScores;
    const sums = Array(12).fill(0);
    reviews.forEach(r => {
      const scores = normalizeFn(r);
      scores.forEach((v, i) => { sums[i] += v; });
    });
    return { name: `平均 (${n}款)`, values: sums.map(s => Math.round(s / n)) };
  }, [reviews, normalizeMode]);

  // 产地统计
  const originStats = useMemo(() => {
    return Object.entries(stats.byOrigin)
      .map(([origin, count]) => ({ origin, count }))
      .sort((a, b) => b.count - a.count);
  }, [stats.byOrigin]);

  // 随时间品鉴数量
  const timelineData = useMemo(() => {
    const byMonth: Record<string, number> = {};
    reviews.forEach(r => {
      const month = r.purchaseDate.substring(0, 7);
      byMonth[month] = (byMonth[month] || 0) + 1;
    });
    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ name: month, count }));
  }, [reviews]);

  // 平均可可含量
  const avgCocoa = useMemo(() => {
    if (reviews.length === 0) return 0;
    return Math.round(reviews.reduce((s, r) => s + r.cocoaPercentage, 0) / reviews.length);
  }, [reviews]);

  // 最常出现的风味
  const topAromas = useMemo(() => {
    const count: Record<string, number> = {};
    reviews.forEach(r => r.aroma.aromas.forEach(a => { count[a] = (count[a] || 0) + 1; }));
    return Object.entries(count).sort((a, b) => b[1] - a[1]);
  }, [reviews]);

  if (reviews.length === 0) {
    return (
      <AnimatedPage>
        <div className="page-container">
          <EmptyState
            icon="📊"
            title="还没有统计数据"
            description="品鉴一定数量的巧克力后，这里将展示丰富的统计分析"
            action={
              <button onClick={() => navigate('/add')} className="btn-gold flex items-center gap-2">
                <Plus size={16} />
                开始品鉴
              </button>
            }
          />
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className="page-container">
        <h1 className="font-display text-2xl font-bold text-noir-50 mb-2">统计分析</h1>
        <p className="text-sm text-noir-400 mb-8">基于 {stats.total} 款巧克力的品鉴数据</p>

        {/* 概览卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={BarChart3} label="品鉴总数" value={stats.total} suffix="款" delay={0.1} />
          <StatCard icon={TrendingUp} label="平均得分" value={stats.average.toFixed(1)} suffix="分" delay={0.15} />
          <StatCard icon={Star} label="最高得分" value={stats.highest} suffix="分" delay={0.2} />
          <StatCard icon={Target} label="平均可可" value={avgCocoa} suffix="%" delay={0.25} />
        </div>

        {/* 图表区域 */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* 评分分布柱状图 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-5"
          >
            <h3 className="font-display text-sm font-semibold text-noir-200 mb-4 flex items-center gap-2">
              <BarChart3 size={14} className="text-gold-400" />
              评分分布
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill: '#8F8277', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8F8277', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F1A17',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    color: '#F0E6DA',
                    fontSize: '12px',
                  }}
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                />
                <Bar dataKey="count" name="数量" radius={[6, 6, 0, 0]}>
                  {scoreDistribution.map((_, i) => (
                    <Cell
                      key={i}
                      fill={i === 4 ? COLORS.legendary : i === 3 ? COLORS.excellent : i === 2 ? COLORS.good : i === 1 ? COLORS.passable : COLORS.fail}
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* 12 维雷达图 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-5 md:col-span-2 overflow-visible"
            style={{ marginLeft: '-0.75rem', marginRight: '-0.75rem', paddingLeft: '1rem', paddingRight: '1rem' }}
          >
            <h3 className="font-display text-sm font-semibold text-noir-200 mb-4 flex items-center gap-2 px-3">
              <Target size={14} className="text-gold-400" />
              各维度平均表现
              {/* 归一化模式切换 */}
              <div className="ml-auto flex items-center gap-1 bg-noir-800/50 rounded-lg p-0.5">
                <button
                  onClick={() => setNormalizeMode('linear')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all duration-200 ${
                    normalizeMode === 'linear'
                      ? 'bg-gold-500/20 text-gold-300 shadow-sm'
                      : 'text-noir-500 hover:text-noir-300'
                  }`}
                >
                  原始
                </button>
                <button
                  onClick={() => setNormalizeMode('floor')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all duration-200 ${
                    normalizeMode === 'floor'
                      ? 'bg-gold-500/20 text-gold-300 shadow-sm'
                      : 'text-noir-500 hover:text-noir-300'
                  }`}
                >
                  基准线
                </button>
                <button
                  onClick={() => setNormalizeMode('zscore')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all duration-200 ${
                    normalizeMode === 'zscore'
                      ? 'bg-gold-500/20 text-gold-300 shadow-sm'
                      : 'text-noir-500 hover:text-noir-300'
                  }`}
                >
                  Z-Score
                </button>
              </div>
            </h3>
            {avgRadarData ? (
              <div className="flex justify-center overflow-visible" key={normalizeMode}>
                <RadarChart
                  datasets={normalizeMode === 'zscore'
                    ? [avgRadarData, { name: '平均基准', values: Array(12).fill(50), baseline: true }]
                    : [avgRadarData]
                  }
                  size={340}
                />
              </div>
            ) : (
              <p className="text-center text-noir-500 text-sm py-8">暂无数据</p>
            )}
          </motion.div>

          {/* 等级分布饼图 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-5"
          >
            <h3 className="font-display text-sm font-semibold text-noir-200 mb-4 flex items-center gap-2">
              <PieChart size={14} className="text-gold-400" />
              等级分布
            </h3>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={180}>
                <RPieChart>
                  <Pie
                    data={gradeDistribution.filter(g => g.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {gradeDistribution.filter(g => g.value > 0).map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F1A17',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px',
                      color: '#F0E6DA',
                      fontSize: '12px',
                    }}
                  />
                </RPieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {gradeDistribution.map(g => (
                  <div key={g.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: g.color }} />
                    <span className="text-noir-400">{g.name}</span>
                    <span className="text-noir-200 font-medium">{g.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* 品鉴时间线 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-5"
          >
            <h3 className="font-display text-sm font-semibold text-noir-200 mb-4 flex items-center gap-2">
              <TrendingUp size={14} className="text-gold-400" />
              品鉴时间线
            </h3>
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" tick={{ fill: '#8F8277', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#8F8277', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F1A17',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px',
                      color: '#F0E6DA',
                      fontSize: '12px',
                    }}
                  />
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E8B93A" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#E8B93A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="count" name="品鉴数" stroke="#E8B93A" fill="url(#colorCount)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-noir-500 py-8 text-center">数据不足</p>
            )}
          </motion.div>
        </div>

        {/* 底部统计 */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* 产地分布 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-5"
          >
            <h3 className="font-display text-sm font-semibold text-noir-200 mb-4 flex items-center gap-2">
              <MapPin size={14} className="text-gold-400" />
              产地分布 TOP 榜
            </h3>
            {originStats.length > 0 ? (
              <div className="space-y-3">
                {originStats.map(({ origin, count }, i) => (
                  <div key={origin} className="flex items-center gap-3">
                    <span className="text-xs text-noir-500 w-5">{i + 1}</span>
                    <span className="text-sm text-noir-300 flex-1">{origin}</span>
                    <div className="w-32 h-1.5 rounded-full bg-noir-800 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gold-500/60"
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / originStats[0].count) * 100}%` }}
                        transition={{ duration: 0.6, delay: 0.6 + i * 0.05 }}
                      />
                    </div>
                    <span className="text-xs text-noir-400 w-6 text-right">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-noir-500 py-8 text-center">数据不足</p>
            )}
          </motion.div>

          {/* 热门风味 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="glass-card p-5"
          >
            <h3 className="font-display text-sm font-semibold text-noir-200 mb-4 flex items-center gap-2">
              <Sparkles size={14} className="text-gold-400" />
              热门风味 TOP 榜
            </h3>
            {topAromas.length > 0 ? (
              <div className="space-y-3">
                {topAromas.map(([aroma, count], i) => (
                  <div key={aroma} className="flex items-center gap-3">
                    <span className={`text-xs w-5 ${
                      i < 3 ? 'text-gold-400 font-bold' : 'text-noir-500'
                    }`}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                    </span>
                    <span className="text-sm text-noir-300 flex-1">{aroma}</span>
                    <div className="w-32 h-1.5 rounded-full bg-noir-800 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-rose-500/50"
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / topAromas[0][1]) * 100}%` }}
                        transition={{ duration: 0.6, delay: 0.6 + i * 0.05 }}
                      />
                    </div>
                    <span className="text-xs text-noir-400 w-6 text-right">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-noir-500 py-8 text-center">数据不足</p>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatedPage>
  );
}

function StatCard({ icon: Icon, label, value, suffix, delay }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  suffix: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass-card p-4"
    >
      <div className="flex items-center gap-2 mb-2 text-noir-400">
        <Icon size={16} />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <motion.span
          className="font-display text-2xl font-bold text-noir-100"
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
