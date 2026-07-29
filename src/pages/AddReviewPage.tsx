import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, Ear, Wind, Hand, ChefHat, Heart,
  ChevronRight, ChevronLeft, Save, Sparkles, AlertCircle,
  Check, Camera, Tag, Plus, X
} from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import ScoreInput from '../components/ScoreInput';
import { useChocolate } from '../context/ChocolateContext';
import {
  DraftReview, AppearanceScores, AromaScores, FlavorScores, AftertasteScores,
  DEFAULT_AROMAS, calculateTotalScore, getGrade, GRADE_CONFIG
} from '../types';

const STEPS = [
  { id: 'basic', icon: Tag, label: '基本信息' },
  { id: 'appearance', icon: Eye, label: '外观·质地' },
  { id: 'aroma', icon: Wind, label: '香气·复杂度' },
  { id: 'flavor', icon: ChefHat, label: '风味·平衡' },
  { id: 'aftertaste', icon: Heart, label: '余韵·共鸣' },
];

const defaultAppearance: AppearanceScores = { gloss: 0, snap: 0, texture: 0, notes: '' };
const defaultAroma: AromaScores = { purity: 0, intensity: 0, complexity: 0, dryAroma: '', wetAroma: '', aromas: [] };
const defaultFlavor: FlavorScores = { balance: 0, clarity: 0, tannin: 0, topNote: '', middleNote: '', baseNote: '' };
const defaultAftertaste: AftertasteScores = { duration: 0, quality: 0, personal: 0, notes: '' };

export default function AddReviewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditing = !!editId;

  const { addNewReview, editReview, getReview } = useChocolate();
  const existingReview = editId ? getReview(editId) : undefined;

  const [step, setStep] = useState(0);
  const [showReview, setShowReview] = useState(false);

  // 基本信息
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [origin, setOrigin] = useState('');
  const [cocoaPercentage, setCocoaPercentage] = useState(70);
  const [beanVariety, setBeanVariety] = useState('');
  const [price, setPrice] = useState(0);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [personalNotes, setPersonalNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [customAromaInput, setCustomAromaInput] = useState('');

  // 外观
  const [appearance, setAppearance] = useState<AppearanceScores>(defaultAppearance);
  // 香气
  const [aroma, setAroma] = useState<AromaScores>(defaultAroma);
  // 风味
  const [flavor, setFlavor] = useState<FlavorScores>(defaultFlavor);
  // 余韵
  const [aftertaste, setAftertaste] = useState<AftertasteScores>(defaultAftertaste);

  // 错误提示
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalScore = calculateTotalScore(appearance, aroma, flavor, aftertaste);
  const grade = getGrade(totalScore);

  const validateBasic = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = '请输入巧克力名称';
    if (!brand.trim()) errs.brand = '请输入品牌名称';
    if (!origin.trim()) errs.origin = '请输入产地';
    if (cocoaPercentage < 30 || cocoaPercentage > 100) errs.cocoa = '可可含量需在30%-100%之间';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 0 && !validateBasic()) return;
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      setShowReview(true);
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = () => {
    const draft: DraftReview = {
      name: name.trim(),
      brand: brand.trim(),
      origin: origin.trim(),
      cocoaPercentage,
      beanVariety: beanVariety.trim(),
      price,
      purchaseDate,
      appearance,
      aroma,
      flavor,
      aftertaste,
      personalNotes: personalNotes.trim(),
      tags,
      isFavorite,
    };
    if (isEditing) {
      const totalScore = calculateTotalScore(appearance, aroma, flavor, aftertaste);
      const grade = getGrade(totalScore);
      editReview(editId!, { ...draft, totalScore, grade });
    } else {
      addNewReview(draft);
    }
    navigate('/collection');
  };

  const addTag = (t: string) => {
    const trimmed = t.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput('');
  };

  const toggleAromaTag = (aroma: string) => {
    setAroma(prev => ({
      ...prev,
      aromas: prev.aromas.includes(aroma)
        ? prev.aromas.filter(a => a !== aroma)
        : [...prev.aromas, aroma],
    }));
  };

  const addCustomAroma = () => {
    const trimmed = customAromaInput.trim();
    if (trimmed && !aroma.aromas.includes(trimmed)) {
      setAroma(prev => ({ ...prev, aromas: [...prev.aromas, trimmed] }));
    }
    setCustomAromaInput('');
  };

  // 编辑模式：从已有记录回填数据
  useEffect(() => {
    if (existingReview) {
      setName(existingReview.name);
      setBrand(existingReview.brand);
      setOrigin(existingReview.origin);
      setCocoaPercentage(existingReview.cocoaPercentage);
      setBeanVariety(existingReview.beanVariety);
      setPrice(existingReview.price);
      setPurchaseDate(existingReview.purchaseDate);
      setPersonalNotes(existingReview.personalNotes);
      setTags(existingReview.tags);
      setIsFavorite(existingReview.isFavorite);
      setAppearance(existingReview.appearance);
      setAroma(existingReview.aroma);
      setFlavor(existingReview.flavor);
      setAftertaste(existingReview.aftertaste);
    }
  }, [editId]); // 仅在 editId 变化时回填

  const currentStep = STEPS[step];

  return (
    <AnimatedPage>
      <div className="page-container max-w-3xl">
        {/* 步骤指示器 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-display text-2xl font-bold text-noir-50">
              {isEditing ? '编辑品鉴记录' : '新品鉴记录'}
            </h1>
            {/* 实时分数预览 */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[11px] text-noir-500 uppercase tracking-wider">实时总分</p>
                <p className={`font-display text-2xl font-bold ${
                  totalScore >= 90 ? 'text-gold-400' :
                  totalScore >= 80 ? 'text-emerald-400' :
                  totalScore >= 70 ? 'text-sky-400' : 'text-noir-400'
                }`}>
                  {totalScore}
                  <span className="text-sm text-noir-600">/100</span>
                </p>
              </div>
              {totalScore > 0 && (
                <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${GRADE_CONFIG[grade].bgColor} ${GRADE_CONFIG[grade].color}`}>
                  {GRADE_CONFIG[grade].label}
                </span>
              )}
            </div>
          </div>

          {/* 步骤进度条 */}
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setStep(i)}
                className={`flex-1 h-1.5 rounded-full transition-all duration-500 cursor-pointer hover:opacity-80 ${
                  i < step ? 'bg-gold-500' :
                  i === step ? 'bg-gold-400 shadow-lg shadow-gold-500/30 scale-y-125' :
                  'bg-noir-800 hover:bg-noir-700'
                }`}
              />
            ))}
          </div>

          {/* 步骤标签 */}
          <div className="flex items-center justify-between mt-3 px-1">
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setStep(i)}
                className={`flex flex-col items-center gap-1 transition-all duration-300 cursor-pointer
                  hover:scale-105 active:scale-95
                  ${i === step
                    ? 'text-gold-400 scale-110'
                    : i < step
                      ? 'text-gold-500/60 hover:text-gold-400'
                      : 'text-noir-600 hover:text-noir-400'
                  }`}
              >
                <s.icon size={i === step ? 16 : 14} />
                <span className="text-xs font-medium hidden sm:block">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 表单内容 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="glass-card p-6 md:p-8"
          >
            {/* Step 0: 基本信息 */}
            {step === 0 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-gold-500/10 text-gold-400">
                    <Tag size={20} />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-semibold text-noir-100">基本信息</h2>
                    <p className="text-sm text-noir-500">记录这款巧克力的身份信息</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="input-label">巧克力名称 *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="例如：Chuao 70% 黑巧克力"
                      className={`input-field ${errors.name ? 'border-red-500/50' : ''}`}
                    />
                    {errors.name && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.name}</p>}
                  </div>

                  <div>
                    <label className="input-label">品牌 *</label>
                    <input
                      type="text"
                      value={brand}
                      onChange={e => setBrand(e.target.value)}
                      placeholder="例如：Amedei"
                      className={`input-field ${errors.brand ? 'border-red-500/50' : ''}`}
                    />
                    {errors.brand && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.brand}</p>}
                  </div>

                  <div>
                    <label className="input-label">产地 *</label>
                    <input
                      type="text"
                      value={origin}
                      onChange={e => setOrigin(e.target.value)}
                      placeholder="例如：委内瑞拉"
                      className={`input-field ${errors.origin ? 'border-red-500/50' : ''}`}
                    />
                    {errors.origin && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.origin}</p>}
                  </div>

                  <div>
                    <label className="input-label">可可含量 (%) *</label>
                    <input
                      type="number"
                      value={cocoaPercentage}
                      onChange={e => setCocoaPercentage(Number(e.target.value))}
                      min={30}
                      max={100}
                      className={`input-field ${errors.cocoa ? 'border-red-500/50' : ''}`}
                    />
                    {errors.cocoa && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.cocoa}</p>}
                  </div>

                  <div>
                    <label className="input-label">可可豆品种</label>
                    <input
                      type="text"
                      value={beanVariety}
                      onChange={e => setBeanVariety(e.target.value)}
                      placeholder="例如：Criollo、Trinitario"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="input-label">价格 (¥)</label>
                    <input
                      type="number"
                      value={price}
                      onChange={e => setPrice(Number(e.target.value))}
                      min={0}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="input-label">品鉴日期</label>
                    <input
                      type="date"
                      value={purchaseDate}
                      onChange={e => setPurchaseDate(e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* 标签 */}
                <div>
                  <label className="input-label">标签</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {tags.map(t => (
                      <span key={t} className="tag tag-selected">
                        {t}
                        <button onClick={() => setTags(tags.filter(x => x !== t))} className="hover:text-red-400">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag(tagInput))}
                      placeholder="输入标签后按回车"
                      className="input-field flex-1"
                    />
                    <button onClick={() => addTag(tagInput)} className="btn-outline px-3">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* 收藏 */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      isFavorite ? 'bg-rose-500/20 text-rose-400' : 'bg-noir-800 text-noir-500'
                    }`}
                  >
                    <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
                  </div>
                  <span className="text-sm text-noir-300">加入收藏夹</span>
                </label>
              </div>
            )}

            {/* Step 1: 外观与质地 */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                    <Eye size={20} />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-semibold text-noir-100">外观与质地</h2>
                    <p className="text-sm text-noir-500">满分 20 分：光泽度 5 + 断裂声 5 + 融化质地 10</p>
                  </div>
                </div>

                <ScoreInput
                  label="光泽度"
                  value={appearance.gloss}
                  max={5}
                  onChange={v => setAppearance({ ...appearance, gloss: v })}
                  description="明亮有光泽（5分）vs 暗淡或轻微白霜（2-4分）vs 严重白霜（0-1分）"
                  color="#CD9575"
                />
                <ScoreInput
                  label="断裂声"
                  value={appearance.snap}
                  max={5}
                  onChange={v => setAppearance({ ...appearance, snap: v })}
                  description="清脆利落（5分）vs 声音闷哑（2-3分）"
                  color="#CD9575"
                />
                <ScoreInput
                  label="融化质地"
                  value={appearance.texture}
                  max={10}
                  onChange={v => setAppearance({ ...appearance, texture: v })}
                  description="丝绒般顺滑无颗粒（8-10分）vs 略有砂砾感（4-7分）vs 蜡质感或粘稠（0-3分）"
                  color="#CD9575"
                />

                <div>
                  <label className="input-label">外观备注</label>
                  <textarea
                    value={appearance.notes}
                    onChange={e => setAppearance({ ...appearance, notes: e.target.value })}
                    placeholder="描述色泽、断裂面、融化感受等……"
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <p className="text-sm font-medium text-amber-300">外观得分：{appearance.gloss + appearance.snap + appearance.texture}/20</p>
                    <p className="text-sm text-noir-500 mt-0.5">优质黑巧呈深红褐色或琥珀色，光泽度极高说明调温完美</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: 香气复杂度 */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                    <Wind size={20} />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-semibold text-noir-100">香气复杂度</h2>
                    <p className="text-sm text-noir-500">满分 20 分：纯净度 5 + 强度 5 + 层次 10</p>
                  </div>
                </div>

                <ScoreInput
                  label="纯净度"
                  value={aroma.purity}
                  max={5}
                  onChange={v => setAroma({ ...aroma, purity: v })}
                  description="没有纸板味、霉味或化学异味"
                  color="#F5C842"
                />
                <ScoreInput
                  label="香气强度"
                  value={aroma.intensity}
                  max={5}
                  onChange={v => setAroma({ ...aroma, intensity: v })}
                  description="香气是否浓郁奔放？"
                  color="#F5C842"
                />
                <ScoreInput
                  label="层次丰富度"
                  value={aroma.complexity}
                  max={10}
                  onChange={v => setAroma({ ...aroma, complexity: v })}
                  description="至少2-3种明确风味线索得8-10分，单一可可味得4-6分"
                  color="#F5C842"
                />

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">干香描述</label>
                    <textarea
                      value={aroma.dryAroma}
                      onChange={e => setAroma({ ...aroma, dryAroma: e.target.value })}
                      placeholder="掰碎后闻其表面……"
                      rows={2}
                      className="input-field resize-none"
                    />
                  </div>
                  <div>
                    <label className="input-label">湿香描述</label>
                    <textarea
                      value={aroma.wetAroma}
                      onChange={e => setAroma({ ...aroma, wetAroma: e.target.value })}
                      placeholder="手心加热或哈气后的香气……"
                      rows={2}
                      className="input-field resize-none"
                    />
                  </div>
                </div>

                {/* 风味标签选择 */}
                <div>
                  <label className="input-label">选择风味线索（可多选，支持自定义）</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {DEFAULT_AROMAS.map(a => (
                      <button
                        key={a}
                        onClick={() => toggleAromaTag(a)}
                        className={`tag transition-all duration-200 ${
                          aroma.aromas.includes(a) ? 'tag-selected' : 'tag-default'
                        }`}
                      >
                        {aroma.aromas.includes(a) && <Check size={12} />}
                        {a}
                      </button>
                    ))}
                    {/* 自定义风味标签 */}
                    {aroma.aromas.filter(a => !DEFAULT_AROMAS.includes(a)).map(a => (
                      <button
                        key={a}
                        onClick={() => toggleAromaTag(a)}
                        className="tag tag-selected group"
                      >
                        <Check size={12} />
                        {a}
                        <X
                          size={12}
                          className="ml-0.5 opacity-60 group-hover:opacity-100 hover:text-red-400"
                          onClick={(e) => { e.stopPropagation(); toggleAromaTag(a); }}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customAromaInput}
                      onChange={e => setCustomAromaInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomAroma(); } }}
                      placeholder="输入自定义风味后按回车…"
                      className="input-field flex-1 text-sm"
                    />
                    <button onClick={addCustomAroma} className="btn-outline px-3 py-2.5 text-sm">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
                  <span className="text-2xl">👃</span>
                  <div>
                    <p className="text-sm font-medium text-purple-300">香气得分：{aroma.purity + aroma.intensity + aroma.complexity}/20</p>
                    <p className="text-sm text-noir-500 mt-0.5">寻找花果香（莓果、柑橘、玫瑰）、坚果香（杏仁、榛子）或木质香料调</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: 风味与平衡度 */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                    <ChefHat size={20} />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-semibold text-noir-100">风味与平衡度</h2>
                    <p className="text-sm text-noir-500">满分 45 分：酸苦甜平衡 15 + 风味清晰度 20 + 单宁涩感 10</p>
                  </div>
                </div>

                <ScoreInput
                  label="酸、苦、甜平衡"
                  value={flavor.balance}
                  max={15}
                  onChange={v => setFlavor({ ...flavor, balance: v })}
                  description="三者是否和谐？酸得刺牙、苦得发涩或甜得发腻各扣5-10分"
                  color="#E88078"
                />
                <ScoreInput
                  label="风味清晰度与层次"
                  value={flavor.clarity}
                  max={20}
                  onChange={v => setFlavor({ ...flavor, clarity: v })}
                  description="入口、中段、余味是否有变化？2种以上风味得15-20分"
                  color="#E88078"
                />
                <ScoreInput
                  label="单宁涩感"
                  value={flavor.tannin}
                  max={10}
                  onChange={v => setFlavor({ ...flavor, tannin: v })}
                  description="像优质红酒般细腻收敛（8-10分）vs 粗糙刮舌（0-4分）"
                  color="#E88078"
                />

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="input-label">前调（爆发）</label>
                    <input
                      type="text"
                      value={flavor.topNote}
                      onChange={e => setFlavor({ ...flavor, topNote: e.target.value })}
                      placeholder="刚入口的感受……"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="input-label">中调（层次）</label>
                    <input
                      type="text"
                      value={flavor.middleNote}
                      onChange={e => setFlavor({ ...flavor, middleNote: e.target.value })}
                      placeholder="融化中的风味……"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="input-label">后调（余味）</label>
                    <input
                      type="text"
                      value={flavor.baseNote}
                      onChange={e => setFlavor({ ...flavor, baseNote: e.target.value })}
                      placeholder="咽下后的余味……"
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
                  <span className="text-2xl">👅</span>
                  <div>
                    <p className="text-sm font-medium text-rose-300">风味得分：{flavor.balance + flavor.clarity + flavor.tannin}/45</p>
                    <p className="text-sm text-noir-500 mt-0.5">风味是品鉴的核心，占总分比重最大的维度（45%）</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: 余韵与主观愉悦感 */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400">
                    <Heart size={20} />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-semibold text-noir-100">余韵与主观愉悦感</h2>
                    <p className="text-sm text-noir-500">满分 15 分：时长 5 + 质量 5 + 个人共鸣 5</p>
                  </div>
                </div>

                <ScoreInput
                  label="余韵时长"
                  value={aftertaste.duration}
                  max={5}
                  onChange={v => setAftertaste({ ...aftertaste, duration: v })}
                  description="咽下后风味停留15秒以上为佳"
                  color="#C8A8D0"
                />
                <ScoreInput
                  label="余韵质量"
                  value={aftertaste.quality}
                  max={5}
                  onChange={v => setAftertaste({ ...aftertaste, quality: v })}
                  description="留下的是回甘、果香（加分）vs 酸涩或金属味（扣分）"
                  color="#C8A8D0"
                />
                <ScoreInput
                  label="个人共鸣"
                  value={aftertaste.personal}
                  max={5}
                  onChange={v => setAftertaste({ ...aftertaste, personal: v })}
                  description="是否有'想再来一块'的冲动？（主观但重要）"
                  color="#C8A8D0"
                />

                <div>
                  <label className="input-label">余韵备注</label>
                  <textarea
                    value={aftertaste.notes}
                    onChange={e => setAftertaste({ ...aftertaste, notes: e.target.value })}
                    placeholder="咽下后的感受、余味的长短和质量……"
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>

                <div>
                  <label className="input-label">个人笔记</label>
                  <textarea
                    value={personalNotes}
                    onChange={e => setPersonalNotes(e.target.value)}
                    placeholder="任何你想记录的额外感受、品鉴环境、配饮等……"
                    rows={4}
                    className="input-field resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl bg-pink-500/5 border border-pink-500/10">
                  <span className="text-2xl">💭</span>
                  <div>
                    <p className="text-sm font-medium text-pink-300">余韵得分：{aftertaste.duration + aftertaste.quality + aftertaste.personal}/15</p>
                    <p className="text-sm text-noir-500 mt-0.5">余韵长短是判断顶级巧克力的金标准</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* 底部按钮 */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={handlePrev}
            disabled={step === 0}
            className={`btn-ghost flex items-center gap-1 ${step === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
          >
            <ChevronLeft size={16} />
            上一步
          </button>

          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="btn-ghost text-sm">
              取消
            </button>
            <button onClick={handleNext} className="btn-gold flex items-center gap-2">
              {step === STEPS.length - 1 ? (
                <>
                  <Sparkles size={16} />
                  预览评分
                </>
              ) : (
                <>
                  下一步
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* 提交确认弹窗 */}
        <AnimatePresence>
          {showReview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowReview(false)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative glass-card p-6 md:p-8 max-w-md w-full max-h-[80vh] overflow-y-auto"
              >
                <h2 className="font-display text-xl font-bold text-noir-100 mb-1">品鉴总结</h2>
                <p className="text-sm text-noir-400 mb-6">请确认以下评分无误</p>

                {/* 总分 */}
                <div className="text-center mb-6">
                  <div className={`text-5xl font-display font-bold mb-2 ${
                    totalScore >= 90 ? 'text-gold-400' :
                    totalScore >= 80 ? 'text-emerald-400' :
                    totalScore >= 70 ? 'text-sky-400' : 'text-noir-400'
                  }`}>
                    {totalScore}
                    <span className="text-lg text-noir-600">/100</span>
                  </div>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${GRADE_CONFIG[grade].bgColor} ${GRADE_CONFIG[grade].color}`}>
                    {GRADE_CONFIG[grade].label}
                  </span>
                </div>

                {/* 各维度得分 */}
                <div className="space-y-3 mb-6">
                  <ScoreRow label="外观与质地" score={appearance.gloss + appearance.snap + appearance.texture} max={20} color="#CD9575" />
                  <ScoreRow label="香气复杂度" score={aroma.purity + aroma.intensity + aroma.complexity} max={20} color="#F5C842" />
                  <ScoreRow label="风味与平衡度" score={flavor.balance + flavor.clarity + flavor.tannin} max={45} color="#E88078" />
                  <ScoreRow label="余韵与愉悦感" score={aftertaste.duration + aftertaste.quality + aftertaste.personal} max={15} color="#C8A8D0" />
                </div>

                {/* 基本信息 */}
                <div className="text-sm text-noir-400 space-y-1 mb-6">
                  <p><span className="text-noir-500">名称：</span>{name} {brand && `· ${brand}`}</p>
                  <p><span className="text-noir-500">产地：</span>{origin} · {cocoaPercentage}% 可可</p>
                  {beanVariety && <p><span className="text-noir-500">品种：</span>{beanVariety}</p>}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setShowReview(false)} className="btn-ghost flex-1 text-sm">
                    继续修改
                  </button>
                  <button onClick={handleSubmit} className="btn-gold flex-1 flex items-center justify-center gap-2 text-sm">
                    <Save size={16} />
                    保存记录
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatedPage>
  );
}

function ScoreRow({ label, score, max, color }: { label: string; score: number; max: number; color: string }) {
  const pct = (score / max) * 100;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-noir-300 w-24">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-noir-800 overflow-hidden">
        <div className="h-full rounded-full" style={{ backgroundColor: color, width: `${pct}%` }} />
      </div>
      <span className="text-sm font-medium text-noir-200 w-12 text-right">{score}/{max}</span>
    </div>
  );
}
