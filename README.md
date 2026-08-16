# 🍫 Chocolate Journal · 巧克力品鉴日志

> 用专业的五感品鉴法，记录每一块精品巧克力的风土、工艺与故事。  
> 比葡萄酒更复杂，比咖啡更细腻——欢迎踏入这个精致的感官世界。

[![Live Demo](https://img.shields.io/badge/Live-Demo-gold?style=flat-square)](https://imaginationcys.github.io/Chocolate-Journal/)
[![GitHub tag](https://img.shields.io/github/v/tag/ImaginationCYS/Chocolate-Journal?style=flat-square&color=gold)](https://github.com/ImaginationCYS/Chocolate-Journal/tags)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

---

## ✨ 功能特性

### 🍫 品鉴记录
- **五感评分体系**：外观质地（20分）→ 香气复杂度（20分）→ 风味平衡（45分）→ 余韵愉悦（15分）→ 总分 100
- **基本信息**：巧克力名称、品牌、可可产地（国家-具体产地）、可可含量、增味物种产地及品类
- **品牌智能推荐**：输入品牌时自动从已有记录中匹配补全
- **标签 & 收藏**：自定义标签 + 收藏夹管理

### 📊 统计分析
- **12 维风味雷达图**：外观光泽、断裂声响、融化质地、香气纯净、香气强度、香气层次、酸甜平衡、风味清晰、单宁涩感、余韵时长、余韵质量、个人共鸣
- **三种归一化模式**：原始线性 / 基准线 (floor=40%) / Z-Score 标准化，一键切换
- **Z-Score 平均基准线**：虚线参考圈直观判断各维度偏离均值方向
- **产地分布 TOP 榜** · **热门风味 TOP 榜** · **等级分布饼图** · **品鉴时间线**

### 🔬 风味对比
- 同时选取 2–6 款巧克力，12 维雷达图叠加对比
- 多维度对比表格，颜色编码一目了然

### � 巧克力足迹（3D 地球）
- **可交互地球**：拖拽旋转（惯性滑动）、滚轮缩放、自动旋转
- **真实世界地图**：177 国真实轮廓 + 经纬网 + 大气光晕，Canvas 手绘 3D 球体
- **足迹标记**：品鉴过的国家脉冲光点 + 涟漪环，可可产地绿色 / 增味产地棕色 / 兼有金色
- **智能悬停**：精确多边形检测 + 小国家标记点邻近兑底，背面标记三维剔除
- **足迹榜单**：中文国名 + ISO 缩写，悬停平滑展开该国巧克力列表，点击直达详情页

### �🎨 设计美学
- 深色主题 · 玻璃拟态卡片 · 金色点缀
- Framer Motion 流畅动画 · 响应式布局

---

## 🛠 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 18 + TypeScript |
| 构建 | Vite 5 |
| 样式 | Tailwind CSS 3 |
| 动画 | Framer Motion 11 |
| 图表 | Recharts 2 |
| 地理 | d3-geo 3 + topojson-client + world-atlas |
| 路由 | React Router 6 |
| 日期 | date-fns 3 |
| 图标 | Lucide React |
| 存储 | localStorage |

---

## 🚀 本地运行

```bash
# 克隆仓库
git clone https://github.com/ImaginationCYS/Chocolate-Journal.git
cd Chocolate-Journal

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

开发服务器默认运行在 `http://localhost:3721/Chocolate-Journal/`

---

## 📦 版本历史

| 版本 | 日期 | 更新内容 |
|------|------|---------|
| **v2.1.0** | 2026-08-16 | 3D 巧克力足迹地球、可可/增味分色、足迹榜单悬停展开 |
| **v2.0.0** | 2026-07-30 | 12维雷达图、对比页、三种归一化模式、品牌补全、产地缩写、表单重构 |
| v0.3.0 | 2026-07 | 修复 GitHub Pages 部署工作流 |
| v0.2.0 | 2026-07 | 添加 GitHub Pages 自动部署 |
| v0.1.0 | 2026-06 | Chocolate Journal 初始版本 |

详见 [CHANGELOG.md](CHANGELOG.md) 和 [Releases](https://github.com/ImaginationCYS/Chocolate-Journal/releases)

---

## 📁 项目结构

```
src/
├── App.tsx                    # 路由配置
├── main.tsx                   # 入口
├── index.css                  # Tailwind + 全局样式
├── components/
│   ├── AnimatedPage.tsx       # 页面过渡动画
│   ├── ChocolateCard.tsx      # 收藏卡片
│   ├── ConfirmDialog.tsx      # 确认弹窗
│   ├── EmptyState.tsx         # 空状态
│   ├── Globe.tsx              # 3D 地球（Canvas + d3-geo）
│   ├── Layout.tsx             # 布局框架
│   ├── Navbar.tsx             # 导航栏
│   ├── RadarChart.tsx         # 12维雷达图 (SVG)
│   ├── ScoreCircle.tsx        # 圆形分数
│   └── ScoreInput.tsx         # 评分滑块
├── context/
│   └── ChocolateContext.tsx   # 全局状态 + localStorage
├── pages/
│   ├── AddReviewPage.tsx      # 品鉴记录表单
│   ├── CollectionPage.tsx     # 收藏列表
│   ├── ComparePage.tsx        # 风味对比
│   ├── DetailPage.tsx         # 详情页
│   ├── GlobePage.tsx          # 巧克力足迹（3D 地球）
│   ├── HomePage.tsx           # 首页
│   └── StatsPage.tsx          # 统计分析
├── types/
│   └── index.ts               # TypeScript 类型定义
└── utils/
    ├── globe.ts               # 国家地理数据 · 足迹汇总
    ├── helpers.ts             # 格式化 · 国家代码映射
    ├── radar.ts               # 雷达图归一化算法
    └── storage.ts             # localStorage 读写
```

---

## 📝 品鉴维度说明

| 大类 | 满分 | 子维度 |
|------|:--:|------|
| 外观与质地 | 20 | 外观光泽 5 · 断裂声响 5 · 融化质地 10 |
| 香气复杂度 | 20 | 香气纯净 5 · 香气强度 5 · 香气层次 10 |
| 风味与平衡 | 45 | 酸甜平衡 15 · 风味清晰 20 · 单宁涩感 10 |
| 余韵与愉悦 | 15 | 余韵时长 5 · 余韵质量 5 · 个人共鸣 5 |
| **总计** | **100** | |

---

## 📄 License

MIT © ImaginationCYS
