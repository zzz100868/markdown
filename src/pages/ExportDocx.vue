<!-- @format -->

<!-- Docx 导出页：将 Markdown 内容导出为 Word 文档。 -->

<template>
  <!-- Word 导出页：先用 PreviewVditor 渲染 Markdown，再把渲染后的 HTML 转成 docx -->
  <div class="export-page">
    <div class="button-group">
      <el-button round @click="onBackToMainPage">返回主页</el-button>
      <el-button
        round
        @click="onExportBtnClick"
        type="primary"
        :disabled="exporting"
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

export default {
  name: "export-docx",

  setup() {
    const store = useDocStore();
    return { store };
  },

  data() {
    // created/data 阶段先从 localStorage 兜底取内容，避免预览组件初次渲染为空。
    const activeDoc = localStorage.getItem("arya_active_doc");
    const content = activeDoc
      ? localStorage.getItem("arya_doc_" + activeDoc) || ""
      : "";
    return {
      isLoading: true, // 导出流程中的加载状态
      pdata: content, // 传给 PreviewVditor 的 Markdown 原文
      exporting: false, // 控制按钮禁用和文案切换
    };
  },

  async mounted() {
    // 用 Pinia store 读取正式的当前文档内容。
    await this.store.init();
    this.pdata = this.store.currentContent || "";
  },

  components: {
    PreviewVditor,
  },

  methods: {
    ensureBrowserBuffer() {
      if (window.Buffer?.from) return;

      class BrowserBuffer extends Uint8Array {
        static from(value, encoding) {
          if (typeof value === "string") {
            const normalizedEncoding = String(
              encoding || "utf-8",
            ).toLowerCase();
            if (normalizedEncoding === "base64") {
              const binary = atob(value);
              return new BrowserBuffer(
                Array.from(binary, (char) => char.charCodeAt(0)),
              );
            }
            return new BrowserBuffer(new TextEncoder().encode(value));
          }
          if (value instanceof ArrayBuffer) {
            return new BrowserBuffer(value);
          }
          if (ArrayBuffer.isView(value)) {
            return new BrowserBuffer(
              value.buffer,
              value.byteOffset,
              value.byteLength,
            );
          }
          return new BrowserBuffer(value || []);
        }

        static isBuffer(value) {
          return value instanceof Uint8Array;
        }

        static concat(list, totalLength) {
          const length =
            totalLength ?? list.reduce((sum, item) => sum + item.length, 0);
          const result = new BrowserBuffer(length);
          let offset = 0;
          list.forEach((item) => {
            result.set(item, offset);
            offset += item.length;
          });
          return result;
        }

        toString(encoding = "utf-8") {
          const normalizedEncoding = String(encoding).toLowerCase();
          if (normalizedEncoding === "base64") {
            let binary = "";
            const chunkSize = 0x8000;
            for (let i = 0; i < this.length; i += chunkSize) {
              binary += String.fromCharCode(...this.subarray(i, i + chunkSize));
            }
            return btoa(binary);
          }
          return new TextDecoder().decode(this);
        }
      }

      window.Buffer = BrowserBuffer;
    },

    // 动态加载 html-to-docx 库（体积较大，按需加载）
    loadHTMLtoDOCX() {
      return new Promise((resolve, reject) => {
        this.ensureBrowserBuffer();
        if (window.HTMLToDOCX) {
          resolve(window.HTMLToDOCX);
          return;
        }
        // 该库内部可能用到 Node.js 的 global 对象，浏览器中用 window 兜底
        if (typeof window.global === "undefined") {
          window.global = window;
        }
        const script = document.createElement("script");
        script.src = "/vendor/html-to-docx.browser.js";
        script.onload = () => resolve(window.HTMLToDOCX);
        script.onerror = () => reject(new Error("Failed to load html-to-docx"));
        document.head.appendChild(script);
      });
    },

    // 把 HTML 内容转换为 Word 文档并下载
    async exportAndDownloadDocx(contentElement, filename) {
      try {
        const HTMLtoDOCX = await this.loadHTMLtoDOCX();
        const htmlContent = contentElement.innerHTML;

        // 组装完整 HTML，包含必要的样式
        const fullHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: 'Microsoft YaHei', 'SimSun', sans-serif; }
                img { max-width: 100%; height: auto; }
                table { border-collapse: collapse; width: 100%; }
                td, th { border: 1px solid #ccc; padding: 8px; }
              </style>
            </head>
            <body>
              ${htmlContent}
            </body>
          </html>
        `;

        const docxResult = await HTMLtoDOCX(fullHtml, null, {
          table: { row: { cantSplit: true } }, // 表格行不被分页拆分
          footer: true,
          pageNumber: true,
        });
        const docxBlob =
          docxResult instanceof Blob
            ? docxResult
            : new Blob([docxResult], {
                type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              });

        const url = URL.createObjectURL(docxBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // 释放临时 URL，避免内存泄漏
        URL.revokeObjectURL(url);

        this.$message.success("Word 导出成功");
      } catch (error) {
        console.error("Word 导出失败:", error);
        this.$message.error("Word 导出失败，请重试");
      } finally {
        this.isLoading = false;
        this.exporting = false;
      }
    },

    onBackToMainPage() {
      // 返回主编辑器首页。
      this.$router.push("/");
    },

    onExportBtnClick() {
      // Word 导出需要拿到 Vditor 渲染后的 HTML 内容。
      const contentElement = document.querySelector(
        "#khaleesi .vditor-preview .vditor-reset",
      );
      if (!contentElement) {
        this.$message.warning("预览内容尚未渲染完成，请稍后再试");
        return;
      }
      this.isLoading = true;
      this.exporting = true;
      const filename = getExportFileName();
      this.exportAndDownloadDocx(contentElement, filename);
    },
  },
};
</script>
