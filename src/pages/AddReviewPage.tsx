import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, Wind, ChefHat, Heart,
  ChevronRight, ChevronLeft, Save, Sparkles, AlertCircle,
  Camera, Tag, Plus, X
} from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import ScoreInput from '../components/ScoreInput';
import { useChocolate } from '../context/ChocolateContext';
import {
  DraftReview, AppearanceScores, AromaScores, FlavorScores, AftertasteScores,
  FLAVOR_CATEGORIES, calculateTotalScore, getGrade, GRADE_CONFIG
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

  const { addNewReview, editReview, getReview, reviews } = useChocolate();
  const existingReview = editId ? getReview(editId) : undefined;

  const [step, setStep] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [showReview, setShowReview] = useState(false);

  // 基本信息
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [originCountry, setOriginCountry] = useState('');
  const [originRegion, setOriginRegion] = useState('');
  const [cocoaPercentage, setCocoaPercentage] = useState(70);
  const [flavorVariety, setFlavorVariety] = useState('');
  const [flavorOriginDetail, setFlavorOriginDetail] = useState('');
  const [price, setPrice] = useState(0);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [personalNotes, setPersonalNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  // 品牌下拉
  const [brandFocus, setBrandFocus] = useState(false);
  const [brandHighlight, setBrandHighlight] = useState(-1);
  const brandRef = useRef<HTMLDivElement>(null);

  const knownBrands = useMemo(() => {
    const set = new Set(reviews.map(r => r.brand).filter(Boolean));
    return Array.from(set).sort();
  }, [reviews]);

  const filteredBrands = useMemo(() => {
    if (!brand.trim()) return knownBrands;
    const q = brand.toLowerCase();
    return knownBrands.filter(b => b.toLowerCase().includes(q));
  }, [brand, knownBrands]);

  const selectBrand = useCallback((b: string) => {
    setBrand(b);
    setBrandFocus(false);
    setBrandHighlight(-1);
  }, []);

  // 点击外部关闭
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (brandRef.current && !brandRef.current.contains(e.target as Node)) {
        setBrandFocus(false);
        setBrandHighlight(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleBrandKeyDown = (e: React.KeyboardEvent) => {
    if (!brandFocus || filteredBrands.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setBrandHighlight(i => Math.min(i + 1, filteredBrands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setBrandHighlight(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && brandHighlight >= 0) {
      e.preventDefault();
      selectBrand(filteredBrands[brandHighlight]);
    } else if (e.key === 'Escape') {
      setBrandFocus(false);
      setBrandHighlight(-1);
    }
  };
  // 每个风味大类下自定义的具体香气
  const [categoryDetails, setCategoryDetails] = useState<Record<string, string[]>>({});
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);

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
    if (!originCountry.trim()) errs.originCountry = '请输入产地国家';
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

  const composeOrigin = (country: string, region: string) => {
    const c = country.trim();
    const r = region.trim();
    return r ? `${c}-${r}` : c;
  };

  const handleSubmit = () => {
    const draft: DraftReview = {
      name: name.trim(),
      brand: brand.trim(),
      origin: composeOrigin(originCountry, originRegion),
      cocoaPercentage,
      flavorOrigin: composeOrigin(flavorOriginDetail, flavorVariety) || undefined,
      price,
      purchaseDate,
      appearance,
      aroma,
      flavor,
      aftertaste,
      categoryDetails,
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

  const addCategoryAroma = (catName: string, value: string) => {
    if (!value || categoryDetails[catName]?.includes(value)) return;
    setCategoryDetails(prev => ({
      ...prev,
      [catName]: [...(prev[catName] || []), value],
    }));
  };

  const removeCategoryAroma = (catName: string, value: string) => {
    setCategoryDetails(prev => ({
      ...prev,
      [catName]: (prev[catName] || []).filter(a => a !== value),
    }));
  };

  // 编辑模式：从已有记录回填数据
  useEffect(() => {
    if (existingReview) {
      setName(existingReview.name);
      setBrand(existingReview.brand);
      // 解析已有产地格式 "国家-具体产地"
      const originParts = (existingReview.origin || '').split('-');
      setOriginCountry(originParts[0] || '');
      setOriginRegion(originParts.slice(1).join('-') || '');
      setCocoaPercentage(existingReview.cocoaPercentage);
      // 解析增味产地（格式：产地-品类）
      const flavorParts = (existingReview.flavorOrigin || '').split('-');
      setFlavorOriginDetail(flavorParts[0] || '');
      setFlavorVariety(flavorParts.slice(1).join('-') || '');
      setPrice(existingReview.price);
      setPurchaseDate(existingReview.purchaseDate);
      setPersonalNotes(existingReview.personalNotes);
      setTags(existingReview.tags);
      setIsFavorite(existingReview.isFavorite);
      setAppearance(existingReview.appearance);

      // 清理旧版平铺标签，只保留新版八大风味族大类名称
      const categoryNames = FLAVOR_CATEGORIES.map(c => c.name);
      const cleanedAromas = existingReview.aroma.aromas.filter(a => categoryNames.includes(a));
      setAroma({ ...existingReview.aroma, aromas: cleanedAromas });
      setCategoryDetails(existingReview.categoryDetails || {});

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
                onClick={() => {
                  if (i === step && !collapsed) {
                    setCollapsed(true);
                  } else {
                    setStep(i);
                    setCollapsed(false);
                  }
                }}
                className={`flex-1 h-1.5 rounded-full transition-all duration-500 cursor-pointer hover:opacity-80 ${
                  collapsed && i === step ? 'bg-noir-800' :
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
                onClick={() => {
                  if (i === step && !collapsed) {
                    setCollapsed(true);
                  } else {
                    setStep(i);
                    setCollapsed(false);
                  }
                }}
                className={`flex flex-col items-center gap-1 transition-all duration-300 cursor-pointer
                  hover:scale-105 active:scale-95
                  ${collapsed && i === step
                    ? 'text-noir-600'
                    : i === step
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
          {!collapsed && (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
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

                  <div ref={brandRef} className="relative">
                    <label className="input-label">品牌 *</label>
                    <input
                      type="text"
                      value={brand}
                      onChange={e => { setBrand(e.target.value); setBrandFocus(true); setBrandHighlight(-1); }}
                      onFocus={() => { if (knownBrands.length > 0) setBrandFocus(true); }}
                      onKeyDown={handleBrandKeyDown}
                      placeholder="例如：Amedei"
                      autoComplete="off"
                      className={`input-field ${errors.brand ? 'border-red-500/50' : ''}`}
                    />
                    {errors.brand && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.brand}</p>}
                    {/* 品牌建议下拉 */}
                    {brandFocus && filteredBrands.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scaleY: 0.96 }}
                        animate={{ opacity: 1, y: 0, scaleY: 1 }}
                        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                        className="absolute left-0 right-0 top-full mt-2 z-50
                          bg-noir-900/90 backdrop-blur-2xl
                          border border-white/[0.06] rounded-2xl
                          shadow-[0_16px_48px_-12px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.02)_inset]
                          overflow-hidden origin-top"
                      >
                        <div className="max-h-52 overflow-y-auto custom-scrollbar p-1.5">
                          {filteredBrands.map((b, i) => {
                            const matchIdx = brand.length > 0 ? b.toLowerCase().indexOf(brand.toLowerCase()) : -1;
                            return (
                            <button
                              key={b}
                              type="button"
                              onClick={() => selectBrand(b)}
                              onMouseEnter={() => setBrandHighlight(i)}
                              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium
                                transition-all duration-200 ease-out
                                ${i === brandHighlight
                                  ? 'bg-gold-500/10 text-gold-200 shadow-[0_0_0_1px_rgba(196,155,108,0.15)_inset]'
                                  : 'text-noir-300 hover:bg-white/[0.03] hover:text-noir-100'
                                }
                                ${i === 0 ? '' : ''}`}
                            >
                              {matchIdx >= 0 ? (
                                <span>
                                  <span className="text-noir-400">{b.slice(0, matchIdx)}</span>
                                  <span className="text-gold-400">{b.slice(matchIdx, matchIdx + brand.length)}</span>
                                  <span className="text-noir-400">{b.slice(matchIdx + brand.length)}</span>
                                </span>
                              ) : (
                                b
                              )}
                            </button>
                            );
                          })}
                        </div>
                        {knownBrands.length > 0 && (
                          <div className="px-4 py-2 border-t border-white/[0.04] flex items-center justify-between">
                            <span className="text-[10px] tracking-wider text-noir-500 uppercase">已知品牌</span>
                            <span className="text-[10px] text-noir-600">{knownBrands.length} 个</span>
                          </div>
                        )}
                      </motion.div>
                    )}
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

                  <div className="sm:col-span-2">
                    <label className="input-label">可可产地 *</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={originCountry}
                        onChange={e => setOriginCountry(e.target.value)}
                        placeholder="国家，例如：委内瑞拉"
                        className={`input-field text-sm ${errors.originCountry ? 'border-red-500/50' : ''}`}
                      />
                      <input
                        type="text"
                        value={originRegion}
                        onChange={e => setOriginRegion(e.target.value)}
                        placeholder="具体产地，例如：Chuao"
                        className="input-field text-sm"
                      />
                    </div>
                    {errors.originCountry && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.originCountry}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="input-label">增味物种产地及品类</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={flavorOriginDetail}
                        onChange={e => setFlavorOriginDetail(e.target.value)}
                        placeholder="产地，例如：意大利南蒂罗尔"
                        className="input-field text-sm"
                      />
                      <input
                        type="text"
                        value={flavorVariety}
                        onChange={e => setFlavorVariety(e.target.value)}
                        placeholder="品类，例如：杜松子酒"
                        className="input-field text-sm"
                      />
                    </div>
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
                    <p className="text-sm text-noir-500">满分 20 分：外观光泽 5 + 断裂声响 5 + 融化质地 10</p>
                  </div>
                </div>

                <ScoreInput
                  label="外观光泽"
                  value={appearance.gloss}
                  max={5}
                  onChange={v => setAppearance({ ...appearance, gloss: v })}
                  description="明亮有光泽（5分）vs 暗淡或轻微白霜（2-4分）vs 严重白霜（0-1分）"
                  color="#CD9575"
                />
                <ScoreInput
                  label="断裂声响"
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
                    <p className="text-sm text-noir-500">满分 20 分：香气纯净 5 + 香气强度 5 + 香气层次 10</p>
                  </div>
                </div>

                <ScoreInput
                  label="香气纯净"
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
                  label="香气层次"
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

                {/* 风味族选择 */}
                <div>
                  <label className="input-label">选择风味线索（可多选，支持自定义）</label>

                  {/* 八大风味族 */}
                  <div className="grid sm:grid-cols-2 gap-2 mb-3">
                    {FLAVOR_CATEGORIES.map((cat) => {
                      const isSelected = aroma.aromas.includes(cat.name);
                      const catItems = categoryDetails[cat.name] || [];
                      return (
                        <div key={cat.name} className="relative"
                          onMouseEnter={() => setHoveredCat(cat.name)}
                          onMouseLeave={() => setHoveredCat(null)}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setAroma(prev => ({
                                  ...prev,
                                  aromas: prev.aromas.filter(a => a !== cat.name),
                                }));
                                setCategoryDetails(prev => {
                                  const next = { ...prev };
                                  delete next[cat.name];
                                  return next;
                                });
                              } else {
                                setAroma(prev => ({
                                  ...prev,
                                  aromas: [...prev.aromas, cat.name],
                                }));
                              }
                            }}
                            className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-300 ${
                              isSelected
                                ? 'bg-cocoa-500/15 border border-cocoa-500/30 text-cocoa-200'
                                : 'bg-white/[0.03] border border-white/[0.06] text-noir-300 hover:border-cocoa-500/40 hover:text-noir-100'
                            }`}
                          >
                            <span className="text-lg">{cat.icon}</span>
                            <span className="font-medium">{cat.name}</span>
                          </button>

                          {/* 悬停 tooltip */}
                          <AnimatePresence>
                            {hoveredCat === cat.name && (
                              <motion.div
                                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                                className="absolute bottom-full left-0 mb-2 w-64 p-3 rounded-xl bg-noir-700 border border-white/[0.1] shadow-2xl shadow-black/60 z-50"
                              >
                                <p className="text-[11px] text-noir-200 leading-relaxed">{cat.description}</p>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* 选中时显示该类下的具体香气 + 输入 */}
                          {isSelected && (
                            <div className="mt-1.5 ml-2">
                              {catItems.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-1.5">
                                  {[...catItems].sort((a, b) => b.length - a.length).map(item => (
                                    <span key={item} className="tag tag-selected text-xs group">
                                      {item}
                                      <X
                                        size={10}
                                        className="ml-0.5 opacity-50 group-hover:opacity-100 hover:text-red-400 cursor-pointer"
                                        onClick={() => removeCategoryAroma(cat.name, item)}
                                      />
                                    </span>
                                  ))}
                                </div>
                              )}
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  placeholder="输入具体香气后按回车…"
                                  className="input-field flex-1 text-xs py-1.5 px-2"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      const val = (e.target as HTMLInputElement).value.trim();
                                      addCategoryAroma(cat.name, val);
                                      (e.target as HTMLInputElement).value = '';
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* 已选风味族汇总 — 紧凑标签 */}
                  {aroma.aromas.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/[0.05]">
                      {aroma.aromas.map(a => {
                        const cat = FLAVOR_CATEGORIES.find(c => c.name === a);
                        const items = categoryDetails[a] || [];
                        return (
                          <span key={a} className="tag tag-default text-xs">
                            {cat?.icon} {a}
                            {items.length > 0 && `（${[...items].sort((a, b) => b.length - a.length).join('、')}）`}
                          </span>
                        );
                      })}
                    </div>
                  )}
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
                    <p className="text-sm text-noir-500">满分 45 分：酸甜平衡 15 + 风味清晰 20 + 单宁涩感 10</p>
                  </div>
                </div>

                <ScoreInput
                  label="酸甜平衡"
                  value={flavor.balance}
                  max={15}
                  onChange={v => setFlavor({ ...flavor, balance: v })}
                  description="三者是否和谐？酸得刺牙、苦得发涩或甜得发腻各扣5-10分"
                  color="#E88078"
                />
                <ScoreInput
                  label="风味清晰"
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
          )}
        </AnimatePresence>

        {/* 底部按钮 */}
        {!collapsed && (
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
        )}

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
                  <p><span className="text-noir-500">产地：</span>{composeOrigin(originCountry, originRegion)} · {cocoaPercentage}% 可可</p>
                  {(flavorOriginDetail || flavorVariety) && <p><span className="text-noir-500">增味：</span>{composeOrigin(flavorOriginDetail, flavorVariety)}</p>}
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
