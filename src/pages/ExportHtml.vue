<!-- @format -->

<!-- HTML 导出页：将 Markdown 预览内容导出为可离线打开的 HTML 文件。 -->

<template>
  <div class="export-page">
    <div class="button-group">
      <el-button round @click="onBackToMainPage">返回主页</el-button>
      <el-button
        round
        type="primary"
        :disabled="exporting"
        @click="onExportBtnClick"
      >
        {{ exporting ? "正在导出..." : "生成导出" }}
      </el-button>
    </div>
    <PreviewVditor v-if="pdata !== null" :pdata="pdata" />
  </div>
</template>

<script>
import PreviewVditor from "@components/PreviewVditor";
import { getExportFileName } from "@helper/utils";
import { useDocStore } from "@/stores/docStore";
import contentThemeCss from "vditor/dist/css/content-theme/light.css?raw";

export default {
  name: "export-html",

  setup() {
    const store = useDocStore();
    return { store };
  },

  data() {
    const activeDoc = localStorage.getItem("arya_active_doc");
    const content = activeDoc
      ? localStorage.getItem("arya_doc_" + activeDoc) || ""
      : "";
    return {
      pdata: content,
      exporting: false,
    };
  },

  async mounted() {
    await this.store.init();
    this.pdata = this.store.currentContent || "";
  },

  components: {
    PreviewVditor,
  },

  methods: {
    onBackToMainPage() {
      this.$router.push("/");
    },

    buildStandaloneHtml(contentElement) {
      const title = this.store.activeDoc?.title || "Markdown 导出";
      return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(title)}</title>
  <style>
${contentThemeCss}
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 32px 16px;
      color: #111827;
      background: #f8fafc;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    main {
      width: min(960px, 100%);
      margin: 0 auto;
      padding: 40px;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 12px 36px rgba(15, 23, 42, 0.08);
    }
    img, video { max-width: 100%; height: auto; }
    pre { overflow-x: auto; }
    table { display: block; overflow-x: auto; border-collapse: collapse; }
    @media (max-width: 768px) {
      body { padding: 0; background: #fff; }
      main { padding: 20px 14px; border-radius: 0; box-shadow: none; }
    }
  </style>
</head>
<body>
  <main class="vditor-reset">
${contentElement.innerHTML}
  </main>
</body>
</html>`;
    },

    escapeHtml(value) {
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    },

    downloadHtml(html, filename) {
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    },

    onExportBtnClick() {
      const contentElement = document.querySelector(
        "#khaleesi .vditor-preview .vditor-reset",
      );
      if (!contentElement) {
        this.$message.warning("预览内容尚未渲染完成，请稍后再试");
        return;
      }

      this.exporting = true;
      try {
        const html = this.buildStandaloneHtml(contentElement);
        this.downloadHtml(html, getExportFileName());
        this.$message.success("HTML 导出成功");
      } catch (error) {
        console.error("HTML 导出失败:", error);
        this.$message.error("HTML 导出失败，请重试");
      } finally {
        this.exporting = false;
      }
    },
  },
};
</script>
