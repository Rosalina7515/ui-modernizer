<div align="center">

[English](./ROADMAP.md) · **简体中文**

</div>

# 🗺️ 路线图

> 这是一份动态文档，计划可能根据社区反馈调整。想参与意见，欢迎开 [issue](https://github.com/Rosalina7515/ui-modernizer/issues) 或 [discussion](https://github.com/Rosalina7515/ui-modernizer/discussions)。

**当前状态：v1.0 已发布。** 稳定的 API 契约（SemVer 承诺）、治理文档、健康检查、41 个测试、所有脚本统一 JSON 信封、UMD-NNN 错误码。多框架（React/Vue/Svelte）、Tailwind v3+v4、品牌色检测、7 个可插拔风格 profile、opt-in 的 shadcn 组件替换、视觉回归测试、AST 安全网、`.ui-modernizer.json` 配置、dry-run 模式。

通往 v1.0 的路径**刻意**拆成多个聚焦的 minor 版本——每个都是小而可测可发的迭代。v1.0 本身是"production-ready 的承诺"，不是又一次堆功能。

---

## 🎯 通往 v1.0 的路径

### v0.6 — 视觉回归测试

**目标**：在用户察觉之前抓住意外的视觉破坏。

- 改之前抓每个路由的 DOM 结构 + 计算样式作为基准。
- 改之后再抓一次，与基准 diff。
- 把结构差异（元素丢失、标签换了）+ 计算样式差异（对比度下降、字号变化 > N%）写进 `report.md` 的新 `Risks` 章节。
- **纯检测，不自动回滚**。哪些是有意改、哪些是误伤，让用户判断。

### v0.7 — AST 安全网

**目标**：把基于正则的 class 识别换成真正的 parser。这是让"不动业务逻辑"承诺**可证明**的关键一步。

- React/JSX：用 `@babel/parser` + `@babel/traverse` 只改 `className=`。
- Vue：用 `vue-eslint-parser` 改 `<template>` 里的 `class=` 和 `:class=`。
- Svelte：用 `svelte/compiler` 的 parser 改 `class=`（跳过 `class:foo={bool}` 指令）。
- 边界情况覆盖：模板字符串、`cn()` / `clsx()` 调用、条件表达式、动态展开。
- 只在 AST 解析失败时（例如 `.mdx` 文件）回退到正则。

### v0.8 — 项目级配置 + 干运行

**目标**：让团队能编码统一规则。让 CI 能预览改动而不执行。

- `.ui-modernizer.json` schema：默认 profile、忽略 glob、单次最大文件数、严格模式（任何文件被跳过则拒绝运行）。
- `node scripts/dry-run.mjs`——以 JSON 输出完整计划，有改动则非零退出码。可直接放进 `pre-commit` 或 CI。
- 加载器读取项目根目录的 `.ui-modernizer.json`。

### v0.9 — 打磨、测试、错误体验

**目标**：让首次使用的用户不出现"WTF"时刻。

- 给 `scripts/` 下每个脚本写 Vitest 单元测试（覆盖率目标 ~80%）。
- 错误码体系（`UMD-001`…`UMD-NNN`），每个码对应一段补救说明 + 文档链接。
- 所有脚本统一 JSON 输出形状：`{ ok, command, version, timestamp, payload, errors }`。
- 长操作（替换、截图）期间显示进度。
- 输错 profile 名时给"Did you mean?"建议。

### v1.0 — 稳定、文档、营销

**目标**：production-ready 承诺 + 大爆炸级重新发布。

- 锁死 API 表面，v2.0 之前不再有 breaking changes。
- 文档站（大概率用 VitePress / Astro Starlight），域名 `ui-modernizer.dev`。
  - Algolia DocSearch 搜索（OSS 免费）。
  - profile 画廊配真实截图。
  - 互动 playground，每条规则的 before/after 代码实时展示。
- 自我提升：用 ui-modernizer 给自己的文档站做现代化。元 + 极佳 demo。
- 发布动作：HN Show、Product Hunt、dev-tools newsletter。当日目标：1000+ stars、第一个企业付费询盘。

---

## 🚀 1.0 之后（v1.x 系列）

每个 v1.x minor 打开一个新的受众。它们彼此独立，可以根据需求顺序自由调整。

### v1.1 — 测试 & 稳定性强化

Vitest 覆盖率提到 90%+，加入 10+ 真实 OSS 项目的 E2E fixtures，到处贴 badge。目标：让贡献者敢提 PR——"我改一行不会炸"。

### v1.2 — 文档站精进

如果 v1.0 上线的是基础文档站，v1.2 让它闪光：可搜索的 profile 画廊、互动 playground、贡献者排行榜、赞助商墙。每次发布都用 ui-modernizer 给自己改一遍，meta demo。

### v1.3 — AI 反向生成

镜像功能：不是改造已有 UI，而是**根据描述生成新 UI**，使用项目检测到的风格 + 选定的 profile。

> "create a settings page like Linear"

把风格 profile + shadcn 替换结合起来 scaffold 完整组件。**整个路线图里最大的市场扩张杠杆**。

### v1.4 — 可访问性（A11y）审计 + 自动修复

检测缺失的 `aria-*`、`alt`、语义角色、低对比度组合。自动补：`aria-label`、focus ring、跳转链接、键盘语义。打开合规敏感企业的大门（有真预算的买家）。

### v1.5 — 性能审计

同样思路，不同维度：过大图片、未优化字体、hydration 阻塞、布局抖动来源。Lighthouse 风格报告追加到 `report.md`。建议替换为 `next/image` / `nuxt-image` / `enhanced-img`。

### v1.6 — IDE 插件

先 VS Code，后 JetBrains。inline "可现代化"高亮、code lens、右键 "Modernize this component"。打通对话式使用和 IDE 内联使用。

### v1.7 — Figma → 代码

读 Figma API，把选中的 frame 翻译成项目风格的代码（用当前 profile + shadcn 替换）。撬动设计师群体和大公司关心的设计交付流程。

### v1.8 — 更多设计系统

v0.5 默认是 shadcn。v1.8 加入更多替换 flavor：Material 3 / MUI、Fluent UI、Carbon、Ant Design / Arco。每个基本上就是按 `references/shadcn-component-map.md` 格式写一份新规则。

### v1.9 — React Native + Expo

NativeWind 是 React Native 的 Tailwind。大部分 className 现代化逻辑可以复用。完全不同的受众（RN 开发者），复用 ~70% 的现有引擎。

### v2.0 — 完整插件系统

v0.4 的风格 profile 已经是插件化的**雏形**。v2.0 把这个泛化：检测器插件、规则插件、reporter 插件、安装器插件，参照 ESLint 的插件生态。

一旦有社区插件市场，项目就能自我延续。**长期护城河**。

---

## 🧭 战略备忘

- **每个 v0.x 都是一个独立的营销窗口。**不要急着冲 1.0。
- **真正的护城河不是代码，是 profile 库、规则的精度、生态绑定**（Claude Code / Tailwind / shadcn）。每个版本都要强化其中至少一项。
- **路线图顺序是建议，不是承诺**。如果 v1.3（AI 生成）突然需求量是 v1.2（文档打磨）的 5 倍，就调换。
- **任何 v0.x 都不能没有更新过的 `references/` 文档**。这里知识本身就是产品的一部分，不只是代码。

---

## ⛔ 明确不做的方向

我们**不会**朝这些方向发展：

- 全套 IDE 重写（Cursor / Windsurf 克隆）。
- 托管的 SaaS 版本。ui-modernizer 始终是 local-first 的。
- 闭源 / 付费高级层。保持 MIT，护城河靠 profile 贡献来筑。
- 直接竞争 v0.dev / Lovable / bolt.new。它们是**生成**工具，ui-modernizer 是**现代化**工具——给已有代码的升级路径。

---

## 🗳 想影响路线图？

- 给某个 [GitHub issue](https://github.com/Rosalina7515/ui-modernizer/issues) 点 👍 表达投票。
- 大方向提案开 [discussion](https://github.com/Rosalina7515/ui-modernizer/discussions)。
- 提交一个 profile PR——本周内能 ship 的最快路径。
