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

export function getOriginFlag(origin: string): string {
  const map: Record<string, string> = {
    '厄瓜多尔': '🇪🇨', '秘鲁': '🇵🇪', '委内瑞拉': '🇻🇪', '哥伦比亚': '🇨🇴',
    '巴西': '🇧🇷', '马达加斯加': '🇲🇬', '坦桑尼亚': '🇹🇿', '加纳': '🇬🇭',
    '科特迪瓦': '🇨🇮', '越南': '🇻🇳', '印度尼西亚': '🇮🇩', '菲律宾': '🇵🇭',
    '伯利兹': '🇧🇿', '多米尼加': '🇩🇴', '海地': '🇭🇹', '牙买加': '🇯🇲',
    '墨西哥': '🇲🇽', '格林纳达': '🇬🇩', '巴布亚新几内亚': '🇵🇬',
    '中国': '🇨🇳', '日本': '🇯🇵', '意大利': '🇮🇹', '法国': '🇫🇷',
    '比利时': '🇧🇪', '瑞士': '🇨🇭', '英国': '🇬🇧', '美国': '🇺🇸',
  };
  for (const [key, flag] of Object.entries(map)) {
    if (origin.includes(key)) return flag;
  }
  return '🌍';
}
