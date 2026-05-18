# Changelog

All notable changes to ui-modernizer will be documented here. Format inspired by [Keep a Changelog](https://keepachangelog.com).

## [0.9.0] — 2026-05-18

### Added
- **`UMD-NNN` error code system.** Every script that can fail now emits a structured error with a code, title, one-paragraph remedy, and docs link. ~20 codes covering detection (UMD-001-003), config (UMD-010-012), backup (UMD-020-021), visual regression (UMD-030-032), AST (UMD-040-041), profiles (UMD-050-052), and substitution (UMD-060-061).
- New reference: `references/error-codes.md` — full catalog with cause + remedy for every code.
- New helper: `scripts/_errors.mjs` — exports `ERRORS` registry, `makeError(code, details)`, and `didYouMean(input, candidates)`.
- New helper: `scripts/_response.mjs` — exports `success(command, payload)` and `failure(command, errors)` builders that wrap output in a consistent envelope:
  ```
  { ok, command, version, timestamp, payload | errors, warnings }
  ```
- **"Did you mean?" suggestions** based on Levenshtein distance. Typing `profile: "lineer"` now surfaces `didYouMean: "linear"` in the error details. Applies to profile names, brand classPrefix, and substitution component names.
- **Vitest test suite.** Setup file `vitest.config.mjs` + initial tests in `tests/`:
  - `errors.test.mjs` — error registry, makeError, didYouMean
  - `load-config.test.mjs` — config loading, merge, validation, error codes
  - `ast-extract.test.mjs` — Vue/Svelte best-effort scanners, graceful degradation
- New npm scripts: `npm test` (run once), `npm run test:watch` (watch mode).
- CI runs `npm test` on every push and PR.

### Changed
- `scripts/load-config.mjs` — now emits `UMD-010` / `UMD-011` / `UMD-012` error codes with structured details (field name, what's invalid, did-you-mean suggestion). JSON output uses the unified envelope shape.
- `SKILL.md` — section 4 (Failure modes) now points at `references/error-codes.md` and instructs Claude to relay codes verbatim when surfacing errors.
- `package.json` — version bumped to `0.9.0`; added `vitest` to devDependencies; added `test` / `test:watch` scripts.
- `.github/workflows/ci.yml` — adds `npm install` + `npm test` steps after the profile validation.

### Not changed (deliberate)
- `bin/install.mjs` — Skill install flow unchanged; vitest is `devDependencies` only so end-users never see it.
- Other scripts (`detect-stack`, `detect-brand`, `dry-run`, etc.) still output their pre-v0.9 shape — they'll migrate to the unified envelope incrementally in v0.9.x patches without breaking changes.
- `extractFile()` / other v0.7 / v0.8 APIs — unchanged.

**新增**
- **`UMD-NNN` 错误码体系**。每个可能失败的脚本现在都会发出结构化错误,包含 code、title、一段补救说明、文档链接。约 20 个码,覆盖检测(UMD-001-003)、配置(UMD-010-012)、备份(UMD-020-021)、视觉回归(UMD-030-032)、AST(UMD-040-041)、profile(UMD-050-052)、替换(UMD-060-061)。
- 新增参考文档:`references/error-codes.md` —— 每个码的完整目录,含原因 + 补救。
- 新增辅助模块:`scripts/_errors.mjs` —— 导出 `ERRORS` 注册表、`makeError(code, details)`、`didYouMean(input, candidates)`。
- 新增辅助模块:`scripts/_response.mjs` —— 导出 `success(command, payload)` 和 `failure(command, errors)` 构造器,把输出包成统一信封:
  ```
  { ok, command, version, timestamp, payload | errors, warnings }
  ```
- **"Did you mean?" 提示**(基于 Levenshtein 距离)。配置写错 `profile: "lineer"` 时错误详情里会出现 `didYouMean: "linear"`。适用于 profile 名、brand classPrefix、替换组件名。
- **Vitest 测试套件**。配置文件 `vitest.config.mjs` + `tests/` 初始测试:
  - `errors.test.mjs` —— 错误注册表、makeError、didYouMean
  - `load-config.test.mjs` —— 配置加载、合并、校验、错误码
  - `ast-extract.test.mjs` —— Vue/Svelte 扫描器、优雅降级
- 新增 npm 脚本:`npm test`(跑一次)、`npm run test:watch`(监听模式)。
- CI 每次 push / PR 都跑 `npm test`。

**改动**
- `scripts/load-config.mjs` —— 发出 `UMD-010` / `UMD-011` / `UMD-012` 错误码,带结构化详情(字段名、什么无效、did-you-mean 建议)。JSON 输出使用统一信封形状。
- `SKILL.md` —— 第 4 节(失败模式)指向 `references/error-codes.md`,指示 Claude 在向用户反馈错误时原样转述错误码。
- `package.json` —— 版本升到 `0.9.0`;`vitest` 加进 devDependencies;新增 `test` / `test:watch` 脚本。
- `.github/workflows/ci.yml` —— 在 profile 校验之后加 `npm install` + `npm test` 步骤。

**未改动**(刻意)
- `bin/install.mjs` —— Skill 安装流程不变;vitest 只在 devDependencies,终端用户看不到。
- 其他脚本(`detect-stack`、`detect-brand`、`dry-run` 等)仍输出 v0.9 之前的形状 —— 它们会在 v0.9.x 补丁版本里平滑迁移到统一信封,不会破坏向后兼容。
- `extractFile()` / 其他 v0.7 / v0.8 API —— 不变。

---

## [0.8.0] — 2026-05-18

### Added
- **`.ui-modernizer.json` project config.** Drop this file at your project root to encode team-level defaults: which profile, which files to ignore, hard cap on files, strict mode, screenshot routes, substitution component allowlist, AST-required gate.
- New script: `scripts/load-config.mjs` — loads the config, merges with defaults, validates, and reports warnings/errors. CLI: `node scripts/load-config.mjs --pretty`. Programmatic: `import { loadConfig } from './scripts/load-config.mjs'`.
- New script: `scripts/dry-run.mjs` — read-only modernization preview. Walks all UI files (honoring `ignore` and `maxFiles`), counts stale class patterns by rule and by file, exits 0 normally or 1 in `--ci` / `strict` mode if any candidates exist. Drop-in for `pre-commit` and CI lint jobs.
- New reference: `references/config-file.md` — full schema, field-by-field reference, common recipes.
- New example file: `.ui-modernizer.example.json` — copy to `.ui-modernizer.json` and customize.

### Changed
- `SKILL.md` — added Step 0 (LOAD CONFIG) before detection. Step 2 (PLAN) now respects `profile`, `brand` override, `ignore`, `maxFiles`, and `strict` from the config.
- `scripts/ast-extract.mjs` — refactored to export `extractFile()`, `extractJSX()`, `extractVue()`, `extractSvelte()` while keeping the CLI entry intact (gated by `if (isMain)`). `dry-run.mjs` consumes the exports.

### Not changed
- v0.7 AST extraction behavior — unchanged. Same output shape.
- Visual regression, substitution, profiles — independent, still work.
- Backup / rollback / report — unchanged.

**新增**
- **`.ui-modernizer.json` 项目级配置**。在项目根目录放这个文件,把团队级默认行为固化下来:用哪个 profile、忽略哪些文件、单次最大文件数、严格模式、截图路由、可替换组件白名单、AST 是否强制。
- 新增脚本:`scripts/load-config.mjs` —— 读取配置、合并默认值、校验、输出 warnings / errors。CLI:`node scripts/load-config.mjs --pretty`。也可作为模块 import。
- 新增脚本:`scripts/dry-run.mjs` —— 只读的现代化预览。扫描所有 UI 文件(尊重 `ignore` 和 `maxFiles`),按规则和按文件统计陈旧 class 模式,正常退出 0,在 `--ci` 或 `strict: true` 模式下发现候选时退出 1。可直接挂在 `pre-commit` 或 CI lint job 上。
- 新增参考文档:`references/config-file.md` —— 完整 schema、逐字段说明、常用 recipe。
- 新增示例文件:`.ui-modernizer.example.json` —— 复制为 `.ui-modernizer.json` 后自定义。

**改动**
- `SKILL.md` —— 在检测前新增 Step 0(LOAD CONFIG)。Step 2(PLAN)现在尊重配置里的 `profile`、`brand` 覆盖、`ignore`、`maxFiles`、`strict`。
- `scripts/ast-extract.mjs` —— 重构以 export `extractFile()` / `extractJSX()` / `extractVue()` / `extractSvelte()`,同时保留 CLI 入口(用 `if (isMain)` 守护)。`dry-run.mjs` 使用这些 export。

**未改动**
- v0.7 AST 提取行为 —— 不变。输出格式相同。
- 视觉回归、替换、profile —— 独立,继续工作。
- 备份 / 回滚 / 报告 —— 不变。

---

## [0.7.0] — 2026-05-18

### Added
- **AST-based class-string extraction.** New `scripts/ast-extract.mjs` lists every Tailwind class string in a JSX / TSX / Vue / Svelte file with line+column, kind, and an `editable` flag — so the modernizer can edit only strings that are guaranteed static class containers.
  - **JSX / TSX** uses `@babel/parser` + `@babel/traverse` (already in `optionalDependencies`). Handles: `className="..."`, `className={"..."}`, template-literal quasis, `cn()` / `clsx()` / `classNames()` / `twMerge()` / `twJoin()` / `cva()` arguments, conditional expressions, object property keys.
  - **Vue** uses a tightened template-only scanner (script/style blocks masked). `class="..."` and string literals inside `:class="[...]"` / `:class="{...}"` are extracted. Full `vue-eslint-parser` integration is a v0.8 stretch goal.
  - **Svelte** uses a markup-only scanner (script/style blocks masked). `class="..."` is editable; `class:foo={bool}` directives are flagged `editable: false`.
  - Graceful degradation: if `@babel/parser` isn't installed, the script exits with `{ ok: false, reason: 'parser-missing' }` and the modernizer falls back to v0.6-style regex.
- New CLI mode for testing: `node scripts/ast-extract.mjs <file> --pretty`.
- New reference: `references/ast-safety.md` — the contract, what gets extracted per framework, recognized class-merger functions, known limitations.

### Changed
- `SKILL.md` Step 5 (APPLY) — recommends running `ast-extract` first to identify safe strings, then editing only `editable: true` entries. Added 2 new failure-mode rows (parser missing, editable: false).
- README hero — added a `<img src="./assets/before-after.png">` reference at the top of both English and Chinese READMEs (drop your screenshot in `assets/`).

### Not changed
- v0.6 visual regression flow — independent, still runs.
- Backup / rollback / report — unchanged.
- The Skill's hard rule "never touch business logic" remains — v0.7 just makes it mechanically verifiable for JSX/TSX.

**新增**
- **基于 AST 的 class 字符串提取**。新增 `scripts/ast-extract.mjs`,列出 JSX / TSX / Vue / Svelte 文件里每一个 Tailwind class 字符串,带行号、列号、kind 和 `editable` 标志 —— 现代化时只编辑那些"已被 AST 确认为静态 class 容器"的字符串。
  - **JSX / TSX** 使用 `@babel/parser` + `@babel/traverse`(已在 `optionalDependencies` 里)。覆盖:`className="..."`、`className={"..."}`、模板字符串 quasi、`cn()` / `clsx()` / `classNames()` / `twMerge()` / `twJoin()` / `cva()` 的参数、条件表达式、对象属性 key。
  - **Vue** 用收紧后的"仅 template 块"扫描器(script / style 块被屏蔽)。`class="..."` 和 `:class="[...]"` / `:class="{...}"` 里的字符串字面量都被提取。完整 `vue-eslint-parser` 接入是 v0.8 的延伸目标。
  - **Svelte** 用"仅 markup"扫描器(script / style 块被屏蔽)。`class="..."` 可编辑;`class:foo={bool}` 指令被标为 `editable: false`。
  - 优雅降级:`@babel/parser` 没装时脚本以 `{ ok: false, reason: 'parser-missing' }` 退出,现代化流程回退到 v0.6 风格的正则提取。
- 新增 CLI 测试模式:`node scripts/ast-extract.mjs <file> --pretty`。
- 新增参考文档:`references/ast-safety.md` —— 契约、每种框架抓什么、已识别的 class 合并函数、已知局限。

**改动**
- `SKILL.md` Step 5(APPLY)—— 推荐先跑 `ast-extract` 识别安全字符串,然后只编辑 `editable: true` 的条目。新增 2 条失败模式说明(parser 缺失、`editable: false`)。
- README hero —— 在中英 README 顶部加入 `<img src="./assets/before-after.png">` 引用(把你的截图放进 `assets/` 即可显示)。

**未改动**
- v0.6 视觉回归流程 —— 独立,继续运行。
- 备份 / 回滚 / 报告 —— 不变。
- Skill 的硬性规则"不动业务逻辑" —— 不变。v0.7 只是让这条规则在 JSX/TSX 上变得**可机械验证**。

---

## [0.6.0] — 2026-05-17

### Added
- **Visual regression checks.** Two new scripts capture structural + computed-style snapshots of every detected route — before any edit and after — then diff them and surface findings as a "Risks" section in `report.md`.
  - `scripts/visual-snapshot.mjs <before|after>` — Playwright-backed; captures up to 5000 elements per route with their tag/role/aria/text/computed-style into `.ui-modernizer/snapshots/<phase>/<route>.json`. Falls back silently if Playwright isn't installed.
  - `scripts/visual-diff.mjs` — compares the two snapshots and emits `.ui-modernizer/risks.json` with severity-tagged findings (high / medium / info).
- **Risk categories (high severity):**
  - Missing interactive element (`button`, `a`, `input`, `form`, `label`) or aria-labeled element.
  - Role lost (`role="button"` → none).
  - aria-label / aria-labelledby disappeared.
  - WCAG AA contrast regression (text contrast dropped below 4.5:1).
- **Risk categories (medium severity):** tag changed, role added unexpectedly, contrast dropped notably but still above AA, font-size shrunk > 20%.
- **Risk categories (info):** color/background shifted on headings (modernization does this on purpose — visible for sanity check), new elements added.
- `report.md` now has a `## ⚠️ Risks` section, per-route, sorted high → medium → info, capped at 20 findings per route (full data in `risks.json`).
- New reference: `references/visual-regression.md` — what's captured, risk categories table, how to read the report, honest limitations.

### Changed
- `SKILL.md` Step 4 — was "SCREENSHOT BEFORE", now "VISUAL SNAPSHOT BEFORE". PNG screenshots become optional sub-step.
- `SKILL.md` Step 6 — was "SCREENSHOT AFTER", now "VISUAL SNAPSHOT AFTER + DIFF" (runs both `visual-snapshot.mjs after` and `visual-diff.mjs`).
- `SKILL.md` Step 7 (REPORT) — explicitly mentions the new Risks section.
- `scripts/report.mjs` — reads `risks.json` if present and embeds findings; gracefully omits the section if absent.

### Not changed
- Backup / rollback flow — unchanged.
- The modernizer **never auto-reverts** based on risks. Risks are surfaced; the user decides what's intentional vs. accidental.
- Screenshot scripts (`screenshot.mjs`, `compose-before-after.mjs`) — kept; can run in parallel with snapshots if the user wants PNGs.

**新增**
- **视觉回归测试**。两个新脚本在改之前和改之后各抓一次每个路由的结构 + 计算样式快照,再 diff 出风险条目,以 "Risks" 章节写进 `report.md`。
  - `scripts/visual-snapshot.mjs <before|after>` —— 基于 Playwright;每个路由最多抓 5000 个元素的 tag/role/aria/text/computed-style,输出到 `.ui-modernizer/snapshots/<阶段>/<路由>.json`。Playwright 未装时静默降级。
  - `scripts/visual-diff.mjs` —— 比较两份快照,输出 `.ui-modernizer/risks.json`,带 severity 标签(high / medium / info)。
- **风险分类(高严重)**:
  - 交互元素(`button` / `a` / `input` / `form` / `label`)或带 aria 标签的元素消失。
  - role 丢失(`role="button"` → 无)。
  - aria-label / aria-labelledby 消失。
  - WCAG AA 对比度回归(文本对比度跌破 4.5:1)。
- **风险分类(中严重)**:tag 变了、role 莫名其妙加上去了、对比度明显下降但仍高于 AA、字号缩水超过 20%。
- **风险分类(info)**:标题色/背景色变化(现代化本身就会做这事,展示出来供用户复核)、新增元素。
- `report.md` 现在有 `## ⚠️ Risks` 章节,按路由展开,高→中→info 排序,每个路由最多展示 20 条(完整数据在 `risks.json`)。
- 新增参考文档:`references/visual-regression.md` —— 抓什么、风险分类表、如何阅读报告、诚实的局限性。

**改动**
- `SKILL.md` Step 4 —— 原"SCREENSHOT BEFORE",现"VISUAL SNAPSHOT BEFORE"。PNG 截图变成可选子步骤。
- `SKILL.md` Step 6 —— 原"SCREENSHOT AFTER",现"VISUAL SNAPSHOT AFTER + DIFF"(同时跑 `visual-snapshot.mjs after` 和 `visual-diff.mjs`)。
- `SKILL.md` Step 7(REPORT)—— 明确提到新的 Risks 章节。
- `scripts/report.mjs` —— 如果存在 `risks.json` 就读取并嵌入;不存在则优雅省略。

**未改动**
- 备份 / 回滚流程 —— 不变。
- modernizer **绝不**基于风险自动回滚。风险只是被展示出来,哪个是有意、哪个是误伤由用户判断。
- 截图脚本(`screenshot.mjs`、`compose-before-after.mjs`)—— 保留;用户想要 PNG 时可以和快照同时跑。

---

## [0.5.0] — 2026-05-17

### Added
- **Component substitution.** Opt-in via *"modernize this UI **and use shadcn**"* (or *"with shadcn components"*, *"replace primitives"*, *"auto-install shadcn"*). The Skill now:
  1. Scans every UI file via `scripts/detect-substitutions.mjs` (new) for hand-rolled native elements that match shadcn primitive shapes.
  2. Shows a plan: which shadcn components will be installed, how many candidates, which files.
  3. Asks the user to confirm.
  4. Initializes shadcn (interactively) if `components.json` is missing.
  5. Runs `npx shadcn@latest add <list>`.
  6. Rewrites the candidate elements, adds imports, preserves every event handler / ref / `aria-*` / `data-*`.
  7. Type-checks afterward (if TypeScript present); on failure, rolls back substitution edits while preserving the className modernization.
- **7 substitution rules** in MVP — Button, Input, Textarea, Label, Badge, Separator, Avatar — with variant + size inference from class signatures.
- **Card pattern recognition** documented in `references/shadcn-component-map.md` — multi-child cards are rewritten to `<Card>` + `<CardHeader>` + `<CardContent>`.
- New reference: `references/component-substitution.md` — opt-in trigger, 5-stage workflow, safety rules, framework notes (shadcn-vue / shadcn-svelte for non-React projects).
- New reference: `references/shadcn-component-map.md` — per-pattern rewriting guide, variant detection table, universal preserve / drop lists.
- New script: `scripts/detect-substitutions.mjs` — read-only detector; outputs JSON plan or `--pretty` table; supports `--files a.tsx,b.tsx` override.

### Changed
- `SKILL.md` — inserted Step 5b (COMPONENT SUBSTITUTION) between APPLY and SCREENSHOT-AFTER, gated on user opt-in language. Added 3 new failure-mode rows.
- README × 2 — added a "Want shadcn primitives? Just ask." subsection under "Pick a vibe".

### Not changed
- All previous-version detectors (stack / brand / profiles) — unchanged.
- Backup / rollback / report flow — unchanged. The new substitution layer is *additionally* rolled back if typecheck fails.
- Vue / Svelte path: substitution runs against `shadcn-vue` / `shadcn-svelte` ports; if those aren't set up, the step is skipped (not failed).

**新增**
- **组件级替换**。需用户在对话里明确说**"and use shadcn"**（或 "with shadcn components"、"replace primitives"、"auto-install shadcn"）才会触发。开启后 Skill 会：
  1. 跑新增脚本 `scripts/detect-substitutions.mjs`，扫描所有 UI 文件里手写的、形似 shadcn primitive 的原生元素。
  2. 展示计划：要装哪些 shadcn 组件、有多少候选、涉及哪些文件。
  3. 等用户确认。
  4. 如果项目里没有 `components.json`，先**交互式**跑 `npx shadcn@latest init`。
  5. 跑 `npx shadcn@latest add <列表>` 一次性安装。
  6. 重写候选元素、补 import，**完整保留** event handler / ref / `aria-*` / `data-*`。
  7. 跑 type-check（如果项目有 TS）。出错时**只回滚替换层**，保留 className 现代化的成果。
- **7 条 MVP 替换规则**：Button / Input / Textarea / Label / Badge / Separator / Avatar，根据 class 特征自动推断 variant 和 size。
- **Card 模式识别**：多子元素的卡片会被重写为 `<Card>` + `<CardHeader>` + `<CardContent>`，文档在 `references/shadcn-component-map.md`。
- 新增参考文档：`references/component-substitution.md`（触发条件、5 步工作流、安全规则、Vue/Svelte 适配说明）。
- 新增参考文档：`references/shadcn-component-map.md`（逐 pattern 重写指南、variant 检测表、通用保留/删除清单）。
- 新增脚本：`scripts/detect-substitutions.mjs`（只读扫描；JSON 输出 + `--pretty` 表格；支持 `--files a.tsx,b.tsx` 指定文件）。

**改动**
- `SKILL.md` 在 APPLY 与 SCREENSHOT-AFTER 之间插入 **Step 5b · COMPONENT SUBSTITUTION**，靠 opt-in 触发；新增 3 条失败模式说明。
- 中英 README 在 "Pick a vibe" 下加入"Want shadcn primitives? Just ask."小节。

**未改动**
- 之前版本的所有检测器（stack / brand / profiles）—— 完全保持。
- 备份 / 回滚 / 报告流程 —— 不变。新替换层会额外独立回滚（typecheck 失败时）。
- Vue / Svelte：替换走 `shadcn-vue` / `shadcn-svelte`；项目里没装就静默跳过，不报错。

---

## [0.4.0] — 2026-05-17

### Added
- **Pluggable style profiles.** Style references are now formal, validated, pluggable extensions:
  - Profile **format spec** at `references/style-references/_PROFILE_FORMAT.md` (v1.0): required YAML frontmatter (`name`, `displayName`, `version`, `vibe`, `darkFirst`, `recommendedFonts`, `authors`) + required body sections (`## Tokens`, `## Patterns`, `## Don'ts`).
  - **Bring-your-own profile**: users can now say *"modernize this UI using `./our-brand.md`"* and ui-modernizer will load any local Markdown file conforming to the spec.
  - **Validation script** `scripts/validate-profile.mjs` — checks frontmatter and required sections. CI runs it on every PR via `--all`.
  - **Listing script** `scripts/list-profiles.mjs` — outputs JSON or a pretty table of every available profile. Run when the user asks "what styles are available?".
- **3 new built-in profiles** seeded the system:
  - `notion` — warm, calm, generous whitespace.
  - `raycast` — dark-first, dense, command-bar energy.
  - `apple` — premium pill buttons, soft shadows, glass.
- New reference: `references/profile-pluggability.md` — the full override hierarchy (brand color > profile > design-system default), profile resolution rules, contribution workflow.

### Changed
- All 4 existing built-in profiles (`linear`, `vercel`, `stripe`, `shadcn`) — added required frontmatter and re-shaped to include `## Tokens`, `## Patterns`, `## Don'ts` sections. `shadcn` profile expanded with explicit pattern snippets.
- `SKILL.md` Section 3 — rewrote "Sub-modes" into a formal "Style profiles" sub-section: resolution table, validation step, override-hierarchy pointer.
- README "Pick a vibe" code block — now lists all 7 built-in profiles with one-line descriptions plus the bring-your-own syntax.
- README "Contributing" — updated to the 4-step profile-contribution flow with local validation command.
- CI workflow — added `node scripts/validate-profile.mjs --all` step.

### Not changed
- Detection / brand-color / framework workflow — unchanged.

**新增**
- **可插拔风格 profile**。风格参考升级为正式的、可验证的、可插拔扩展：
  - **格式规范** v1.0 位于 `references/style-references/_PROFILE_FORMAT.md`：必填 YAML frontmatter（`name`、`displayName`、`version`、`vibe`、`darkFirst`、`recommendedFonts`、`authors`）+ 必填章节（`## Tokens`、`## Patterns`、`## Don'ts`）。
  - **用户自带 profile**：用户可以说 *"modernize this UI using `./our-brand.md`"*，ui-modernizer 会加载任意符合规范的本地 Markdown 文件。
  - **校验脚本** `scripts/validate-profile.mjs` —— 检查 frontmatter 和必填章节；CI 每次 PR 通过 `--all` 跑全量校验。
  - **列表脚本** `scripts/list-profiles.mjs` —— 输出 JSON 或可读表格列出所有 profile；当用户问"有哪些风格"时使用。
- **3 个新增内置 profile**：
  - `notion` —— 温暖、克制、充裕留白。
  - `raycast` —— 暗色优先、致密、命令行能量。
  - `apple` —— 高级感胶囊按钮、柔阴影、玻璃质感。
- 新增参考文档：`references/profile-pluggability.md` —— 完整的 override 优先级（品牌色 > profile > design-system 默认）、解析规则、贡献流程。

**改动**
- 4 个老 profile（`linear`、`vercel`、`stripe`、`shadcn`）补齐 frontmatter，并改造为 `## Tokens` / `## Patterns` / `## Don'ts` 结构；`shadcn` 还补全了显式 pattern 代码片段。
- `SKILL.md` 第 3 节"Sub-modes"重写为正式的"Style profiles"小节：解析表、校验步骤、override 优先级指针。
- README "Pick a vibe" 代码块列出全部 7 个内置 profile + 自带语法。
- README "Contributing" 改为 4 步 profile 贡献流程 + 本地校验命令。
- CI workflow 加入 `node scripts/validate-profile.mjs --all` 步骤。

**未改动**
- 检测 / 品牌色 / 框架工作流 —— 不变。

---

## [0.3.0] — 2026-05-17

### Added
- **Vue 3 support** — Nuxt 3 *and* Vue + Vite both supported. Detector recognizes Nuxt by the `nuxt` dependency and walks `pages/`, `components/`, `layouts/`, `app.vue`. Globals CSS is located at the Nuxt-conventional `assets/css/main.css` (or fall-throughs).
- **Svelte 5 support** — SvelteKit *and* Svelte + Vite both supported. Detector recognizes SvelteKit by `@sveltejs/kit` and walks `src/routes/`, `src/lib/`, `src/components/`. Globals CSS is located at `src/app.css` / `src/app.postcss`.
- **Runtime + framework abstraction.** `detect-stack.mjs` now reports:
  - `runtime`: `'react' | 'vue' | 'svelte'`
  - `framework`: `'next' | 'nuxt' | 'sveltekit' | 'vite'`
  - `classAttr`: `'className'` (React) or `'class'` (Vue/Svelte)
  - `fileExtensions`: `['.tsx', '.jsx']` / `['.vue']` / `['.svelte']`
- New reference: `references/frameworks/vue.md` — `class=` vs `:class=` array/object syntax, `<script setup>` boundaries, Nuxt conventions, auto-imports.
- New reference: `references/frameworks/svelte.md` — `class=` vs `class:foo={bool}` directives, SvelteKit `+layout.svelte` / `+page.svelte` conventions, scoped `<style>` blocks.

### Changed
- `SKILL.md` Step 1 now announces detected runtime, framework, Tailwind flavor, and accent in one line.
- `SKILL.md` Step 2 PLAN now uses `uiFiles[]` from the detector (which uses the right roots + extensions per runtime).
- `SKILL.md` Step 5 APPLY now references the framework guide and re-states the framework-specific skip lists.
- `references/tailwind-modernization.md` — added a v0.3 framework-agnostic note clarifying that all examples are JSX but class strings work identically in `class=` for Vue/Svelte.
- `package.json` — added `vue`, `nuxt`, `svelte`, `sveltekit` to keywords; description now lists all three runtimes.

### Not changed (deliberate)
- All visual rules in `design-system-2026.md`, `tailwind-modernization.md`, `component-patterns.md` — class names are framework-agnostic, so no edits needed.
- Backup / rollback / report behavior — fully framework-agnostic, kept stable.

**新增**
- **Vue 3 支持** —— Nuxt 3 *和* Vue + Vite 都支持。检测器通过 `nuxt` 依赖识别 Nuxt，扫描 `pages/`、`components/`、`layouts/`、`app.vue`。全局 CSS 定位在 Nuxt 约定的 `assets/css/main.css`（或其他兜底路径）。
- **Svelte 5 支持** —— SvelteKit *和* Svelte + Vite 都支持。检测器通过 `@sveltejs/kit` 识别 SvelteKit，扫描 `src/routes/`、`src/lib/`、`src/components/`。全局 CSS 定位在 `src/app.css` / `src/app.postcss`。
- **runtime + framework 抽象**。`detect-stack.mjs` 现在输出：
  - `runtime`：`'react' | 'vue' | 'svelte'`
  - `framework`：`'next' | 'nuxt' | 'sveltekit' | 'vite'`
  - `classAttr`：React 用 `'className'`，Vue/Svelte 用 `'class'`
  - `fileExtensions`：`['.tsx', '.jsx']` / `['.vue']` / `['.svelte']`
- 新增参考文档：`references/frameworks/vue.md` —— `class=` vs `:class=` 数组/对象语法、`<script setup>` 边界、Nuxt 约定、auto-import。
- 新增参考文档：`references/frameworks/svelte.md` —— `class=` vs `class:foo={bool}` 指令、SvelteKit `+layout.svelte` / `+page.svelte` 约定、scoped `<style>` 块。

**改动**
- `SKILL.md` Step 1 现在一行播报检测到的 runtime、framework、Tailwind flavor、accent。
- `SKILL.md` Step 2 PLAN 使用检测器输出的 `uiFiles[]`（每个 runtime 自动用正确的根目录 + 扩展名）。
- `SKILL.md` Step 5 APPLY 引用框架专属指南，重申框架特定的 skip list。
- `references/tailwind-modernization.md` 加入 v0.3 框架无关说明：所有示例是 JSX，但 class 字符串在 Vue/Svelte 的 `class=` 里完全等价。
- `package.json` keywords 加入 `vue`、`nuxt`、`svelte`、`sveltekit`；description 列出三种 runtime。

**未改动**（刻意）
- `design-system-2026.md`、`tailwind-modernization.md`、`component-patterns.md` 里的所有视觉规则 —— class 名是框架无关的，无需编辑。
- 备份 / 回滚 / 报告行为 —— 完全框架无关，保持稳定。

---

## [0.2.0] — 2026-05-17

### Added
- **Tailwind v4 support.** `detect-stack.mjs` now reports `tailwind.flavor` (`v3 | v4`) by parsing both the `tailwindcss` dependency version and the `@import "tailwindcss"` / `@theme` directives in `globals.css`. The Skill workflow branches on this:
  - v3 projects continue to use `templates/globals.css.tpl` + `tailwind.config.tpl`.
  - v4 projects use the new `templates/globals.v4.css.tpl` and **skip** the JS config entirely (CSS-first).
- **Custom brand color detection.** New `scripts/detect-brand.mjs` looks for an existing `brand` / `primary` / `accent` color across:
  - `tailwind.config.{js,ts,mjs}` — object form and string form.
  - `globals.css` — plain CSS variables (`--brand`, `--primary-600`).
  - `globals.css` v4 `@theme` blocks (`--color-brand-600`).
  Output classPrefix (one of `brand` / `primary` / `accent` / `indigo` fallback) is substituted everywhere the Skill would otherwise hard-code indigo.
- New reference: `references/tailwind-v4.md` — v3 → v4 class deltas and the v4 idioms.
- New reference: `references/brand-color-strategy.md` — exact rules for when to substitute, when to preserve, edge cases.
- New template: `templates/globals.v4.css.tpl` — v4-flavor globals.

### Changed
- `SKILL.md` step 1 now runs two detection scripts in sequence and announces both results.
- `SKILL.md` step 5 branches on `tailwind.flavor` and always reads `brand-color-strategy.md` before emitting any `indigo` class.
- `references/tailwind-modernization.md` — added a top-of-file note declaring `indigo` as a placeholder for the detected `classPrefix`, and a pointer to the v4 reference.
- README roadmap and "supported stacks" table updated to reflect v4 support.

### Not changed (deliberate)
- Backup / rollback / report behavior — stable.
- Existing v0.1 class-mapping rules — they still apply; only the accent name is parameterized.

**新增**
- **Tailwind v4 支持**。`detect-stack.mjs` 现在通过解析 `tailwindcss` 依赖版本号 + `globals.css` 里的 `@import "tailwindcss"` / `@theme` 指令，输出 `tailwind.flavor`（`v3 | v4`）。Skill 工作流据此分支：
  - v3 项目继续使用 `templates/globals.css.tpl` + `tailwind.config.tpl`。
  - v4 项目使用新增的 `templates/globals.v4.css.tpl`，**完全跳过** JS 配置（CSS-first）。
- **自动检测品牌色**。新增脚本 `scripts/detect-brand.mjs`，跨以下位置查找已有的 `brand` / `primary` / `accent` 颜色：
  - `tailwind.config.{js,ts,mjs}` —— 对象形式和字符串形式都识别。
  - `globals.css` —— 普通 CSS 变量（`--brand`、`--primary-600`）。
  - `globals.css` v4 `@theme` 块（`--color-brand-600`）。
  输出的 classPrefix（`brand` / `primary` / `accent` / 兜底 `indigo` 之一）会替换 Skill 默认硬编码的 indigo。
- 新增参考文档：`references/tailwind-v4.md` —— v3 → v4 的 class 差异和 v4 idioms。
- 新增参考文档：`references/brand-color-strategy.md` —— 什么时候替换、什么时候保留、边界情况的精确规则。
- 新增模板：`templates/globals.v4.css.tpl` —— v4 风格的 globals。

**改动**
- `SKILL.md` Step 1 现在依次跑两个检测脚本，两个结果都播报给用户。
- `SKILL.md` Step 5 按 `tailwind.flavor` 分支，并在生成任何 `indigo` class 之前**必读** `brand-color-strategy.md`。
- `references/tailwind-modernization.md` 顶部加入说明：`indigo` 是占位符，应替换为检测到的 `classPrefix`，并指向 v4 参考。
- README roadmap 和"支持栈"表更新以反映 v4 支持。

**未改动**（刻意）
- 备份 / 回滚 / 报告行为 —— 稳定。
- v0.1 既有的 class 映射规则 —— 全部保留；只是 accent 名参数化了。

---

## [0.1.0] — 2026-05-17

### Added
- Initial public release.
- Claude Code Skill (`SKILL.md`) with 8-step workflow (detect → plan → backup → apply → report → done).
- Knowledge base: `design-system-2026.md`, `tailwind-modernization.md`, `component-patterns.md`, `animation-motion.md`, `dark-mode.md`.
- Style profiles: `linear`, `vercel`, `stripe`, `shadcn`.
- Scripts: `detect-stack`, `backup` (with `--restore-latest`), `report`. Optional `screenshot` + `compose-before-after` (Playwright).
- Templates: `globals.css`, `tailwind.config`, `design-tokens.css`.
- `npx ui-modernizer` installer.
- Bilingual README (English + 简体中文).
- MIT license.

**新增**
- 首次公开发布。
- Claude Code Skill（`SKILL.md`），8 步工作流（检测 → 计划 → 备份 → 应用 → 报告 → 完成）。
- 知识库：`design-system-2026.md`、`tailwind-modernization.md`、`component-patterns.md`、`animation-motion.md`、`dark-mode.md`。
- 风格 profile：`linear`、`vercel`、`stripe`、`shadcn`。
- 脚本：`detect-stack`、`backup`（带 `--restore-latest`）、`report`；可选 `screenshot` + `compose-before-after`（Playwright）。
- 模板：`globals.css`、`tailwind.config`、`design-tokens.css`。
- `npx ui-modernizer` 安装器。
- 双语 README（English + 简体中文）。
- MIT 许可证。
