<!-- @format -->

<!-- PPT 导出页：将 Markdown 内容导出为演示文稿。 -->

<template>
  <!-- Reveal.js 要求的 DOM 结构：.reveal > .slides > section -->
  <div class="export-ppt">
    <div class="reveal">
      <div class="slides">
        <section
          data-markdown
          :data-separator="slideSeparator"
          :data-separator-vertical="verticalSlideSeparator"
        >
          <textarea ref="slideTemplate" data-template></textarea>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import Reveal from "reveal.js";
import "reveal.js/css/reset.css";
import "reveal.js/css/reveal.css";
import "reveal.js/css/theme/beige.css";
import "reveal.js/lib/css/zenburn.css";
import markedUrl from "reveal.js/plugin/markdown/marked.js?url";
import markdownUrl from "reveal.js/plugin/markdown/markdown.js?url";
import highlightUrl from "reveal.js/plugin/highlight/highlight.js?url";
import notesUrl from "reveal.js/plugin/notes/notes.js?url";
import searchUrl from "reveal.js/plugin/search/search.js?url";
import zoomUrl from "reveal.js/plugin/zoom-js/zoom.js?url";
import { updateHtmlStyle } from "@helper/utils";
import { useDocStore } from "@/stores/docStore";

export default {
  name: "export-ppt",

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
      savedMdContent: content,
      slideSeparator: "^\\r?\\n---\\r?\\n$",
      verticalSlideSeparator: "^\\r?\\n--\\r?\\n$",
    };
  },

  async mounted() {
    updateHtmlStyle();
    await this.store.init();
    this.savedMdContent = this.store.currentContent || "";
    const template = this.$refs.slideTemplate;
    if (template) {
      template.textContent = this.savedMdContent;
    }
    this.initReveal();
  },

  components: {},

  methods: {
    initReveal() {
      window.Reveal = Reveal;
      Reveal.initialize({
        controls: true,
        progress: true,
        center: true,
        hash: true,
        transition: "slide",
        display: "block",
        dependencies: [
          {
            src: markedUrl,
            condition: function () {
              return !!document.querySelector("[data-markdown]");
            },
          },
          {
            src: markdownUrl,
            condition: function () {
              return !!document.querySelector("[data-markdown]");
            },
          },
          {
            src: highlightUrl,
            async: true,
          },
          { src: searchUrl, async: true },
          { src: zoomUrl, async: true },
          { src: notesUrl, async: true },
        ],
      });
    },
  },
};
</script>

<style lang="less">
@import "./../assets/styles/style.less";

.export-ppt {
  width: 100%;

  .reveal {
    font-size: 2em;
    background-color: @bg-page;
    height: calc(100vh - 56px);

    h1 {
      font-size: 2em !important;
    }
  }
}
</style>
