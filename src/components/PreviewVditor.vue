<!-- Markdown 预览组件：封装 Vditor 预览渲染。 -->

<template>
  <!-- 预览容器：加载中显示 Element Plus loading，加载完成后只展示 Vditor 预览区 -->
  <div
    class="preview-vditor"
    v-loading="isLoading"
    element-loading-text="正在努力，请稍候..."
  >
    <!-- khaleesi 是预览版 Vditor 的挂载点，导出页面会从这里读取渲染后的 HTML -->
    <div v-show="!isLoading" id="khaleesi" class="vditor-preview" />
  </div>
</template>

<script>
// PreviewVditor - Markdown 预览组件
// 用于导出页面和关于页面，只显示预览不提供编辑功能

import Vditor from "vditor";
import "vditor/src/assets/less/index.less";
import { updateHtmlStyle, hideVditorTextarea } from "@helper/utils";

export default {
  name: "PreviewVditor",

  data() {
    return {
      isLoading: true,
    };
  },

  props: {
    pdata: {
      type: String,
      required: true,
      default: "",
    },
  },

  created() {
    updateHtmlStyle();
    this.setDefaultText();
  },

  components: {},

  mounted() {
    this.initVditor();
    hideVditorTextarea();
  },

  watch: {
    pdata: {
      immediate: false,
      handler(newVal) {
        this.setDefaultText();
        if (this.vditor && typeof this.vditor.setValue === "function") {
          this.vditor.setValue(newVal || "");
        }
      },
    },
  },

  methods: {
    initVditor() {
      const options = {
        width: "61.8%",
        mode: "sv",
        cdn: "/vditor",
        preview: {
          delay: 1000,
          show: true,
        },
        after: () => {
          if (this.vditor && typeof this.vditor.setValue === "function") {
            this.vditor.setValue(this.pdata || "");
          }
          this.isLoading = false;
        },
      };
      this.vditor = new Vditor("khaleesi", options);
    },

    setDefaultText() {
      localStorage.setItem("vditorkhaleesi", this.pdata);
    },
  },
};
</script>

<style lang="less">
@import "./../assets/styles/style.less";

.preview-vditor {
  width: 100%;
  height: 100%;
  min-height: 100vh;
  background-color: @bg-page;
  .flex-box-center(column);

  #khaleesi {
    max-width: 960px;
    min-width: 50vw;
    height: 100%;
    min-height: 100vh;
    margin: 20px auto;
    text-align: left;

    .vditor-toolbar {
      display: none;
    }

    .vditor-content {
      .vditor-sv {
        display: none !important;
      }
    }

    .vditor-preview {
      padding: 0 24px;
      background: @bg-surface;
      border-radius: 10px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
      border: 1px solid @border-subtle;

      .vditor-preview__action {
        display: none;
      }

      .vditor-reset {
        h1 {
          text-align: center;
        }
      }
    }
  }

  .vditor {
    border: 0;
  }
}

@media (max-width: 768px) {
  .preview-vditor {
    #khaleesi {
      width: 100% !important;
      margin: 0 !important;
    }

    .vditor-preview {
      padding: 0 10px;
      border-radius: 0;
      box-shadow: none;
      border: none;
    }

    .vditor-reset {
      table {
        display: inline-block;
        overflow-x: auto;
      }
    }
  }
}
</style>
