# 导学：Arya

## 1. 前置知识（面试高频标注）

| 知识点 | 为何需要 | 在本项目中的位置 | 高频度 |
|---|---|---|---|
| Vue 3 组件生命周期 | 理解编辑器初始化、销毁前保存、窗口监听清理 | `src/pages/Main.vue`、`src/pages/partials/HeaderNav.vue` | 高 |
| Pinia 状态管理 | 解释多文档列表、当前文档、正文内容如何统一管理 | `src/stores/docStore.js` | 高 |
| localStorage 与序列化 | 解释纯前端项目如何持久化文档，并处理异常数据 | `src/adapters/LocalStorageAdapter.js` | 高 |
| 适配器模式 | 说明为什么存储层可替换，而业务层不用关心底层介质 | `src/adapters/IStorage.js`、`src/adapters/LocalStorageAdapter.js` | 高 |
| Vditor 集成 | 理解编辑器黑盒实例、初始化时序、输入回调和内容设置 | `src/pages/Main.vue`、`src/components/PreviewVditor.vue` | 高 |
| 防抖保存 | 平衡输入性能与数据安全，避免每次按键都写缓存 | `src/pages/Main.vue` | 高 |
| Vue Router 懒加载 | 解释导出页如何拆分，降低首页负担 | `src/router/routes/main.js` | 中 |
| DOM 到文件导出链路 | 理解 PNG/PDF/DOCX/PPT 纯前端导出差异 | `src/pages/ExportImage.vue`、`src/pages/ExportPdf.vue`、`src/pages/ExportDocx.vue`、`src/pages/ExportPPT.vue` | 高 |
| 静态资源自托管 | 避免运行时依赖外部 CDN，保证离线或内网部署稳定性 | `package.json`、`public/vendor/html-to-docx.browser.js`、`src/pages/Main.vue` | 中 |

## 2. 重点亮点与学习顺序（先看这个）

- 亮点一：纯前端多文档持久化。为什么重要：它不是简单把一整份内容塞进 localStorage，而是把文档元数据和正文分开存储，为列表性能、删除兜底、旧数据迁移留下空间。先看 `src/adapters/IStorage.js`、`src/adapters/LocalStorageAdapter.js`、`src/stores/docStore.js`。建议顺序：接口契约 -> localStorage 实现 -> Pinia 对外动作。
- 亮点二：Vditor 黑盒状态与 Pinia 状态同步。为什么重要：Vditor 自己维护内容、光标和历史栈，Pinia 维护业务状态，二者必须明确谁是持久化真相。先看 `src/pages/Main.vue` 的 `initVditor`、`debouncedSave`、`applyVditorContent`。建议顺序：初始化 -> 输入保存 -> 切换文档。
- 亮点三：多文档切换一致性。为什么重要：切文档、删当前文档、首次打开空环境都容易造成内容覆盖或白屏。先看 `src/pages/Main.vue` 的 `onSelectDoc`、`onDocDeleted`，再看 `src/stores/docStore.js` 的 `selectDoc`、`deleteDoc`。建议顺序：用户操作 -> store 状态 -> 编辑器内容回填。
- 亮点四：纯前端导出能力。为什么重要：PNG、PDF、DOCX、PPT 都在浏览器侧完成，能体现 DOM 渲染、脚本按需加载、预览复用和文件下载能力。先看 `src/helper/export.js`、`src/pages/ExportImage.vue`、`src/pages/ExportPdf.vue`、`src/pages/ExportDocx.vue`、`src/pages/ExportPPT.vue`。建议顺序：预览组件 -> 图片导出 -> PDF/DOCX -> PPT。
- 亮点五：构建前置资源同步。为什么重要：Vditor 和 html-to-docx 的浏览器资源跟随 npm 依赖自动复制，减少手工维护和线上 404。先看 `package.json` 的 `prestart`、`prebuild`，再看 `src/pages/Main.vue` 的 `cdn: "/vditor"` 和 `src/pages/ExportDocx.vue` 的动态脚本加载。建议顺序：构建脚本 -> public 资源 -> 运行时引用。

## 3. 必备知识点

- 搞懂 `docStore` 中 `documents`、`activeDocId`、`currentContent` 的边界。
- 搞懂 `arya_documents` 与 `arya_doc_<id>` 为什么分开存。
- 搞懂 Vditor 的 `after` 回调、`setValue`、`getValue`、`input` 回调各自承担什么职责。
- 搞懂为什么切换文档前要先 `saveCurrentDoc()`。
- 搞懂导出页为什么先从 localStorage 兜底读取，再通过 Pinia store 刷新。
- 搞懂 `prestart` / `prebuild` 为什么复制 `vditor/dist` 和 `html-to-docx.browser.js`。
- 搞懂没有后端时，文件导入、图片插入和导出下载分别使用了哪些浏览器 API。

## 4. 推荐阅读（结合仓库）

| 主题 | 建议阅读的代码/文档位置 | 预计时间 | 读完能回答什么 |
|---|---|---:|---|
| 项目整体架构 | `ARCHITECTURE.md`、`README.md` | 20 分钟 | 这个项目解决什么问题，为什么是纯前端架构 |
| 应用入口与插件挂载 | `src/main.js`、`src/App.vue`、`src/global.js` | 15 分钟 | Vue、Pinia、Router、全局事件总线如何进入应用 |
| 主编辑器集成 | `src/pages/Main.vue` | 40 分钟 | Vditor 如何初始化、保存、切换文档和处理滚动 |
| 多文档状态层 | `src/stores/docStore.js` | 30 分钟 | 文档列表、当前文档和正文内容如何被统一管理 |
| 存储适配器 | `src/adapters/IStorage.js`、`src/adapters/LocalStorageAdapter.js` | 30 分钟 | 为什么这套存储设计方便迁移到 IndexedDB 或云端 |
| 侧边栏交互 | `src/components/Sidebar.vue` | 20 分钟 | 新建、重命名、删除、当前文档高亮如何流转 |
| 导航与导入 | `src/pages/partials/HeaderNav.vue` | 25 分钟 | 文件导入、导出入口、全屏 API 如何组织 |
| 图片导出 | `src/helper/export.js`、`src/pages/ExportImage.vue` | 30 分钟 | DOM 如何变成 Canvas，为什么要处理 SVG 和圆角阴影 |
| PDF / DOCX 导出 | `src/pages/ExportPdf.vue`、`src/pages/ExportDocx.vue` | 35 分钟 | html2pdf.js 和 html-to-docx 的职责边界是什么 |
| PPT 预览 | `src/pages/ExportPPT.vue`、`src/router/routes/main.js` | 25 分钟 | Reveal.js 如何把 Markdown 分隔符转成幻灯片 |
| 构建资源同步 | `package.json`、`vite.config.js` | 20 分钟 | 依赖资源如何在开发和构建前自动放到 public 目录 |

## 5. 自学提醒

- 若某文件或原理看不懂，请继续追问 AI；本 skill 负责给学习路径与题目，不提供逐行讲解。

## 6. 项目技术定位

- 倾向：前端。依据：项目没有业务后端，核心复杂度集中在 Vue 前端状态管理、浏览器本地存储、Vditor 富文本编辑器集成、DOM 导出和静态资源工程化。

## 7. 核心原理解析

### 7.1 多文档本地持久化

- 问题：纯前端应用没有数据库，既要保存多篇 Markdown，又不能让侧边栏加载所有正文。机制：把元数据列表和正文内容拆成不同 localStorage key，列表只保存 `id/title/createdAt/updatedAt`，正文用 `arya_doc_<id>` 单独存。落点：`LocalStorageAdapter.js` 的 `getDocuments`、`getDocContent`、`saveDocContent`，以及 `docStore.js` 的 `documents/currentContent`。

### 7.2 Vditor 与应用状态同步

- 问题：Vditor 是有内部状态的编辑器实例，Pinia 是应用状态源，两个状态源不加约束会互相覆盖。机制：禁用 Vditor 自带缓存，由 `input` 回调触发防抖保存；初始化和切换文档时通过 `setValue` 主动回填。落点：`Main.vue` 的 `cache: { enable: false }`、`debouncedSave`、`applyVditorContent`。

### 7.3 切换与删除的一致性兜底

- 问题：用户刚输入就切换文档，或者删除当前文档，容易丢内容或进入空状态。机制：切换前强制保存当前文档；删除当前文档后选中下一篇，没有下一篇就新建空文档。落点：`Main.vue` 的 `saveCurrentDoc`、`onSelectDoc`、`onDocDeleted`，以及 `docStore.js` 的 `deleteDoc`。

### 7.4 纯前端导出链路

- 问题：没有服务端渲染和文件生成服务，但用户需要 PNG、PDF、DOCX、PPT。机制：复用浏览器 DOM 和第三方库，PNG 走 `html2canvas`，PDF 走 `html2pdf.js`，DOCX 动态加载 `html-to-docx`，PPT 走 Reveal.js Markdown 插件。落点：`ExportImage.vue`、`ExportPdf.vue`、`ExportDocx.vue`、`ExportPPT.vue`。

### 7.5 构建期资源对齐

- 问题：Vditor 静态资源和 DOCX 浏览器脚本如果手动放 public，升级依赖时容易版本不一致。机制：在 `prestart` 和 `prebuild` 自动复制 npm 包内资源到 `public/`，运行时统一从本地路径加载。落点：`package.json` 的前置脚本、`Main.vue` 的 `cdn: "/vditor"`、`ExportDocx.vue` 的 `/vendor/html-to-docx.browser.js`。

## 8. 关键设计决策

| 决策点 | 备选 | 取舍 | 风险 | 验证 |
|---|---|---|---|---|
| 存储方案 | 单 key 存所有内容 / 元数据与正文分离 / IndexedDB | 当前选择元数据与正文分离，复杂度低且列表性能更稳 | localStorage 容量有限，大文档或大量图片会触顶 | 构造 100 篇长文档，测侧边栏加载时间和保存失败提示（待测） |
| 编辑器缓存 | 使用 Vditor 自带缓存 / 应用层接管缓存 | 当前禁用 Vditor 缓存，避免两套状态源冲突 | 应用层保存逻辑出错时缺少第二缓存兜底 | 快速输入、刷新、切文档、关闭页面后检查内容一致性（待测） |
| 保存策略 | 每次输入立即保存 / 防抖保存 / 手动保存 | 当前 1 秒防抖，兼顾性能和安全，并在切换、卸载前强制保存 | 极端崩溃可能丢失 1 秒内输入 | 使用自动化脚本模拟连续输入，观察 localStorage 写入次数与最终内容（待测） |
| 导出实现 | 后端生成 / 浏览器纯前端生成 | 当前纯前端，部署简单，隐私友好 | 复杂 CSS、跨域图片、超长文档可能导出不稳定 | 用含图片、表格、代码块、Mermaid 的文档分别导出四种格式（待测） |
| DOCX 依赖加载 | 主包直接引入 / 动态脚本加载 | 当前动态加载，降低首页包体积 | public 脚本缺失会导致导出失败 | 删除或升级 vendor 脚本后跑构建和 DOCX 导出回归（待测） |
| 导出页数据来源 | 只用 Pinia / localStorage 兜底 + Pinia 刷新 | 当前先兜底再刷新，减少初次空白 | 数据读取路径重复，需保持 key 规则一致 | 切换文档后进入导出页，检查预览内容是否为当前文档（待测） |

## 9. 量化与验证（含待测，建议）

- 列表性能建议测试：准备 10、100、500 篇文档，每篇正文分别为 10KB、100KB、1MB，对比打开页面、展开侧边栏、切换文档的耗时。环境建议固定 Chrome 版本、关闭插件，使用 Performance 面板记录脚本执行和渲染时间，当前数据为（待测）。
- 保存性能建议测试：模拟连续输入 60 秒，统计 localStorage 写入次数、平均写入耗时、最终内容是否完整。重点验证 1 秒防抖是否明显减少写入压力，当前数据为（待测）。
- 导出稳定性建议测试：构造包含标题、表格、代码块、图片、SVG、长列表的 Markdown，分别导出 PNG、PDF、DOCX、PPT，记录成功率、耗时、样式偏差和浏览器内存峰值，当前数据为（待测）。
- 首屏体积建议测试：对比 DOCX 库主包引入与动态脚本加载两种方案，使用 `npm run build` 和浏览器 Network 面板记录 JS chunk 体积与首页加载时间，当前数据为（待测）。
- 离线能力建议测试：断网后访问本地构建产物，验证 Vditor 样式、字体、编辑器功能和 DOCX vendor 脚本是否可用，当前数据为（待测）。
