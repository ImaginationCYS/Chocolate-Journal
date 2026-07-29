import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Heart, Edit, Copy, Trash2, MapPin, Calendar, Tag,
  Eye, Wind, ChefHat, Sparkles, DollarSign, Award, Clock
} from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import ScoreCircle from '../components/ScoreCircle';
import ConfirmDialog from '../components/ConfirmDialog';
import { useChocolate } from '../context/ChocolateContext';
import { GRADE_CONFIG } from '../types';
import { formatDate, formatPrice, getOriginFlag } from '../utils/helpers';

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getReview, toggleFav, removeReview, duplicateExisting } = useChocolate();
  const [showDelete, setShowDelete] = useState(false);

  const review = getReview(id!);

  if (!review) {
    return (
      <AnimatedPage>
        <div className="page-container text-center py-20">
          <p className="text-4xl mb-4">🍫</p>
          <h2 className="font-display text-xl text-noir-200 mb-2">未找到记录</h2>
          <p className="text-noir-400 mb-6">该品鉴记录不存在或已被删除</p>
          <button onClick={() => navigate('/collection')} className="btn-outline">返回收藏</button>
        </div>
      </AnimatedPage>
    );
  }

  const handleDelete = () => {
    removeReview(review.id);
    navigate('/collection');
  };

  const handleDuplicate = () => {
    duplicateExisting(review.id);
  };

  const gradeConfig = GRADE_CONFIG[review.grade];

  const dimensionScores = [
    { label: '外观与质地', icon: Eye, score: review.appearance.gloss + review.appearance.snap + review.appearance.texture, max: 20, hex: '#CD9575' },
    { label: '香气复杂度', icon: Wind, score: review.aroma.purity + review.aroma.intensity + review.aroma.complexity, max: 20, hex: '#F5C842' },
    { label: '风味与平衡度', icon: ChefHat, score: review.flavor.balance + review.flavor.clarity + review.flavor.tannin, max: 45, hex: '#E88078' },
    { label: '余韵与愉悦感', icon: Heart, score: review.aftertaste.duration + review.aftertaste.quality + review.aftertaste.personal, max: 15, hex: '#C8A8D0' },
  ];

  return (
    <AnimatedPage>
      <div className="page-container max-w-4xl">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="btn-ghost flex items-center gap-1.5">
            <ArrowLeft size={16} />
            <span className="text-sm">返回</span>
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleFav(review.id)}
              className={`btn-ghost p-2 ${review.isFavorite ? 'text-rose-400' : ''}`}
              title={review.isFavorite ? '取消收藏' : '加入收藏'}
            >
              <Heart size={16} fill={review.isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button onClick={() => navigate(`/add?edit=${review.id}`)} className="btn-ghost p-2" title="编辑">
              <Edit size={16} />
            </button>
            <button onClick={handleDuplicate} className="btn-ghost p-2" title="创建副本">
              <Copy size={16} />
            </button>
            <button onClick={() => setShowDelete(true)} className="btn-ghost p-2 hover:text-red-400" title="删除">
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Hero卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden glass-card p-8 md:p-10 mb-8"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-gold-500/[0.04] to-transparent rounded-bl-full pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-center gap-8">
            {/* 分数 */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <ScoreCircle score={review.totalScore} size="lg" showLabel animate />
            </div>

            {/* 信息 */}
            <div className="flex-1 min-w-0">
              <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium mb-3 ${gradeConfig.bgColor} ${gradeConfig.color}`}>
                <Award size={12} />
                {gradeConfig.label} · {gradeConfig.range}分
              </div>

              <h1 className="font-display text-2xl md:text-3xl font-bold text-noir-50 mb-2">
                {review.name}
              </h1>
              <p className="text-noir-400 mb-4">{review.brand}</p>

              <div className="flex flex-wrap items-center gap-3 text-sm text-noir-400 mb-4">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={14} className="text-noir-500" />
                  {getOriginFlag(review.origin)} {review.origin || '未知'}
                </span>
                <span className="text-noir-600">·</span>
                <span>{review.cocoaPercentage}% 可可</span>
                {review.beanVariety && (
                  <>
                    <span className="text-noir-600">·</span>
                    <span>{review.beanVariety}</span>
                  </>
                )}
                <span className="text-noir-600">·</span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar size={14} className="text-noir-500" />
                  {formatDate(review.purchaseDate)}
                </span>
                {review.price > 0 && (
                  <>
                    <span className="text-noir-600">·</span>
                    <span className="inline-flex items-center gap-1.5">
                      <DollarSign size={14} className="text-noir-500" />
                      {formatPrice(review.price)}
                    </span>
                  </>
                )}
              </div>

              {/* 风味标签 */}
              {review.aroma.aromas.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {review.aroma.aromas.map(a => (
                    <span key={a} className="tag tag-selected text-xs">{a}</span>
                  ))}
                </div>
              )}

              {/* 自定义标签 */}
              {review.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {review.tags.map(t => (
                    <span key={t} className="tag tag-default text-xs">
                      <Tag size={10} />{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* 评分详情 */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {dimensionScores.map((dim, i) => (
            <motion.div
              key={dim.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="glass-card p-5"
              style={{
                background: `linear-gradient(135deg, ${dim.hex}22 0%, ${dim.hex}05 100%)`,
                borderColor: `${dim.hex}22`,
                borderWidth: 1,
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <dim.icon size={16} style={{ color: dim.hex }} />
                <h3 className="text-sm font-semibold" style={{ color: dim.hex }}>{dim.label}</h3>
              </div>
              <div className="flex items-end justify-between mb-2">
                <span className="font-display text-2xl font-bold" style={{ color: dim.hex }}>
                  {dim.score}
                </span>
                <span className="text-sm text-noir-500">/ {dim.max}</span>
              </div>
              <div className="h-2 rounded-full bg-noir-800 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: dim.hex }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(dim.score / dim.max) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.2 + 0.1 * i }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* 详细信息 */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* 外观详情 */}
          <DetailCard title="外观与质地" icon={Eye} hex="#CD9575">
            <DetailItem label="光泽度" value={`${review.appearance.gloss}/5`} sub={review.appearance.gloss >= 4 ? '明亮有光泽' : review.appearance.gloss >= 2 ? '有轻微白霜' : '严重白霜'} />
            <DetailItem label="断裂声" value={`${review.appearance.snap}/5`} sub={review.appearance.snap >= 4 ? '清脆利落' : '声音闷哑'} />
            <DetailItem label="融化质地" value={`${review.appearance.texture}/10`} sub={review.appearance.texture >= 8 ? '丝绒般顺滑' : review.appearance.texture >= 4 ? '略有砂砾感' : '蜡质感或粘稠'} />
            {review.appearance.notes && <DetailItem label="备注" value={review.appearance.notes} />}
          </DetailCard>

          {/* 香气详情 */}
          <DetailCard title="香气复杂度" icon={Wind} hex="#F5C842">
            <DetailItem label="纯净度" value={`${review.aroma.purity}/5`} sub="没有纸板味、霉味或化学异味" />
            <DetailItem label="强度" value={`${review.aroma.intensity}/5`} sub="香气是否浓郁奔放" />
            <DetailItem label="层次" value={`${review.aroma.complexity}/10`} sub="能否辨识出多种风味线索" />
            {review.aroma.dryAroma && <DetailItem label="干香" value={review.aroma.dryAroma} />}
            {review.aroma.wetAroma && <DetailItem label="湿香" value={review.aroma.wetAroma} />}
          </DetailCard>

          {/* 风味详情 */}
          <DetailCard title="风味与平衡度" icon={ChefHat} hex="#E88078">
            <DetailItem label="酸苦甜平衡" value={`${review.flavor.balance}/15`} sub="三者是否和谐共生" />
            <DetailItem label="风味清晰度" value={`${review.flavor.clarity}/20`} sub="入口、中段、余味的变化" />
            <DetailItem label="单宁涩感" value={`${review.flavor.tannin}/10`} sub="如红酒般的细腻收敛" />
            {review.flavor.topNote && <DetailItem label="前调" value={review.flavor.topNote} />}
            {review.flavor.middleNote && <DetailItem label="中调" value={review.flavor.middleNote} />}
            {review.flavor.baseNote && <DetailItem label="后调" value={review.flavor.baseNote} />}
          </DetailCard>

          {/* 余韵详情 */}
          <DetailCard title="余韵与愉悦感" icon={Heart} hex="#C8A8D0">
            <DetailItem label="余韵时长" value={`${review.aftertaste.duration}/5`} sub={review.aftertaste.duration >= 4 ? '风味停留15秒以上' : '余韵较短'} />
            <DetailItem label="余韵质量" value={`${review.aftertaste.quality}/5`} sub="回甘果香 vs 酸涩金属味" />
            <DetailItem label="个人共鸣" value={`${review.aftertaste.personal}/5`} sub="是否触动内心" />
            {review.aftertaste.notes && <DetailItem label="备注" value={review.aftertaste.notes} />}
          </DetailCard>
        </div>

        {/* 个人笔记 */}
        {review.personalNotes && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6 mt-6"
          >
            <h3 className="font-display text-sm font-semibold text-noir-200 mb-3 flex items-center gap-2">
              <Sparkles size={14} className="text-gold-400" />
              个人笔记
            </h3>
            <p className="text-sm text-noir-300 leading-relaxed whitespace-pre-wrap">{review.personalNotes}</p>
          </motion.div>
        )}

        {/* 元数据 */}
        <div className="mt-6 text-center text-xs text-noir-600">
          创建于 {formatDate(review.createdAt)} · 最后更新于 {formatDate(review.updatedAt)}
        </div>

        {/* 删除确认 */}
        <ConfirmDialog
          open={showDelete}
          title="删除品鉴记录"
          message={`确定要删除「${review.name}」吗？此操作不可撤销。`}
          confirmLabel="删除"
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      </div>
    </AnimatedPage>
  );
}

function DetailCard({ title, icon: Icon, hex, children }: {
  title: string;
  icon: React.ElementType;
  hex: string;
  children: React.ReactNode;
}) {

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5"
      style={{ borderColor: `${hex}22`, borderWidth: 1 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Icon size={16} style={{ color: hex }} />
        <h3 className="text-sm font-semibold" style={{ color: hex }}>{title}</h3>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </motion.div>
  );
}

function DetailItem({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs text-noir-500 flex-shrink-0">{label}</span>
      <div className="text-right">
        <span className="text-sm font-medium text-noir-200">{value}</span>
        {sub && <p className="text-[11px] text-noir-600 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
