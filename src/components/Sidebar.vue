<!-- @format -->

<!-- Sidebar.vue - 侧边栏：文档列表、新建、重命名、删除 -->

<template>
  <!-- aside 是固定在左侧的侧边栏容器，宽度由 collapsed 状态决定 -->
  <aside
    class="fixed left-0 z-[100] bg-white flex transition-[width] duration-300 ease-smooth"
    :class="collapsed ? 'w-11' : 'w-[248px]'"
    :style="{ top: '56px', height: 'calc(100vh - 56px)' }"
  >
    <!-- 收起状态：只显示一个图标按钮，点击后通知父组件展开侧边栏 -->
    <div
      v-show="collapsed"
      class="w-11 min-w-11 h-full flex flex-col items-center justify-center cursor-pointer text-text-tertiary transition-all duration-200 hover:bg-surface-hover hover:text-ink"
      @click="$emit('toggle-sidebar')"
      aria-label="展开侧边栏"
      title="展开文档列表"
    >
      <icon name="sidebar" class="w-[18px] h-[18px] opacity-70" />
    </div>

    <!-- 展开状态：展示文档列表、操作按钮和底部新建按钮 -->
    <div
      v-show="!collapsed"
      class="flex-1 min-w-0 flex flex-col overflow-hidden"
    >
      <!-- 侧边栏头部：标题 + 收起按钮 -->
      <div class="px-4 pt-4 pb-2 flex items-center justify-between gap-2">
        <span class="text-xs font-semibold uppercase tracking-wide-2 text-text-tertiary">
          文档列表
        </span>
        <span
          class="cursor-pointer text-text-quaternary w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-surface-hover hover:text-ink text-xs"
          aria-label="收起侧边栏"
          @click="$emit('toggle-sidebar')"
        >
          &lt;
        </span>
      </div>

      <!-- 文档列表：store.sortedDocuments 已经按更新时间排好序 -->
      <div class="flex-1 overflow-y-auto px-2 py-1.5">
        <div
          v-for="doc in store.sortedDocuments"
          :key="doc.id"
          class="group flex items-center px-3 py-[7px] mb-0.5 rounded-lg cursor-pointer transition-all duration-150 ease-snappy relative text-text-secondary"
          :class="
            doc.id === activeDocId
              ? 'bg-surface-active text-ink font-medium'
              : 'hover:bg-surface-hover hover:text-ink'
          "
          @click="onSelectDoc(doc.id)"
        >
          <!-- 普通展示态：显示文档标题，过长时省略 -->
          <span
            v-if="editingId !== doc.id"
            class="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[13px] text-left leading-snug"
            :title="doc.title"
          >
            {{ doc.title || "未命名文档" }}
          </span>

          <!-- 重命名态：把标题文本替换成 input，失焦/回车提交，Esc 取消 -->
          <input
            v-else
            ref="renameInput"
            v-model="editingTitle"
            class="flex-1 min-w-0 px-2 py-[3px] text-[13px] border border-border bg-white rounded-md outline-none focus:ring-1 focus:ring-ink/10"
            @blur="submitRename"
            @keyup.enter="submitRename"
            @keyup.esc="cancelRename"
            @click.stop
          />

          <!-- 当前文档右侧操作区：hover 时出现重命名和删除按钮 -->
          <span
            v-if="doc.id === activeDocId && editingId !== doc.id"
            class="sidebar-item-actions inline-flex items-center gap-0.5 opacity-0 transition-opacity duration-150"
            @click.stop
          >
            <span
              class="p-1 text-text-quaternary text-xs rounded flex items-center justify-center transition-all duration-150 hover:bg-white hover:text-ink"
              aria-label="重命名"
              @click.stop="startRename(doc)"
            >
              ✎
            </span>
            <span
              class="p-1 text-text-quaternary text-xs rounded flex items-center justify-center transition-all duration-150 hover:bg-white hover:text-red-600"
              aria-label="删除"
              @click.stop="onDeleteDoc(doc)"
            >
              ✕
            </span>
          </span>
        </div>
      </div>

      <!-- 底部新建按钮：创建一篇空文档后交给父组件切换过去 -->
      <div class="p-3 border-t border-border-subtle">
        <button
          type="button"
          class="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-[13px] font-medium text-ink bg-white border border-border rounded-lg cursor-pointer transition-all duration-200 hover:border-border-strong hover:bg-surface-hover active:translate-y-0 active:bg-surface-active"
          @click="onNewDoc"
        >
          <icon name="add" class="w-3.5 h-3.5" />
          <span>新建文档</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<script>
import { ElMessageBox } from "element-plus";
import Icon from "./Icon";
import { useDocStore } from "@/stores/docStore";

export default {
  name: "Sidebar",

  components: { Icon },

  props: {
    collapsed: {
      type: Boolean,
      default: false,
    },
    activeDocId: {
      type: String,
      default: null,
    },
  },

  setup() {
    const store = useDocStore();
    return { store };
  },

  data() {
    return {
      editingId: null,
      editingTitle: "",
    };
  },

  methods: {
    onSelectDoc(id) {
      if (this.editingId) return;
      this.$emit("select-doc", id);
    },

    async onNewDoc() {
      try {
        const doc = await this.store.createDoc("未命名文档");
        this.$emit("select-doc", doc.id);
      } catch (e) {
        console.error("[Sidebar] onNewDoc error", e);
      }
    },

    startRename(doc) {
      this.editingId = doc.id;
      this.editingTitle = doc.title || "未命名文档";
      this.$nextTick(() => {
        const ref = this.$refs.renameInput;
        const input = Array.isArray(ref) ? ref[0] : ref;
        if (input) input.focus();
      });
    },

    async submitRename() {
      if (this.editingId == null) return;
      const title = String(this.editingTitle || "").trim() || "未命名文档";
      await this.store.renameDoc(this.editingId, title);
      this.editingId = null;
      this.editingTitle = "";
    },

    cancelRename() {
      this.editingId = null;
      this.editingTitle = "";
    },

    onDeleteDoc(doc) {
      ElMessageBox.confirm("确定要删除该文档吗？删除后无法恢复。", "删除文档", {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          await this.store.deleteDoc(doc.id);
          this.$emit("doc-deleted", doc.id);
        })
        .catch(() => {});
    },
  },
};
</script>

<style scoped>
.group:hover .sidebar-item-actions {
  opacity: 1;
}
</style>
