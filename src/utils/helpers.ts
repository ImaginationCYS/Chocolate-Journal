import { format, formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '未知日期';
    return format(d, 'yyyy/MM/dd', { locale: zhCN });
  } catch {
    return '未知日期';
  }
}

export function formatRelative(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '未知时间';
    return formatDistanceToNow(d, { addSuffix: true, locale: zhCN });
  } catch {
    return '未知时间';
  }
}

export function formatPrice(price: number): string {
  return `¥${price.toFixed(0)}`;
}

export function getOriginCode(origin: string): string {
  const map: Record<string, string> = {
    // 南美
    '厄瓜多尔': 'EC', '秘鲁': 'PE', '委内瑞拉': 'VE', '哥伦比亚': 'CO',
    '巴西': 'BR', '玻利维亚': 'BO', '圭亚那': 'GY', '苏里南': 'SR',
    // 中北美
    '伯利兹': 'BZ', '多米尼加': 'DO', '海地': 'HT', '牙买加': 'JM',
    '墨西哥': 'MX', '格林纳达': 'GD', '哥斯达黎加': 'CR', '巴拿马': 'PA',
    '古巴': 'CU', '尼加拉瓜': 'NI', '洪都拉斯': 'HN', '危地马拉': 'GT',
    '特立尼达和多巴哥': 'TT', '特立尼达': 'TT',
    // 非洲
    '马达加斯加': 'MG', '坦桑尼亚': 'TZ', '加纳': 'GH', '科特迪瓦': 'CI',
    '乌干达': 'UG', '尼日利亚': 'NG', '喀麦隆': 'CM', '圣多美和普林西比': 'ST',
    '圣多美': 'ST', '塞拉利昂': 'SL', '利比里亚': 'LR', '多哥': 'TG',
    '刚果': 'CD', '刚果民主共和国': 'CD', '肯尼亚': 'KE', '卢旺达': 'RW',
    // 亚洲
    '越南': 'VN', '印度尼西亚': 'ID', '菲律宾': 'PH', '巴布亚新几内亚': 'PG',
    '泰国': 'TH', '印度': 'IN', '马来西亚': 'MY', '斯里兰卡': 'LK',
    '中国': 'CN', '日本': 'JP', '韩国': 'KR', '台湾': 'TW',
    '斐济': 'FJ', '所罗门群岛': 'SB', '瓦努阿图': 'VU', '萨摩亚': 'WS',
    // 大洋洲
    '澳大利亚': 'AU', '新西兰': 'NZ',
    // 欧洲
    '意大利': 'IT', '法国': 'FR', '比利时': 'BE', '瑞士': 'CH',
    '英国': 'GB', '美国': 'US', '德国': 'DE', '西班牙': 'ES',
    '荷兰': 'NL', '葡萄牙': 'PT', '奥地利': 'AT', '瑞典': 'SE',
    '丹麦': 'DK', '挪威': 'NO', '芬兰': 'FI', '波兰': 'PL',
    '匈牙利': 'HU', '捷克': 'CZ', '希腊': 'GR', '土耳其': 'TR',
    '俄罗斯': 'RU', '乌克兰': 'UA', '冰岛': 'IS', '爱尔兰': 'IE',
    // 英文
    'Ecuador': 'EC', 'Peru': 'PE', 'Venezuela': 'VE', 'Colombia': 'CO',
    'Brazil': 'BR', 'Bolivia': 'BO', 'Guyana': 'GY', 'Suriname': 'SR',
    'Belize': 'BZ', 'Dominican': 'DO', 'Haiti': 'HT', 'Jamaica': 'JM',
    'Mexico': 'MX', 'Grenada': 'GD', 'Costa Rica': 'CR', 'Panama': 'PA',
    'Cuba': 'CU', 'Nicaragua': 'NI', 'Honduras': 'HN', 'Guatemala': 'GT',
    'Trinidad': 'TT',
    'Madagascar': 'MG', 'Tanzania': 'TZ', 'Ghana': 'GH', 'Ivory Coast': 'CI',
    'Uganda': 'UG', 'Nigeria': 'NG', 'Cameroon': 'CM', 'Sao Tome': 'ST',
    'Sierra Leone': 'SL', 'Liberia': 'LR', 'Togo': 'TG', 'Congo': 'CD',
    'Kenya': 'KE', 'Rwanda': 'RW',
    'Vietnam': 'VN', 'Indonesia': 'ID', 'Philippines': 'PH',
    'Papua New Guinea': 'PG', 'Thailand': 'TH', 'India': 'IN',
    'Malaysia': 'MY', 'Sri Lanka': 'LK',
    'China': 'CN', 'Japan': 'JP', 'Korea': 'KR', 'Taiwan': 'TW',
    'Fiji': 'FJ', 'Solomon Islands': 'SB', 'Vanuatu': 'VU', 'Samoa': 'WS',
    'Australia': 'AU', 'New Zealand': 'NZ',
    'Italy': 'IT', 'France': 'FR', 'Belgium': 'BE', 'Switzerland': 'CH',
    'UK': 'GB', 'USA': 'US', 'Germany': 'DE', 'Spain': 'ES',
    'Netherlands': 'NL', 'Portugal': 'PT', 'Austria': 'AT', 'Sweden': 'SE',
    'Denmark': 'DK', 'Norway': 'NO', 'Finland': 'FI', 'Poland': 'PL',
    'Hungary': 'HU', 'Czech': 'CZ', 'Greece': 'GR', 'Turkey': 'TR',
    'Russia': 'RU', 'Ukraine': 'UA', 'Iceland': 'IS', 'Ireland': 'IE',
  };
  for (const [key, code] of Object.entries(map)) {
    if (origin.includes(key)) return code;
  }
  // 兜底：如果是纯中文且无匹配，尝试匹配前两个字
  const firstTwo = origin.slice(0, 2);
  const secondTry = Object.entries(map).find(([k]) => k.startsWith(firstTwo) || k.includes(firstTwo));
  if (secondTry) return secondTry[1];
  return '--';
}

/** @deprecated 使用 getOriginCode 替代，统一显示为缩写 */
export function getOriginFlag(origin: string): string {
  return getOriginCode(origin);
}
