import { ChocolateReview } from '../types';

/** 中文国家名 → 世界地图英文名 + 大致中心经纬度 */
export interface CountryInfo {
  code: string;      // ISO 两位代码
  zhName?: string;   // 中文名（由映射表 key 填充）
  atlasName?: string; // world-atlas 中的英文名（缺失则只有点标记）
  lat: number;
  lon: number;
}

export const COUNTRY_GEO: Record<string, CountryInfo> = {
  // 南美
  '厄瓜多尔': { code: 'EC', atlasName: 'Ecuador', lat: -1.8, lon: -78.2 },
  '秘鲁': { code: 'PE', atlasName: 'Peru', lat: -9.2, lon: -75.0 },
  '委内瑞拉': { code: 'VE', atlasName: 'Venezuela', lat: 6.4, lon: -66.6 },
  '哥伦比亚': { code: 'CO', atlasName: 'Colombia', lat: 4.6, lon: -74.1 },
  '巴西': { code: 'BR', atlasName: 'Brazil', lat: -10.8, lon: -52.9 },
  '玻利维亚': { code: 'BO', atlasName: 'Bolivia', lat: -16.7, lon: -64.7 },
  '圭亚那': { code: 'GY', atlasName: 'Guyana', lat: 4.8, lon: -58.9 },
  '苏里南': { code: 'SR', atlasName: 'Suriname', lat: 4.1, lon: -55.9 },
  // 中北美
  '伯利兹': { code: 'BZ', atlasName: 'Belize', lat: 17.2, lon: -88.5 },
  '多米尼加': { code: 'DO', atlasName: 'Dominican Rep.', lat: 18.7, lon: -70.2 },
  '海地': { code: 'HT', atlasName: 'Haiti', lat: 18.9, lon: -72.3 },
  '牙买加': { code: 'JM', atlasName: 'Jamaica', lat: 18.1, lon: -77.3 },
  '墨西哥': { code: 'MX', atlasName: 'Mexico', lat: 23.6, lon: -102.6 },
  '格林纳达': { code: 'GD', lat: 12.1, lon: -61.7 },
  '哥斯达黎加': { code: 'CR', atlasName: 'Costa Rica', lat: 9.7, lon: -83.8 },
  '巴拿马': { code: 'PA', atlasName: 'Panama', lat: 8.5, lon: -80.8 },
  '古巴': { code: 'CU', atlasName: 'Cuba', lat: 21.5, lon: -79.0 },
  '尼加拉瓜': { code: 'NI', atlasName: 'Nicaragua', lat: 12.8, lon: -85.0 },
  '洪都拉斯': { code: 'HN', atlasName: 'Honduras', lat: 15.2, lon: -86.5 },
  '危地马拉': { code: 'GT', atlasName: 'Guatemala', lat: 15.8, lon: -90.2 },
  '特立尼达和多巴哥': { code: 'TT', atlasName: 'Trinidad and Tobago', lat: 10.4, lon: -61.2 },
  '特立尼达': { code: 'TT', atlasName: 'Trinidad and Tobago', lat: 10.4, lon: -61.2 },
  // 非洲
  '马达加斯加': { code: 'MG', atlasName: 'Madagascar', lat: -18.8, lon: 46.9 },
  '坦桑尼亚': { code: 'TZ', atlasName: 'Tanzania', lat: -6.4, lon: 34.9 },
  '加纳': { code: 'GH', atlasName: 'Ghana', lat: 7.9, lon: -1.0 },
  '科特迪瓦': { code: 'CI', atlasName: "Côte d'Ivoire", lat: 7.5, lon: -5.5 },
  '乌干达': { code: 'UG', atlasName: 'Uganda', lat: 1.4, lon: 32.3 },
  '尼日利亚': { code: 'NG', atlasName: 'Nigeria', lat: 9.1, lon: 8.7 },
  '喀麦隆': { code: 'CM', atlasName: 'Cameroon', lat: 5.7, lon: 12.7 },
  '圣多美和普林西比': { code: 'ST', lat: 0.3, lon: 6.6 },
  '圣多美': { code: 'ST', lat: 0.3, lon: 6.6 },
  '塞拉利昂': { code: 'SL', atlasName: 'Sierra Leone', lat: 8.5, lon: -11.8 },
  '利比里亚': { code: 'LR', atlasName: 'Liberia', lat: 6.4, lon: -9.4 },
  '多哥': { code: 'TG', atlasName: 'Togo', lat: 8.6, lon: 0.8 },
  '刚果': { code: 'CD', atlasName: 'Dem. Rep. Congo', lat: -2.9, lon: 23.6 },
  '刚果民主共和国': { code: 'CD', atlasName: 'Dem. Rep. Congo', lat: -2.9, lon: 23.6 },
  '肯尼亚': { code: 'KE', atlasName: 'Kenya', lat: 0.0, lon: 37.9 },
  '卢旺达': { code: 'RW', atlasName: 'Rwanda', lat: -1.9, lon: 29.9 },
  // 亚洲
  '越南': { code: 'VN', atlasName: 'Vietnam', lat: 16.2, lon: 107.8 },
  '印度尼西亚': { code: 'ID', atlasName: 'Indonesia', lat: -2.5, lon: 118.0 },
  '菲律宾': { code: 'PH', atlasName: 'Philippines', lat: 12.9, lon: 121.8 },
  '巴布亚新几内亚': { code: 'PG', atlasName: 'Papua New Guinea', lat: -6.3, lon: 143.9 },
  '泰国': { code: 'TH', atlasName: 'Thailand', lat: 15.9, lon: 100.9 },
  '印度': { code: 'IN', atlasName: 'India', lat: 22.4, lon: 79.0 },
  '马来西亚': { code: 'MY', atlasName: 'Malaysia', lat: 4.2, lon: 102.0 },
  '斯里兰卡': { code: 'LK', atlasName: 'Sri Lanka', lat: 7.9, lon: 80.8 },
  '中国': { code: 'CN', atlasName: 'China', lat: 35.0, lon: 104.0 },
  '日本': { code: 'JP', atlasName: 'Japan', lat: 36.2, lon: 138.3 },
  '韩国': { code: 'KR', atlasName: 'South Korea', lat: 36.4, lon: 127.8 },
  '台湾': { code: 'TW', atlasName: 'Taiwan', lat: 23.7, lon: 120.9 },
  '斐济': { code: 'FJ', atlasName: 'Fiji', lat: -17.7, lon: 177.9 },
  '所罗门群岛': { code: 'SB', atlasName: 'Solomon Is.', lat: -9.6, lon: 160.2 },
  '瓦努阿图': { code: 'VU', atlasName: 'Vanuatu', lat: -16.4, lon: 167.7 },
  '萨摩亚': { code: 'WS', lat: -13.8, lon: -172.1 },
  // 大洋洲
  '澳大利亚': { code: 'AU', atlasName: 'Australia', lat: -25.3, lon: 133.8 },
  '新西兰': { code: 'NZ', atlasName: 'New Zealand', lat: -41.8, lon: 172.8 },
  // 欧洲
  '意大利': { code: 'IT', atlasName: 'Italy', lat: 42.8, lon: 12.8 },
  '法国': { code: 'FR', atlasName: 'France', lat: 46.6, lon: 2.5 },
  '比利时': { code: 'BE', atlasName: 'Belgium', lat: 50.6, lon: 4.7 },
  '瑞士': { code: 'CH', atlasName: 'Switzerland', lat: 46.8, lon: 8.2 },
  '英国': { code: 'GB', atlasName: 'United Kingdom', lat: 54.0, lon: -2.5 },
  '美国': { code: 'US', atlasName: 'United States of America', lat: 39.8, lon: -98.6 },
  '德国': { code: 'DE', atlasName: 'Germany', lat: 51.2, lon: 10.4 },
  '西班牙': { code: 'ES', atlasName: 'Spain', lat: 40.3, lon: -3.7 },
  '荷兰': { code: 'NL', atlasName: 'Netherlands', lat: 52.3, lon: 5.3 },
  '葡萄牙': { code: 'PT', atlasName: 'Portugal', lat: 39.5, lon: -8.0 },
  '奥地利': { code: 'AT', atlasName: 'Austria', lat: 47.7, lon: 14.5 },
  '瑞典': { code: 'SE', atlasName: 'Sweden', lat: 62.3, lon: 15.0 },
  '丹麦': { code: 'DK', atlasName: 'Denmark', lat: 56.0, lon: 9.5 },
  '挪威': { code: 'NO', atlasName: 'Norway', lat: 61.0, lon: 9.0 },
  '芬兰': { code: 'FI', atlasName: 'Finland', lat: 63.5, lon: 26.0 },
  '波兰': { code: 'PL', atlasName: 'Poland', lat: 52.2, lon: 19.4 },
  '匈牙利': { code: 'HU', atlasName: 'Hungary', lat: 47.2, lon: 19.5 },
  '捷克': { code: 'CZ', atlasName: 'Czechia', lat: 49.8, lon: 15.5 },
  '希腊': { code: 'GR', atlasName: 'Greece', lat: 39.1, lon: 22.4 },
  '土耳其': { code: 'TR', atlasName: 'Turkey', lat: 39.0, lon: 35.2 },
  '俄罗斯': { code: 'RU', atlasName: 'Russia', lat: 61.5, lon: 95.0 },
  '乌克兰': { code: 'UA', atlasName: 'Ukraine', lat: 49.0, lon: 31.0 },
  '冰岛': { code: 'IS', atlasName: 'Iceland', lat: 64.9, lon: -18.8 },
  '爱尔兰': { code: 'IE', atlasName: 'Ireland', lat: 53.2, lon: -8.0 },
};

/** 从一条品鉴记录的产地文本中提取所有匹配的国家 */
export function extractCountries(text: string | undefined): CountryInfo[] {
  if (!text) return [];
  const found: CountryInfo[] = [];
  for (const [zh, info] of Object.entries(COUNTRY_GEO)) {
    if (text.includes(zh) && !found.some(f => f.code === info.code)) {
      found.push({ ...info, zhName: zh });
    }
  }
  return found;
}

export interface Footprint {
  code: string;
  info: CountryInfo;
  count: number;
  names: string[];     // 相关巧克力名称
  kinds: Set<string>;  // 'cocoa' | 'flavor'
}

/** 汇总全部品鉴记录，生成巧克力足迹 */
export function buildFootprint(reviews: ChocolateReview[]): Footprint[] {
  const map = new Map<string, Footprint>();
  for (const r of reviews) {
    const cocoa = extractCountries(r.origin);
    const flavor = extractCountries(r.flavorOrigin);
    const all = [...cocoa, ...flavor];
    for (const info of all) {
      let fp = map.get(info.code);
      if (!fp) {
        fp = { code: info.code, info, count: 0, names: [], kinds: new Set() };
        map.set(info.code, fp);
      }
      fp.count++;
      if (!fp.names.includes(r.name)) fp.names.push(r.name);
      if (cocoa.some(c => c.code === info.code)) fp.kinds.add('cocoa');
      if (flavor.some(c => c.code === info.code)) fp.kinds.add('flavor');
    }
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}
