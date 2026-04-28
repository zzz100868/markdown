# Arya - 在线 Markdown 编辑器 架构解析

> 本文档描述项目的整体实现思路、技术选型与核心设计决策。

---

## 1. 项目定位

Arya 是一个**纯前端、零后端**的在线 Markdown 编辑器。所有数据（文档列表与正文）均保存在浏览器本地，无需服务器即可运行全部功能。

**核心能力：**

- Markdown 编辑（WYSIWYG / 即时渲染 / 分屏预览）
- 多文档管理（新建、重命名、删除、切换）
- 本地文件导入（`.md`）
- 导出 PNG / PDF / DOCX / PPT

---

## 2. 技术栈选型

| 层面 | 技术 | 选型原因 |
|------|------|----------|
| 框架 | **Vue 3** | `setup()` 注入 Pinia，业务逻辑仍使用 Options API，写法务实 |
| 构建工具 | **Vite** | 快速冷启动，配合 `vite-plugin-svg-icons` 生成 SVG 图标精灵 |
| 编辑器内核 | **Vditor** | 成熟的三方库，内置 WYSIWYG、即时渲染、分屏预览三种模式 |
| 样式 | **Tailwind CSS + Less** | Tailwind 处理原子化布局，Less 覆盖 Vditor 主题与变量 |
| 状态管理 | **Pinia** | 比 Vuex 更轻量，天然支持 Vue 3 响应式系统 |
| 事件通信 | **mitt** | 轻量级事件总线，用于跨组件一次性通知 |
| 导出能力 | **html2canvas / html2pdf.js / Reveal.js** | 纯前端渲染导出，无需服务端 |

---

## 3. 目录与模块划分

```
src/
├── pages/          # 页面级组件（编辑器首页、导出页、关于页）
├── components/     # 可复用组件（图标、侧边栏、预览容器）
├── router/         # 路由配置，出口页面共享 Frame.vue 外壳
├── stores/         # Pinia 状态（docStore：多文档管理）
├── adapters/       # 存储适配器接口 + localStorage 实现
├── helper/         # 工具函数（事件总线、截图、文件名生成）
└── config/         # 常量、默认欢迎文本、关于页内容
```

### 3.1 最值得关注的模块：`adapters/`

项目使用**适配器模式**封装持久化层：

- `IStorage.js` —— 定义存储接口契约
- `LocalStorageAdapter.js` —— 基于 `localStorage` 的具体实现

**好处：** 未来如果需要接入 IndexedDB 或云端同步，只需新增一个 Adapter，无需改动 `docStore` 和业务组件。

---

## 4. 核心功能实现

### 4.1 Markdown 编辑

编辑器的核心能力来自 **Vditor**，`Main.vue` 负责集成与增强：

- **初始化**：在 `mounted` 阶段创建 Vditor 实例，绑定到 `#vditor` DOM 节点
- **防抖保存**：监听编辑器输入事件，触发 **1 秒防抖**（`debounceSave`），避免频繁写 `localStorage`
- **滚动解耦**：分屏预览模式下，Vditor 默认会联动滚动编辑器与预览区；项目通过捕获阶段的事件拦截，允许两侧独立滚动
- **图片上传**：对接 `sm.ms` 免费图床，上传成功后自动插入 Markdown 图片语法

### 4.2 多文档管理

由 **`docStore`（Pinia）+ `Sidebar.vue`** 共同实现：

- **文档列表**（`arya_documents`）与**文档正文**（`arya_doc_<id>`）**分开存储**
  - 列表只存 `{ id, title, updatedAt }`
  - 正文按文档 ID 独立存储
  - 好处：打开侧边栏时不需要加载所有文档的完整内容，列表渲染极快
- **老数据迁移**：首次运行时，若检测到旧版单文档的 `vditorvditor` key，自动迁移为新版"未命名文档"

### 4.3 导入与导出

| 功能 | 实现方式 |
|------|----------|
| **导入本地文件** | `HeaderNav.vue` 动态创建 `input[type=file]`，通过 `FileReader` 读取 `.md` 文件内容，在 `docStore` 中新建文档 |
| **导出 PNG** | `html2canvas` 截取 Vditor 预览 DOM 为 Canvas 下载 |
| **导出 PDF** | `html2pdf.js` 将预览 DOM 直接转换为 PDF |
| **导出 DOCX** | `@turbodocx/html-to-docx` 动态加载（体积大，按需插入 `<script>` 标签） |
| **导出 PPT** | 利用 Vditor 内置的 `markmap` + **Reveal.js**，解析 Markdown 中的 `---`（分页）和 `--`（分片）生成幻灯片 |

---

## 5. 数据流设计

整个应用的数据流是**单向的**：

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────────┐
│  用户操作    │────▶│   docStore  │────▶│ LocalStorageAdapter │
│ (组件层)     │     │  (Pinia)    │     │   (localStorage)    │
└─────────────┘     └──────┬──────┘     └─────────────────────┘
                           │
                           ▼
                    其他组件通过 Pinia
                    响应式自动更新 UI
```

**跨组件一次性通知**（如导入完成后让主编辑器刷新内容）没有滥用 Pinia，而是使用基于 **mitt** 的事件总线（通过 `$eventBus` 挂载到全局），保持状态层的纯净。

---

## 6. 路由与页面组织

路由分为两类：

- **独立页面**：`/`（编辑器首页）、`/*`（404）
- **Frame 外壳页**：`/about-arya`、`/export/png`、`/export/pdf`、`/export/docx`、`/export/ppt`

所有导出页面使用**懒加载**（`() => import(...)`），减小首页加载体积。

```
App.vue
 └── <router-view>
      ├── /              → Main.vue（编辑器首页）
      ├── /about-arya    → Frame.vue → About.vue
      ├── /export/png    → Frame.vue → ExportImage.vue
      ├── /export/pdf    → Frame.vue → ExportPdf.vue
      ├── /export/docx   → Frame.vue → ExportDocx.vue
      ├── /export/ppt    → Frame.vue → ExportPPT.vue
      └── /*             → NotFound.vue
```

`Frame.vue` 为导出页和关于页提供统一的 `HeaderNav` + 内容区外壳。

---

## 7. 关键设计细节

### 7.1 Content / Metadata 分离

文档元数据列表与正文内容分开存储：

- `arya_documents`：文档列表（轻量）
- `arya_doc_<id>`：各文档正文（按需读写）

这保证了侧边栏列表的加载性能，不会因为文档变多而变慢。

### 7.2 防抖持久化

编辑器输入触发 1 秒防抖后再写入 `localStorage`，在数据安全性与写入性能之间取得平衡。

### 7.3 CDN 自托管

Vditor 默认从外部 CDN 加载静态资源。项目通过配置 `cdn: "/vditor"`，将其指向本地 `public/vditor/dist`，避免运行时依赖外网。

### 7.4 Vue API 混用

- `setup()` 仅用于注入 Pinia store
- 其余状态、计算属性、方法仍使用传统的 `data` / `computed` / `methods`

这是一种务实的渐进式写法，降低了迁移成本。

---

## 8. 总结

Arya 的设计思路可以概括为：

> **以 Vditor 为编辑核心，Pinia + 适配器模式管理数据，纯前端完成所有导入导出，尽可能做到零后端、开箱即用。**

通过适配器模式预留了存储扩展的可能性，通过 Content/Metadata 分离和防抖保存保证了本地存储的性能，通过懒加载和按需加载脚本控制了首页体积。整体架构清晰、分层合理，适合作为纯前端富文本应用的参考实现。


---

## 9. 项目亮点（简历/面试视角）

> 以下从技术决策的角度梳理项目中有深度、可展开讨论的设计点，帮助你在简历和面试中呈现工程能力。

### 9.1 持久化架构：不是"用 localStorage"，而是设计了一套可替换的存储层

**核心问题：** 纯前端应用没有后端，如何把大量 Markdown 正文可靠地保存在浏览器里，同时保证性能、可扩展性和迁移能力？

**设计方案：**

- **适配器模式**：定义 `IStorage` 接口，由 `LocalStorageAdapter` 实现。业务层（`docStore`）完全面向接口编程，不感知底层存储介质
- **Content / Metadata 分离**：
  - `arya_documents` 只存文档元数据（`id, title, createdAt, updatedAt`），通常几十字节
  - `arya_doc_<id>` 按文档 ID 独立存正文
  - 如果几百篇长文档全部塞进一个 JSON，每次读写侧边栏列表都要序列化几 MB，直接卡死
- **数据迁移**：`migrateFromLegacy()` 检测旧版单文档的 `vditorvditor` key，自动迁到新版多文档结构，用户无感知升级

**扩展性：** 后续若要接入 IndexedDB 或云端同步，只需新建 `CloudStorageAdapter implements IStorage`，替换单例即可，`docStore` 一行代码不用改。

---

### 9.2 富文本状态同步：两个"状态黑洞"之间的双向绑定

**核心问题：** Vditor 是一个有内部状态的黑盒（自己管理编辑器内容、光标、历史栈），Pinia 是应用层的响应式状态源，两边不是天然同步的。怎么保证编辑器内容和应用状态始终一致？

**设计方案：**

- **接管 Vditor 缓存**：主动禁用 Vditor 自带的 `cache.enable`，完全由应用层通过防抖保存接管持久化，避免两套缓存冲突
- **初始化时序控制**：Vditor 的 `setValue` 必须在 `after` 回调里调用，否则会解析失败。用 `manualSetCount` 计数器确保内容仅首次注入，防止 `mounted` 中的立即调用和 `after` 回调形成竞态覆盖
- **防抖保存策略**：输入触发 1 秒防抖后再写入 `localStorage`
- **排序稳定性设计**：`saveDocContent` 故意**不更新 `updatedAt`**，否则用户每敲一个字，侧边栏的文档排序就跳一下，体验极差。只有新建、重命名、删除等"显式操作"才更新排序

---

### 9.3 多文档切换的一致性边界

**核心问题：** 多文档场景下，删除当前文档、首次进入空环境、切换文档时，编辑器实例怎么处理？

**设计方案：**

- **删除兜底**：`docStore.deleteDoc()` 内部自动处理——如果删的是当前文档，自动切到下一篇；没有下一篇就清空状态，由调用方（`Main.vue`）决定是否需要新建空文档
- **空环境兜底**：`init()` 启动时检测到本地没有任何文档，自动创建一篇"未命名文档"作为起点
- **编辑器实例复用**：切换文档时 Vditor 实例不销毁，只通过 `setValue` 替换内容。避免频繁重建带来的白屏和光标丢失

---

### 9.4 纯前端导出：DOM → Canvas → 文件的渲染链路

**核心问题：** 没有后端，怎么把编辑器里的内容导出成 PNG、PDF、DOCX、PPT？

**设计方案：**

- **PNG**：`html2canvas` 截取 Vditor 预览 DOM，需要处理 CSS 样式、SVG 内嵌图形、字体回退，并加上圆角和阴影美化
- **PDF**：`html2pdf.js` 直接把预览 DOM 转 PDF，配置了设备像素比缩放和元素忽略策略
- **DOCX 按需加载**：`@turbodocx/html-to-docx` 体积大，不在主包引入，而是在 `ExportDocx.vue` 里通过动态 `<script>` 标签按需加载
- **PPT**：利用 Reveal.js 解析 Markdown 中的 `---`（分页）和 `--`（分片）语义，生成幻灯片
- **CDN 自托管**：Vditor 默认从外网 CDN 拉静态资源，通过 `cdn: "/vditor"` 配置指向本地 `public/vditor/dist`，实现完全离线可用

---

### 9.5 工程化：构建流程的自动化

**核心问题：** 第三方库的静态资源（如 `html-to-docx.browser.js`、Vditor 字体/主题）如何与 npm 依赖版本保持一致，避免手动维护？

**设计方案：**

在 `package.json` 中配置了 `prestart` 和 `prebuild` 脚本，每次开发/构建前自动把 `html-to-docx.browser.js` 和 `vditor/dist` 复制到 `public/`。

- 升级 `vditor` 版本后不需要手动去 `public` 里替换文件
- 团队成员克隆项目后直接 `npm run dev`，不会遇到资源 404
- 静态资源和 npm 包版本始终对齐

---

### 9.6 简历写法参考

> **Arya - 在线 Markdown 编辑器**
>
> 独立设计并开发了一款纯前端在线 Markdown 编辑器，核心解决"无后端场景下的富文本状态同步与持久化"问题：
>
> 1. **持久化架构**：设计 Storage Adapter 模式，实现文档元数据与正文分离存储，支持旧数据自动迁移，并为后续接入云端同步预留扩展接口
> 2. **状态同步**：处理 Vditor 与 Pinia 的双向状态绑定，设计防抖保存、防覆盖初始化、删除文档自动兜底切换等一致性策略
> 3. **纯前端导出**：搭建 DOM→Canvas→文件的导出链路，PNG/PDF/DOCX/PPT 全格式支持，通过按需加载和 CDN 自托管控制首屏体积
> 4. **工程化**：编写构建前置脚本，实现第三方库静态资源的自动化依赖对齐

---

### 9.7 一句话总结

> 这个项目的价值不在于"集成了哪些库"，而在于：在一个"编辑器有内部状态、存储有容量限制、用户操作有复杂边界"的场景下，做了一系列务实的设计决策来兜住这些坑。面试官关心的永远是你**解决了什么问题**，而不是**用了什么技术**。
