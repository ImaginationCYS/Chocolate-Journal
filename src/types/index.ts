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
  beanVariety: string;
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
  beanVariety: string;
  price: number;
  purchaseDate: string;
  photo?: string;
  appearance: AppearanceScores;
  aroma: AromaScores;
  flavor: FlavorScores;
  aftertaste: AftertasteScores;
  personalNotes: string;
  tags: string[];
  isFavorite: boolean;
}

export const GRADE_CONFIG: Record<Grade, { label: string; color: string; bgColor: string; borderColor: string; range: string }> = {
  legendary:  { label: '殿堂级', color: 'text-gold-400', bgColor: 'bg-gold-500/10', borderColor: 'border-gold-500/30', range: '90-100' },
  excellent:  { label: '优秀级', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', range: '80-89' },
  good:       { label: '良好级', color: 'text-sky-400', bgColor: 'bg-sky-500/10', borderColor: 'border-sky-500/30', range: '70-79' },
  passable:   { label: '及格级', color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30', range: '60-69' },
  fail:       { label: '不及格', color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30', range: '<60' },
};

export const DEFAULT_AROMAS = [
  '莓果', '柑橘', '热带水果', '核果', '红色水果',
  '花香', '玫瑰', '茉莉',
  '坚果', '杏仁', '榛子', '核桃',
  '焦糖', '蜂蜜', '香草', '太妃糖',
  '咖啡', '烟草', '木质', '桂皮', '皮革',
  '可可', '烘焙', '烟熏', '泥土',
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
