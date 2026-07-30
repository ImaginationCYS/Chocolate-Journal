import { ChocolateReview } from '../types';

/** 12 维雷达图的维度定义 */
export const RADAR_DIMENSIONS = [
  { key: 'gloss',      label: '外观光泽',   category: 'appearance', max: 5   },
  { key: 'snap',       label: '断裂声响',   category: 'appearance', max: 5   },
  { key: 'texture',    label: '融化质地',   category: 'appearance', max: 10  },
  { key: 'purity',     label: '香气纯净',   category: 'aroma',      max: 5   },
  { key: 'intensity',  label: '香气强度',   category: 'aroma',      max: 5   },
  { key: 'complexity', label: '香气层次',   category: 'aroma',      max: 10  },
  { key: 'balance',    label: '酸甜平衡',   category: 'flavor',     max: 15  },
  { key: 'clarity',    label: '风味清晰',   category: 'flavor',     max: 20  },
  { key: 'tannin',     label: '单宁涩感',   category: 'flavor',     max: 10  },
  { key: 'duration',   label: '余韵时长',   category: 'aftertaste', max: 5   },
  { key: 'quality',    label: '余韵质量',   category: 'aftertaste', max: 5   },
  { key: 'personal',   label: '个人共鸣',   category: 'aftertaste', max: 5   },
] as const;

/** 将 ChocolateReview 的 12 个评分维度归一化为 0-100（简单线性） */
export function getNormalizedScores(review: ChocolateReview): number[] {
  return RADAR_DIMENSIONS.map((dim) => {
    const category = review[dim.category];
    const value = category[dim.key as keyof typeof category] as number;
    return (value / dim.max) * 100;
  });
}

/**
 * 方案一：基准线下限归一化
 * 每个维度设定有效下限 floor = max × 40%，仅对 [floor, max] 区间做线性映射
 * 低于 floor 的分数映射到 0-20 区间，保证有区分度但不至于塌缩
 */
export function getNormalizedScoresFloor(review: ChocolateReview): number[] {
  return RADAR_DIMENSIONS.map((dim) => {
    const category = review[dim.category];
    const value = category[dim.key as keyof typeof category] as number;
    const floor = dim.max * 0.4;
    if (value <= floor) {
      // 低于基准线：映射到 0-20 低分区
      return (value / floor) * 20;
    }
    // 高于基准线：映射到 20-100
    return 20 + ((value - floor) / (dim.max - floor)) * 80;
  });
}

/**
 * 方案二：Z-score 标准化
 * 基于全部品鉴数据的均值 μ 和标准差 σ，将得分转为标准分数后缩放到 0-100
 * 使用 clamp(50 + z × 15, 0, 100)，保证 95%+ 的分数落在 [5, 95] 内
 */
export function getNormalizedScoresZScore(
  review: ChocolateReview,
  allReviews: ChocolateReview[],
): number[] {
  if (allReviews.length < 2) {
    // 样本不足时回退到简单归一化
    return getNormalizedScores(review);
  }

  return RADAR_DIMENSIONS.map((dim, di) => {
    // 计算该维度的均值和标准差
    const values = allReviews.map((r) => {
      const cat = r[dim.category];
      return cat[dim.key as keyof typeof cat] as number;
    });
    const n = values.length;
    const mean = values.reduce((s, v) => s + v, 0) / n;
    const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
    const std = Math.sqrt(variance);

    const raw = (() => {
      const cat = review[dim.category];
      return cat[dim.key as keyof typeof cat] as number;
    })();

    if (std === 0) {
      // 所有记录该维度分数相同，返回中位值
      return 50;
    }

    const z = (raw - mean) / std;
    // z ∈ [-3, +3] 覆盖 99.7%，缩放至 [5, 95]
    return Math.max(0, Math.min(100, 50 + z * 15));
  });
}

/** 预定义的对比色板 */
export const COMPARE_COLORS = [
  { fill: 'rgba(248, 208, 91, 0.25)', stroke: '#F8D05B' },   // 金色
  { fill: 'rgba(232, 128, 120, 0.25)', stroke: '#E88078' },  // 珊瑚粉
  { fill: 'rgba(80, 200, 180, 0.25)', stroke: '#50C8B4' },   // 青绿
  { fill: 'rgba(160, 130, 220, 0.25)', stroke: '#A082DC' },  // 淡紫
  { fill: 'rgba(255, 165, 100, 0.25)', stroke: '#FFA564' },  // 橘色
  { fill: 'rgba(100, 180, 255, 0.25)', stroke: '#64B4FF' },  // 天蓝
];
