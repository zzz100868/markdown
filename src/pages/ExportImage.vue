<!-- @format -->

<!-- 图片导出页：将预览内容渲染并保存为图片。 -->

<template>
  <!-- 导出页外壳：顶部按钮组 + 下方 Markdown 预览 -->
  <div class="export-page">
    <div class="button-group">
      <el-button round @click="onBackToMainPage">返回主页</el-button>
      <el-button
        round
        @click="onExportBtnClick"
        type="primary"
        :loading="isExporting"
      >
        {{ isExporting ? "正在导出..." : "生成导出" }}
      </el-button>
    </div>
    <PreviewVditor v-if="pdata !== null" :pdata="pdata" />
  </div>
</template>

<script>
import { generateScreenshot } from "@helper/export";
import PreviewVditor from "@components/PreviewVditor";
import { getExportFileName } from "@helper/utils";
import { useDocStore } from "@/stores/docStore";

export default {
  name: "export-image",

  setup() {
    const store = useDocStore();
    return { store };
  },

  data() {
    // 先从 localStorage 同步读取一次，保证页面刚打开时就有内容可预览。
    // mounted 后会再通过 Pinia store 读取最新状态。
    const activeDoc = localStorage.getItem("arya_active_doc");
    const content = activeDoc
      ? localStorage.getItem("arya_doc_" + activeDoc) || ""
      : "";
    return {
      isLoading: true, // 导出过程中用于标记页面正在处理
      isExporting: false, // 按钮 loading 状态，防止重复点击
      pdata: content, // 传给 PreviewVditor 的 Markdown 内容
    };
  },

  async mounted() {
    // store.init 会处理旧数据迁移，并读取当前文档内容。
    await this.store.init();
    this.pdata = this.store.currentContent || "";
  },

  components: {
    PreviewVditor,
  },

  methods: {
    // 生成截图并触发下载
    async exportAndDownloadImg(element, filename) {
      try {
        const canvas = await generateScreenshot(element);
        const isSupportDownload = "download" in document.createElement("a");
        if (isSupportDownload) {
          const link = document.createElement("a");
          link.download = filename;
          // toDataURL 把 Canvas 转成 Base64 图片数据
          link.href = canvas.toDataURL("image/png");
          link.click();
        }
      } catch (error) {
        console.error("导出图片失败:", error);
        this.$message.closeAll();
        this.$message.error("导出图片失败，请检查控制台获取详细错误信息");
      } finally {
        this.isLoading = false;
        this.isExporting = false;
      }
    },

    onBackToMainPage() {
      // 返回编辑器首页。
      this.$router.push("/");
    },

    onExportBtnClick() {
      // 截图必须等预览 DOM 渲染完成后才能进行。
      const element = document.querySelector("#khaleesi .vditor-preview");
      if (!element) {
        this.$message.warning("预览内容尚未渲染完成，请稍后再试");
        return;
      }
      this.isLoading = true;
      this.isExporting = true;
      const filename = getExportFileName();
      this.exportAndDownloadImg(element, filename);
    },
  },
};
</script>
