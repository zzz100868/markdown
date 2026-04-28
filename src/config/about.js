/** @format */

/**
 * 关于页面内容配置
 *
 * 【这个文件的作用】
 * 定义"关于 Arya"页面的 Markdown 内容。
 * 与 default.js 类似，但这篇是介绍编辑器本身的特性和使用说明。
 *
 * 当用户点击顶部导航栏的 📄 图标时，就会跳转到这个页面。
 */

export default `# 关于 Arya

Arya 是一款基于 **Vue 3**、**Vite**、**Vditor** 构建的在线 Markdown 编辑器；轻量且强大，所有编辑内容仅保存在浏览器本地，不会上传至任何服务器，可放心使用。

## 核心特性

- [x] 🚀 基于 **Vue 3 + Vite**，启动快、响应流畅
- [x] 📝 集成 **Vditor**，支持即时渲染、分屏预览、所见即所得三种模式
- [x] 📂 支持**多文档管理**，侧边栏可新建、切换、重命名、删除文档
- [x] 💾 数据持久化至 **localStorage**，刷新不丢失
- [x] 🖼 支持导出 **PNG**、**PDF**、**Word（DOCX）**
- [x] 📽 内置 **PPT 预览**（基于 Reveal.js）
- [x] 📊 支持绘制**流程图**、**时序图**、**甘特图**（Mermaid）
- [x] 📈 支持 **Echarts** 图表渲染
- [x] 🎹 支持**五线谱**、任务列表、Emoji 表情
- [x] 🌗 支持粘贴 HTML 自动转换为 Markdown
- [x] 🛠 常用快捷键支持，代码块一键复制

## 快捷键

| 功能 | Mac | Windows / Linux |
|------|-----|-----------------|
| 切换编辑模式 | ⌘ + ⇧ + M | Ctrl + ⇧ + M |
| 所见即所得 | ⌘ + ⌥ + 7 | Ctrl + Alt + 7 |
| 即时渲染 | ⌘ + ⌥ + 8 | Ctrl + Alt + 8 |
| 分屏渲染 | ⌘ + ⌥ + 9 | Ctrl + Alt + 9 |

## 什么是 Markdown

Markdown 是一种方便记忆、书写的纯文本标记语言，用户可以使用这些标记符号，以最小的输入代价，生成极富表现力的文档：譬如您正在阅读的这份文档。它使用简单的符号标记不同的标题，分割不同的段落，**粗体**、*斜体* 或者[超文本链接](https://github.com/nicejade/markdown-online-editor)，更棒的是，它还可以：

### 1. 制作待办事宜 Todo 列表

- [x] 支持流程图、甘特图、时序图、任务列表
- [x] 支持粘贴 HTML 自动转换为 Markdown
- [x] 支持插入原生 Emoji
- [x] 支持编辑内容本地存储，防止意外丢失
- [x] 支持实时预览与字符计数
- [x] 支持导出 PDF、PNG、Word 等格式
- [x] 支持 PPT 预览
- [x] 增加对所见即所得编辑模式的支持

### 2. 书写一个质能守恒公式

$$
E=mc^2
$$

### 3. 高亮一段代码

\`\`\`js
// 给页面里所有的 DOM 元素添加一个 1px 的描边
[].forEach.call($$('*'), function (a) {
  a.style.outline = '1px solid #' + (~~(Math.random() * (1 << 24))).toString(16)
})
\`\`\`

### 4. 高效绘制流程图

\`\`\`mermaid
graph TD
    A[开始] --> B{判断}
    B -->|条件1| C[处理1]
    B -->|条件2| D[处理2]
    C --> E[结束]
    D --> E
\`\`\`

### 5. 高效绘制序列图

\`\`\`mermaid
sequenceDiagram
  participant Alice
  participant Bob
  Alice->>Bob: Hello Bob, how are you?
  Bob-->>Alice: Great!
\`\`\`

### 6. 高效绘制甘特图

\`\`\`mermaid
gantt
  title 项目开发流程
  section 设计
    需求分析    :a1, 2024-06-01, 3d
    原型设计    :after a1, 5d
  section 开发
    前端开发    :2024-06-08, 10d
    后端开发    :2024-06-08, 10d
  section 测试
    集成测试    :2024-06-20, 5d
\`\`\`

### 7. 绘制表格

| 功能 | 状态 | 说明 |
| :--- | :---: | :--- |
| Markdown 编辑 | ✅ | 基于 Vditor，支持多种模式 |
| 多文档管理 | ✅ | 侧边栏新建、重命名、删除 |
| 本地存储 | ✅ | 数据保存在浏览器本地 |
| 导出 PNG | ✅ | 携带样式的图片导出 |
| 导出 PDF | ✅ | 一键生成 PDF 文件 |
| 导出 Word | ✅ | 生成 DOCX 文档 |
| PPT 预览 | ✅ | 基于 Reveal.js |

---

## 开源协议

本项目基于 [MIT](https://github.com/nicejade/markdown-online-editor/blob/master/LICENSE) 协议开源，欢迎 Star 与贡献。

- **GitHub**: [markdown-online-editor](https://github.com/nicejade/markdown-online-editor)
`;
