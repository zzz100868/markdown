<!-- @format -->

<!-- PDF 导出页：将 Markdown 预览内容导出为 PDF。 -->

<template>
  <!-- PDF 导出页：展示预览，并把预览 DOM 交给 html2pdf.js 生成 PDF -->
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
import html2pdf from "html2pdf.js";
import PreviewVditor from "@components/PreviewVditor";
import { getExportFileName } from "@helper/utils";
import { useDocStore } from "@/stores/docStore";

export default {
  name: "export-pdf",

  setup() {
    const store = useDocStore();
    return { store };
  },

  data() {
    // 页面创建时先从 localStorage 兜底读取当前文档，避免预览区域短暂空白。
    const activeDoc = localStorage.getItem("arya_active_doc");
    const content = activeDoc
      ? localStorage.getItem("arya_doc_" + activeDoc) || ""
      : "";
    return {
      isLoading: true, // 页面/导出处理中的状态标记
      pdata: content, // 传给 PreviewVditor 的 Markdown 原文
      exporting: false, // 导出按钮状态，防止重复触发
    };
  },

  async mounted() {
    // 挂载后用 store 读取一遍正式数据，确保与主编辑器一致。
    await this.store.init();
    this.pdata = this.store.currentContent || "";
  },

  components: {
    PreviewVditor,
  },

  methods: {
    // 使用 html2pdf.js 把 DOM 元素转换为 PDF 并下载
    exportAndDownloadPdf(element, filename) {
      const scale = window.devicePixelRatio;
      const opt = {
        margin: 1,
        filename: filename,
        html2canvas: {
          scale,
          useCORS: true,
          logging: false,
          scrollY: 0,
          scrollX: 0,
          // 排除不需要的工具栏元素
          ignoreElements: (element) => {
            return element.classList.contains("vditor-preview__action");
          },
        },
        jsPDF: {
          unit: "in",
          format: "letter",
          orientation: "portrait",
        },
      };
      html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => {
          this.isLoading = false;
          this.exporting = false;
        })
        .catch((error) => {
          console.error("PDF导出失败:", error);
          this.isLoading = false;
          this.exporting = false;
          this.$message.error("PDF导出失败，请重试");
        });
    },

    onBackToMainPage() {
      // 返回主编辑器页面。
      this.$router.push("/");
    },

    onExportBtnClick() {
      // 优先选择 Vditor 生成的 preview 容器；找不到时退回到 khaleesi 根节点。
      const visibleElement = document.querySelector(
        "#khaleesi .vditor-preview",
      );
      const element = visibleElement || document.querySelector("#khaleesi");
      if (!element) {
        this.$message.warning("预览内容尚未渲染完成，请稍后再试");
        return;
      }
      this.isLoading = true;
      this.exporting = true;
      const filename = getExportFileName();
      this.exportAndDownloadPdf(element, filename);
    },
  },
};
</script>
