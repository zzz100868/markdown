<!-- @format -->

<!-- Main.vue - 主编辑页面：顶部导航 + 侧边栏 + Markdown 编辑器 -->

<template>
  <!-- 整个主页面外壳：高度铺满屏幕，并在 store.loading 为 true 时显示 Element Plus 加载遮罩 -->
  <div
    class="w-full min-h-screen h-full bg-surface-subtle flex flex-col"
    v-loading="store.loading"
  >
    <!-- 顶部导航栏：导入、导出、全屏等入口都在这里 -->
    <HeaderNav @toggle-sidebar="onToggleSidebar" />

    <!-- 主体区域：固定在导航栏下方，左侧是文档列表，右侧是 Vditor 编辑器 -->
    <div
      class="flex flex-1 relative overflow-hidden min-h-[calc(100vh-56px)] mx-auto w-full"
      :style="{ marginTop: '56px' }"
    >
      <!-- 侧边栏：桌面端一直显示；移动端在未收起时显示 -->
      <Sidebar
        v-if="!isMobile || !sidebarCollapsed"
        :collapsed="sidebarCollapsed"
        :active-doc-id="store.activeDocId"
        @select-doc="onSelectDoc"
        @doc-deleted="onDocDeleted"
        @toggle-sidebar="onToggleSidebar"
      />

      <!-- 移动端遮罩层 -->
      <div
        v-if="isMobile && !sidebarCollapsed"
        class="fixed inset-x-0 bottom-0 top-[56px] z-[90] bg-black/15"
        @click="sidebarCollapsed = true"
      />

      <!-- 编辑器区域：根据侧边栏收起/展开动态调整左边距 -->
      <div
        class="flex flex-1 flex-col transition-all duration-500 ease-smooth min-w-0 p-4 md:p-6"
        :class="editorMarginClass"
      >
        <!-- Vditor 需要一个真实 DOM 容器，它初始化时会把完整编辑器塞进 #vditor -->
        <div class="editor-card flex-1 h-full overflow-hidden relative">
          <div
            id="vditor"
            class="vditor flex-1 h-full text-left overflow-hidden rounded-lg"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vditor from "vditor";
import "vditor/src/assets/less/index.less";
import HeaderNav from "./partials/HeaderNav";
import Sidebar from "@components/Sidebar";
import defaultText from "@config/default";
import { useDocStore } from "@/stores/docStore";

const SAVE_DEBOUNCE_MS = 1000;

export default {
  name: "index-page",

  data() {
    return {
      isMobile: window.innerWidth <= 960,
      vditor: null,
      sidebarCollapsed: window.innerWidth <= 960,
      saveTimer: null,
      vditorReady: false,
      manualSetCount: 0,
      scrollSyncBlocker: null,
      scrollSyncElement: null,
      scrollSyncObserver: null,
    };
  },

  components: {
    HeaderNav,
    Sidebar,
  },

  setup() {
    const store = useDocStore();
    return { store };
  },

  computed: {
    editorMarginClass() {
      if (this.isMobile) return "ml-0 p-2.5";
      if (this.sidebarCollapsed) return "ml-11 p-6";
      return "ml-[248px] p-6";
    },
  },

  async created() {
    await this.store.init(defaultText);
    if (this.store.documents.length === 0) {
      const doc = await this.store.createDoc("未命名文档");
      await this.store.selectDoc(doc.id);
    }
  },

  mounted() {
    this.initVditor();
    this.$eventBus.on("reload-content", this.reloadContent);
    window.addEventListener("resize", this.onResize);
  },

  async beforeUnmount() {
    await this.saveCurrentDoc();
    this.$eventBus.off("reload-content", this.reloadContent);
    window.removeEventListener("resize", this.onResize);
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.uninstallIndependentPaneScrolling();
  },

  methods: {
    onResize() {
      this.isMobile = window.innerWidth <= 960;
      if (!this.isMobile && this.sidebarCollapsed) return;
      if (this.isMobile) this.sidebarCollapsed = true;
    },

    onToggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    },

    initVditor() {
      const that = this;
      const options = {
        width: "100%",
        height: "0",
        tab: "\t",
        counter: "999999",
        typewriterMode: true,
        mode: "sv",
        cache: { enable: false },
        preview: {
          delay: 100,
          show: !this.isMobile,
        },
        outline: true,
        cdn: "/vditor",
        toolbar: [
          "emoji",
          "headings",
          "bold",
          "italic",
          "strike",
          "link",
          "|",
          "list",
          "ordered-list",
          "check",
          "outdent",
          "indent",
          "|",
          "quote",
          "line",
          "code",
          "inline-code",
          "insert-before",
          "insert-after",
          "|",
          "upload",
          "record",
          "table",
          "|",
          "undo",
          "redo",
          "|",
          "fullscreen",
          "edit-mode",
          {
            name: "more",
            toolbar: [
              "both",
              "code-theme",
              "content-theme",
              "export",
              "outline",
              "preview",
              "devtools",
              "info",
              "help",
            ],
          },
        ],
        upload: {
          max: 5 * 1024 * 1024,
          handler(files) {
            that.insertLocalImages(files);
          },
        },
        input: () => {
          that.debouncedSave();
        },
        after: () => {
          if (that.manualSetCount === 0) {
            const content = that.store.currentContent;
            that.vditor.setValue(
              typeof content === "string" ? content : defaultText,
              true,
            );
            that.manualSetCount++;
          }
          that.vditorReady = true;
          that.installIndependentPaneScrolling();
          if (that.vditor && that.vditor.focus) {
            that.vditor.focus();
          }
        },
      };
      this.vditor = new Vditor("vditor", options);
      const initialContent = this.store.currentContent;
      if (this.vditor && this.vditor.setValue) {
        try {
          this.vditor.setValue(
            typeof initialContent === "string" ? initialContent : defaultText,
            true,
          );
          this.manualSetCount++;
        } catch (e) {}
      }
    },

    debouncedSave() {
      if (this.saveTimer) clearTimeout(this.saveTimer);
      this.saveTimer = setTimeout(() => {
        if (
          this.store.activeDocId &&
          this.vditor &&
          typeof this.vditor.getValue === "function"
        ) {
          const content = this.vditor.getValue();
          this.store.saveContent(content);
        }
        this.saveTimer = null;
      }, SAVE_DEBOUNCE_MS);
    },

    async saveCurrentDoc() {
      if (this.saveTimer) {
        clearTimeout(this.saveTimer);
        this.saveTimer = null;
      }
      if (
        this.store.activeDocId &&
        this.vditor &&
        typeof this.vditor.getValue === "function"
      ) {
        await this.store.saveContent(this.vditor.getValue());
      }
    },

    async onSelectDoc(id) {
      await this.saveCurrentDoc();
      await this.store.selectDoc(id);
      await this.$nextTick();
      const content = this.store.currentContent;
      this.applyVditorContent(typeof content === "string" ? content : "");
      if (this.isMobile) this.sidebarCollapsed = true;
    },

    async onDocDeleted() {
      const next = this.store.sortedDocuments[0];
      if (next) {
        await this.store.selectDoc(next.id);
        this.applyVditorContent(this.store.currentContent || "");
      } else {
        const doc = await this.store.createDoc("未命名文档");
        await this.store.selectDoc(doc.id);
        this.applyVditorContent("");
      }
    },

    readFileAsDataURL(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
    },

    async insertLocalImages(files) {
      const imageFiles = Array.from(files || []).filter((file) =>
        file.type.startsWith("image/"),
      );
      if (imageFiles.length === 0) {
        this.$message.warning("请选择图片文件");
        return;
      }
      try {
        const markdownList = await Promise.all(
          imageFiles.map(async (file) => {
            const dataUrl = await this.readFileAsDataURL(file);
            const alt = (file.name || "image").replace(/\.[^.]+$/, "");
            return `![${alt}](${dataUrl})`;
          }),
        );
        this.vditor.insertValue(`\n${markdownList.join("\n")}\n`);
        this.debouncedSave();
      } catch (error) {
        console.error("插入图片失败:", error);
        this.$message.error("插入图片失败，请重试");
      }
    },

    reloadContent() {
      this.applyVditorContent(
        typeof this.store.currentContent === "string"
          ? this.store.currentContent
          : "",
      );
    },

    applyVditorContent(content, retry = false) {
      if (!this.vditor || !this.vditor.setValue) return;
      try {
        this.vditor.setValue(content, true);
        this.manualSetCount++;
        if (this.vditor.focus) {
          this.vditor.focus();
        }
      } catch (e) {
        if (!retry) {
          setTimeout(() => this.applyVditorContent(content, true), 100);
        }
      }
    },

    installIndependentPaneScrolling() {
      const root = document.getElementById("vditor");
      if (!root) return;
      const applyBlocker = () => {
        const editorElement = root.querySelector(".vditor-sv");
        if (!editorElement || editorElement === this.scrollSyncElement) return;
        if (this.scrollSyncElement && this.scrollSyncBlocker) {
          this.scrollSyncElement.removeEventListener(
            "scroll",
            this.scrollSyncBlocker,
            true,
          );
        }
        if (!this.scrollSyncBlocker) {
          this.scrollSyncBlocker = (event) => {
            event.stopImmediatePropagation();
          };
        }
        editorElement.addEventListener("scroll", this.scrollSyncBlocker, true);
        this.scrollSyncElement = editorElement;
      };
      applyBlocker();
      if (!this.scrollSyncObserver) {
        this.scrollSyncObserver = new MutationObserver(applyBlocker);
        this.scrollSyncObserver.observe(root, {
          childList: true,
          subtree: true,
        });
      }
    },

    uninstallIndependentPaneScrolling() {
      if (this.scrollSyncElement && this.scrollSyncBlocker) {
        this.scrollSyncElement.removeEventListener(
          "scroll",
          this.scrollSyncBlocker,
          true,
        );
      }
      if (this.scrollSyncObserver) {
        this.scrollSyncObserver.disconnect();
      }
      this.scrollSyncBlocker = null;
      this.scrollSyncElement = null;
      this.scrollSyncObserver = null;
    },
  },
};
</script>

<style lang="less">
@import "./../assets/styles/style.less";

/* 编辑器卡片容器 */
.editor-card {
  background: @bg-surface;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
  border: 1px solid @border-subtle;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 4px 16px -2px rgba(0, 0, 0, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.02);
  }
}

/* Vditor 编辑器样式覆盖 */
.vditor {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 56px - 48px);
  border-radius: 10px;
  overflow: hidden;

  .vditor-toolbar {
    border-bottom: 1px solid @border-subtle;
    background-color: @bg-surface;
    padding: 5px 10px;

    .vditor-toolbar__item {
      button {
        color: @text-tertiary;
        transition: color 0.15s ease, background-color 0.15s ease;

        &:hover {
          color: @text-primary;
          background-color: @bg-hover;
        }
      }
    }
  }

  .vditor-content {
    flex: 1;
    min-height: 0;
    border-top: none;
  }
}

.vditor-reset {
  font-size: 15px;
  line-height: 1.65;
  color: @text-primary;
}

.vditor-textarea {
  font-size: 15px;
  line-height: 1.65;
  height: 100% !important;
  color: @text-primary;
}

/* 修复 Vditor 全屏模式与固定顶部导航栏的冲突 */
.vditor--fullscreen {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  z-index: 10000 !important;
  margin: 0 !important;
  border-radius: 0 !important;
}

/* 全屏模式下隐藏预览操作栏，防止遮挡固定头部 */
.vditor--fullscreen .vditor-preview__action {
  display: none !important;
}

/* 确保 Vditor 提示弹窗（info/help）在最上层，可以被交互和关闭 */
.vditor-tip {
  z-index: 10001 !important;
}

.vditor-tip__close {
  cursor: pointer;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  font-weight: 600;
}

/* 修复 Vditor tip.hide() 拼写错误导致的样式问题 */
.vditor-messageElementtip {
  display: none !important;
}

/* 确保开发者工具面板在其他内容之上可见 */
.vditor-devtools {
  z-index: 100 !important;
}

/* 移动端适配 */
@media (max-width: 960px) {
  .vditor {
    min-height: calc(100vh - 56px - 20px);
    border-radius: 8px;
  }
}
</style>
