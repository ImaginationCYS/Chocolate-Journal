export type Grade = 'legendary' | 'excellent' | 'good' | 'passable' | 'fail';

export interface AppearanceScores {
  gloss: number;       // 光泽度 0-5
  snap: number;        // 断裂声 0-5
  texture: number;     // 融化质地 0-10
  notes: string;
}

export interface AromaScores {
  purity: number;      // 纯净度 0-5
  intensity: number;   // 强度 0-5
  complexity: number;  // 层次 0-10
  dryAroma: string;    // 干香描述
  wetAroma: string;    // 湿香描述
  aromas: string[];    // 风味标签
}

export interface FlavorScores {
  balance: number;     // 酸苦甜平衡 0-15
  clarity: number;     // 风味清晰度与层次 0-20
  tannin: number;      // 单宁涩感 0-10
  topNote: string;     // 前调
  middleNote: string;  // 中调
  baseNote: string;    // 后调
}

export interface AftertasteScores {
  duration: number;    // 余韵时长 0-5
  quality: number;     // 余韵质量 0-5
  personal: number;    // 个人共鸣 0-5
  notes: string;
}

export interface ChocolateReview {
  id: string;

  // 基本信息
  name: string;
  brand: string;
  origin: string;
  cocoaPercentage: number;
  beanVariety?: string;       // @deprecated 已替换为 flavorOrigin
  flavorOrigin?: string;      // 增味物种产地（格式：国家-具体产地）
  price: number;
  purchaseDate: string;
  photo?: string;

  // 五感评分
  appearance: AppearanceScores;
  aroma: AromaScores;
  flavor: FlavorScores;
  aftertaste: AftertasteScores;

  // 汇总
  totalScore: number;
  grade: Grade;

  // 元数据
  categoryDetails?: Record<string, string[]>;
  personalNotes: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DraftReview {
  name: string;
  brand: string;
  origin: string;
  cocoaPercentage: number;
  beanVariety?: string;       // @deprecated 已替换为 flavorOrigin
  flavorOrigin?: string;      // 增味物种产地（格式：国家-具体产地）
  price: number;
  purchaseDate: string;
  photo?: string;
  appearance: AppearanceScores;
  aroma: AromaScores;
  flavor: FlavorScores;
  aftertaste: AftertasteScores;
  categoryDetails?: Record<string, string[]>;
  personalNotes: string;
  tags: string[];
  isFavorite: boolean;
}

export const GRADE_CONFIG: Record<Grade, { label: string; color: string; bgColor: string; borderColor: string; range: string }> = {
  legendary:  { label: '殿堂级', color: 'text-gold-400', bgColor: 'bg-gold-500/10', borderColor: 'border-gold-500/30', range: '90-100' },
  excellent:  { label: '精品级', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', range: '80-89' },
  good:       { label: '优选级', color: 'text-sky-400', bgColor: 'bg-sky-500/10', borderColor: 'border-sky-500/30', range: '70-79' },
  passable:   { label: '商业级', color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30', range: '60-69' },
  fail:       { label: '基础级', color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30', range: '<60' },
};

export interface FlavorCategory {
  icon: string;
  name: string;
  description: string;
}

/** 八大风味族 */
export const FLAVOR_CATEGORIES: FlavorCategory[] = [
  { icon: '🌸', name: '花香和果香族', description: '呈现鲜花的清雅芬芳与水果的酸甜活泼。如玫瑰、茉莉等花香，或柑橘、浆果、热带水果等果香，通常作为前调，带来明亮的第一印象。' },
  { icon: '🌿', name: '草木与泥土组', description: '涵盖植物根茎、草本叶片、新鲜木材以及湿润土壤的气息。如青草、药草、雪松、檀木、苔藓或雨后泥土等，赋予巧克力沉稳、自然的大地感。' },
  { icon: '🥜', name: '坚果与谷物族', description: '传递温暖、烘烤后的醇厚香气。如榛子、杏仁、核桃等坚果，以及烤麦芽、面包皮、谷物等，常见于中后段，增加饱满度与满足感。' },
  { icon: '🔥', name: '烘焙与焦香族', description: '源自深度烘焙或高温反应产生的深邃香气。如黑咖啡、浓缩咖啡、烘烤可可豆、焦糖化的烟熏感，赋予巧克力浓郁而有力的底色。' },
  { icon: '🍬', name: '甜香与乳香族', description: '体现甜美柔和、奶香浓郁的愉悦气息。如焦糖、太妃糖、蜂蜜、香草，以及奶油、黄油、炼乳等乳制品的温润香气，常用于平衡酸苦。' },
  { icon: '🌶️', name: '辛香与刺激族', description: '带来温暖或辛辣的感官冲击。如肉桂、丁香、肉豆蔻、姜等暖系香料，或黑胡椒、辣椒等辛辣感，增加风味的层次与活力。' },
  { icon: '🍷', name: '发酵与陈年族', description: '源于长时间发酵或熟成过程产生的复杂气息。如朗姆酒、威士忌、雪利酒等酒香，或果醋、酱油等发酵类香气，常伴随深沉悠长的余韵。' },
  { icon: '🪨', name: '矿物与化学族', description: '体现风土特征的冷冽或特殊气息。如岩石、燧石、铁质、碘酒等矿物感，有时带有类似药水的微涩风味，是产地特性的重要标志。' },
];

export function calculateTotalScore(appearance: AppearanceScores, aroma: AromaScores, flavor: FlavorScores, aftertaste: AftertasteScores): number {
  const appearanceTotal = appearance.gloss + appearance.snap + appearance.texture;
  const aromaTotal = aroma.purity + aroma.intensity + aroma.complexity;
  const flavorTotal = flavor.balance + flavor.clarity + flavor.tannin;
  const aftertasteTotal = aftertaste.duration + aftertaste.quality + aftertaste.personal;
  return appearanceTotal + aromaTotal + flavorTotal + aftertasteTotal;
}

export function getGrade(score: number): Grade {
  if (score >= 90) return 'legendary';
  if (score >= 80) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 60) return 'passable';
  return 'fail';
}

export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-gold-400';
  if (score >= 80) return 'text-emerald-400';
  if (score >= 70) return 'text-sky-400';
  if (score >= 60) return 'text-amber-400';
  return 'text-red-400';
}

export function getScoreBgColor(score: number): string {
  if (score >= 90) return 'bg-gold-500/15';
  if (score >= 80) return 'bg-emerald-500/15';
  if (score >= 70) return 'bg-sky-500/15';
  if (score >= 60) return 'bg-amber-500/15';
  return 'bg-red-500/15';
}

/*
 * 🌸 花香和果香族 — 呈现鲜花的清雅芬芳与水果的酸甜活泼。
 *    如玫瑰、茉莉等花香，或柑橘、浆果、热带水果等果香，
 *    通常作为前调，带来明亮的第一印象。
 *
 * 🌿 草木与泥土组 — 涵盖植物根茎、草本叶片、新鲜木材以及湿润土壤的气息。
 *    如青草、药草、雪松、檀木、苔藓或雨后泥土等，
 *    赋予巧克力沉稳、自然的大地感。
 *
 * 🥜 坚果与谷物族 — 传递温暖、烘烤后的醇厚香气。
 *    如榛子、杏仁、核桃等坚果，以及烤麦芽、面包皮、谷物等，
 *    常见于中后段，增加饱满度与满足感。
 *
 * 🔥 烘焙与焦香族 — 源自深度烘焙或高温反应产生的深邃香气。
 *    如黑咖啡、浓缩咖啡、烘烤可可豆、焦糖化的烟熏感，
 *    赋予巧克力浓郁而有力的底色。
 *
 * 🍬 甜香与乳香族 — 体现甜美柔和、奶香浓郁的愉悦气息。
 *    如焦糖、太妃糖、蜂蜜、香草，以及奶油、黄油、炼乳等乳制品的温润香气，
 *    常用于平衡酸苦。
 *
 * 🌶️ 辛香与刺激族 — 带来温暖或辛辣的感官冲击。
 *    如肉桂、丁香、肉豆蔻、姜等暖系香料，或黑胡椒、辣椒等辛辣感，
 *    增加风味的层次与活力。
 *
 * 🍷 发酵与陈年族 — 源于长时间发酵或熟成过程产生的复杂气息。
 *    如朗姆酒、威士忌、雪利酒等酒香，或果醋、酱油等发酵类香气，
 *    常伴随深沉悠长的余韵。
 *
 * 🪨 矿物与化学族 — 体现风土特征的冷冽或特殊气息。
 *    如岩石、燧石、铁质、碘酒等矿物感，有时带有类似药水的微涩风味，
 *    是产地特性的重要标志。
 */
