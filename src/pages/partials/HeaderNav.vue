<!-- 顶部导航组件：提供页面跳转和常用操作入口。 -->

<template>
  <!-- header-wrapper 固定在页面顶部，所有主页面和导出页面共用这套导航 -->
  <header class="header-wrapper">
    <h1 class="header-area">
      <!-- 左侧品牌区域：点击回到首页 -->
      <a href="/" class="header-link" target="_self">
        <img
          class="mark-markdown"
          src="@assets/images/markdown.png"
          alt="Arya 在线 Markdown 编辑器 Logo"
        />
        <strong v-if="!isMobile" class="header-text">{{ titleText }}</strong>
      </a>

      <!-- 右侧按钮组：文档列表、关于页、导入、导出设置、全屏 -->
      <nav class="button-group">
        <!-- 移动端才显示的侧边栏按钮，桌面端侧边栏自己有收起入口 -->
        <span
          v-if="isMobile"
          class="hint--bottom action-btn"
          @click="$emit('toggle-sidebar')"
          aria-label="文档列表"
        >
          <icon class="header-icon" name="sidebar" />
        </span>

        <!-- 关于页面入口 -->
        <router-link to="/about-arya" class="header-link">
          <span class="hint--bottom" aria-label="关于 Arya">
            <icon class="header-icon" name="document" />
          </span>
        </router-link>

        <!-- 导入本地 Markdown 文件 -->
        <span
          class="hint--bottom action-btn"
          @click="onImportClick"
          aria-label="导入文件"
        >
          <icon class="header-icon" name="upload" />
        </span>

        <!-- 设置/导出下拉菜单：command 值就是要跳转的路由 -->
        <el-dropdown trigger="click" @command="handleCommand">
          <span
            class="hint--bottom el-dropdown-link action-btn"
            aria-label="设置"
          >
            <icon class="header-icon" name="setting" />
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item disabled>
                <icon class="dropdown-icon" name="set-style" />
                <span class="dropdown-text">自定义样式</span>
              </el-dropdown-item>
              <el-dropdown-item command="/export/ppt" divided>
                <icon class="dropdown-icon" name="preview" />
                <span class="dropdown-text">{{ exportTextMap["/export/ppt"] }}</span>
              </el-dropdown-item>
              <el-dropdown-item command="/export/png" divided>
                <icon class="dropdown-icon" name="download" />
                <span class="dropdown-text">{{ exportTextMap["/export/png"] }}</span>
              </el-dropdown-item>
              <el-dropdown-item command="/export/pdf">
                <icon class="dropdown-icon" name="download" />
                <span class="dropdown-text">{{ exportTextMap["/export/pdf"] }}</span>
              </el-dropdown-item>
              <el-dropdown-item command="/export/docx">
                <icon class="dropdown-icon" name="download" />
                <span class="dropdown-text">{{ exportTextMap["/export/docx"] }}</span>
              </el-dropdown-item>
              <el-dropdown-item command="/export/html" divided>
                <icon class="dropdown-icon" name="download" />
                <span class="dropdown-text">{{ exportTextMap["/export/html"] }}</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- 桌面端全屏按钮：移动端浏览器全屏体验不稳定，所以隐藏 -->
        <span
          v-if="!isMobile"
          class="hint--bottom full-screen action-btn"
          @click="onFullScreenClick"
          aria-label="全屏"
        >
          <icon class="header-icon" name="full-screen" />
        </span>
      </nav>
    </h1>
  </header>
</template>

<script>
import "hint.css";
import { exportTextMap } from "@config/constant";
import { useDocStore } from "@/stores/docStore";

export default {
  name: "HeaderNav",

  setup() {
    const store = useDocStore();
    return { store };
  },

  data() {
    return {
      isMobile: window.innerWidth <= 768,
      titleText: window.$appTitle,
      exportTextMap,
    };
  },

  mounted() {
    window.addEventListener("resize", this.onResize);
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.onResize);
  },

  methods: {
    onResize() {
      this.isMobile = window.innerWidth <= 768;
    },

    launchFullScreen() {
      const element = document.getElementById("vditor") || document.documentElement;
      if (!element) return;
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      }
    },

    cancelFullScreen() {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    },

    onThemeClick() {},

    onFullScreenClick() {
      const isFullScreen =
        document.fullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement ||
        document.webkitFullscreenElement;
      isFullScreen ? this.cancelFullScreen() : this.launchFullScreen();
    },

    handleCommand(command) {
      this.$router.push(command);
    },

    onImportClick() {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".md,.markdown,text/markdown";
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = async (e) => {
            const content = e.target.result;
            const title = (file.name || "").replace(/\.(md|markdown)$/i, "") || "导入的文档";
            const doc = await this.store.createDoc(title);
            await this.store.selectDoc(doc.id);
            await this.store.saveContent(content);
            this.$eventBus.emit("reload-content");
          };
          reader.readAsText(file);
        }
      };
      input.click();
    },
  },
};
</script>

<style lang="less">
@import "./../../assets/styles/style.less";

[class*="hint--"]:after {
  border-radius: 4px;
  font-size: 12px;
  letter-spacing: 0.02em;
  padding: 6px 10px;
}

.el-popper[x-placement^="bottom"] {
  margin-top: 8px;
}

.el-dropdown .el-dropdown-link {
  height: @header-height;
  .flex-box-center(column);
}

.hint--bottom {
  cursor: pointer;
  pointer-events: all;
}

.el-dropdown-menu {
  margin: 0;
  border-radius: 8px;
  box-shadow: 0 12px 32px -8px rgba(0, 0, 0, 0.12), 0 4px 8px -2px rgba(0, 0, 0, 0.04);
  border: 1px solid @border-subtle;
  padding: 6px;

  .dropdown-icon {
    fill: @text-secondary;
    vertical-align: middle;
    margin-right: 10px;
  }

  .dropdown-text {
    vertical-align: middle;
    font-size: 14px;
    color: @text-secondary;
  }

  .el-dropdown-menu__item {
    border-radius: 6px;
    padding: 8px 12px;
    line-height: 1.4;
    transition: background-color 0.15s ease;

    &:hover {
      background-color: @bg-hover;
    }
  }

  .el-dropdown-menu__item.is-disabled {
    color: @text-quaternary;

    .dropdown-icon {
      fill: @text-quaternary;
    }
  }
}

.header-wrapper {
  position: fixed;
  top: 0;
  width: 100%;
  height: @header-height;
  line-height: @header-height;
  z-index: @hint-css-zindex;
  background-color: rgba(255, 255, 255, 0.92);
  backdrop-filter: saturate(180%) blur(12px);
  -webkit-backdrop-filter: saturate(180%) blur(12px);
  border-bottom: 1px solid @border-subtle;
  transition: border 0.3s ease, background 0.3s ease;

  .header-area {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 100%;
    padding: 0 1.5rem;
    max-width: @max-body-width;
    margin: auto;
    text-align: left;

    .header-link {
      display: inline-flex;
      align-items: center;
      height: @header-height;
      line-height: @header-height;

      .mark-markdown {
        width: 36px;
        height: 36px;
        vertical-align: middle;
      }

      .header-text {
        margin-left: 10px;
        font-size: @font-medium;
        font-weight: 600;
        color: @text-primary;
        letter-spacing: -0.01em;
        vertical-align: middle;
      }
    }

    .button-group {
      display: flex;
      align-items: center;
      gap: 2px;

      .header-icon {
        fill: @text-secondary;
        width: 18px;
        height: 18px;
      }

      .action-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        border-radius: 8px;
        transition: background-color 0.15s ease, transform 0.1s ease;

        &:hover {
          background-color: @bg-hover;
        }

        &:active {
          transform: scale(0.96);
        }
      }
    }
  }
}

@media (max-width: 960px) {
  .header-wrapper {
    .header-area {
      display: flex;
      width: 100%;
      padding: 0 12px;
      .flex-box-center(row, space-between);

      .header-link {
        display: inline;
      }
    }
  }
}
</style>
