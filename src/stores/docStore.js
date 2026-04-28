/**
 * docStore.js 就像是整个应用的“统筹大管家”或者叫“店长”。
 * 它的工作就是：统一管理所有的文档数据（记下所有的文档名单、当前大家在看哪一篇、以及当前正文的内容）。
 * 页面上（Vue组件）不管哪个按钮想保存、想新建、想删除，都来找这位大管家！
 * 大管家收到命令后，再自己跑去指派底层的“转换头员工”（localStorageAdapter）去干脏活累活。
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { localStorageAdapter } from "@/adapters/LocalStorageAdapter";

// defineStore 就是在注册一个名为 "doc" 的数据中心
export const useDocStore = defineStore("doc", () => {
  // ----------------- 【第一部分：状态（State） - 大管家的记事本】 -----------------
  // ref() 是 Vue 里带来魔法的工具：被 ref 包裹的值就像装了监控和警报的地方。
  // 一旦里面的值发生改变，网页上用到它的地方就会“自动刷新”！就像个大喇叭，根本不需要你手动去改网页。

  // documents: 用来存所有的文档清单（相当于一个目录表，包含标题、时间等，但不含几十万字的正文，怕卡）
  const documents = ref([]);
  
  // activeDocId: 记住当前正在编辑的文档的“身份证号（ID）”
  const activeDocId = ref(null);
  
  // currentContent: 当前正在编辑的这篇文档的“真正的、长篇大论的正文文字”
  const currentContent = ref("");
  
  // loading: 一个状态开关，用来告诉页面“我现在是不是查数据查得满头大汗”。
  // 如果为 true，页面可以马上在屏幕正中央画个圈圈转一转，假装很努力在加载。
  const loading = ref(false);

  // ----------------- 【第二部分：计算属性（Getters） - 聪明的小算盘】 -----------------
  // computed() 就像一个“雇佣来的算账先生”。它会死死盯着上面 ref 状态看。
  // 状态只要有一点风吹草动，算账先生就会立刻自动重新算出一个新结果给你。

  // activeDoc：老板问“我现在看的是哪篇信息呀？”
  // 算账先生：立刻根据当前记得的身份证号 (activeDocId)，从长串名单 (documents) 里把“这篇文档的所有资料”给揪出来告诉你。
  const activeDoc = computed(() => {
    // 翻译：去 documents (名单) 里找 (find) id 完全匹配的那一篇。找不到？那就当无事发生（返回 null）。
    return documents.value.find((d) => d.id === activeDocId.value) || null;
  });

  // sortedDocuments：专门给左侧“历史文档栏”排座位用的功能！
  // 它负责把文档清单按照“最后被摸过的时间（updatedAt）”从大到小（也就是从最新到最旧）排好队。
  const sortedDocuments = computed(() => {
    // 这里的 [...documents.value] 意思是“原名单不要动！我复印一份拿来排兵布阵，免得把原数据搞乱了”。
    return [...documents.value].sort(
      (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0),
    );
  });

  // ----------------- 【第三部分：动作/方法（Actions） - 管家的服务窗口】 -----------------
  // 这些就是大管家能对外提供的“按口服务”。页面的大大小小的按钮一按，其实就是给这些方法发号施令。

  // ==========================================
  // 方法 1：init (初始化页面)
  // 【核心作用】：网页刚打开时被调用，负责“准备营业”，把旧数据升级、把缓存里的目录和正文全拿出来显示。
  // 【具体步骤】：
  // 1. 检查并搬迁旧版本遗留的数据 (`migrateFromLegacy`)。
  // 2. 从储物柜读取“文档目录名单”。
  // 3. 看看上次关网页前在看哪篇，继续打开它；如果这是第一次用，就默认强制打开第一篇文章。
  // 4. 读取当前打开的这篇文章的“正文文字”展示给用户。
  // ==========================================
  async function init(defaultContent = "") {
    loading.value = true;
    await localStorageAdapter.migrateFromLegacy(defaultContent);
    documents.value = await localStorageAdapter.getDocuments();
    activeDocId.value = await localStorageAdapter.getActiveDocId();

    if (!activeDocId.value && documents.value.length > 0) {
      activeDocId.value = documents.value[0].id;
      await localStorageAdapter.setActiveDocId(activeDocId.value);
    }

    if (activeDocId.value) {
      currentContent.value = await localStorageAdapter.getDocContent(
        activeDocId.value,
      );
    }
    loading.value = false;
  }

  // ==========================================
  // 方法 2：refresh (刷新文档列表)
  // 【核心作用】：用来刷新左侧的“侧边栏列表数据”，保证页面显示的是最新的文档名单。
  // 【调用时机】：只要对文档进行了“新建”、“改名”或者“保存正文(会改变最后更新时间)”，就要调它更新列表序列。
  // ==========================================
  async function refresh() {
    documents.value = await localStorageAdapter.getDocuments();
    activeDocId.value = await localStorageAdapter.getActiveDocId();
  }

  // ==========================================
  // 方法 3：selectDoc (点选某篇文档)
  // 【核心作用】：用户在左侧点其他文档时触发，负责把页面中间的内容“切换”到这篇新选中的文档。
  // 【具体步骤】：
  // 1. 记住这篇新点选文档的 ID（发高亮）。
  // 2. 把它的 ID 存进储物柜，防止页面刷新后迷路。
  // 3. 根据这个 ID 去底层仓库挖出正文，替换掉当前的屏幕文字。
  // ==========================================
  async function selectDoc(id) {
    if (!id) return;
    activeDocId.value = id;
    await localStorageAdapter.setActiveDocId(id);
    currentContent.value = await localStorageAdapter.getDocContent(id);
  }

  // ==========================================
  // 方法 4：createDoc (新建文档)
  // 【核心作用】：创建一篇新文章。
  // 【具体步骤】：调动底层在储物柜硬生生开辟一篇新文章，并且立刻调用 refresh 刷新目录，让新文章出现在列表里。
  // ==========================================
  async function createDoc(title = "未命名文档") {
    const doc = await localStorageAdapter.createDocument(title);
    await refresh();
    return doc;
  }

  // ==========================================
  // 方法 5：saveContent (保存当前正文)
  // 【核心作用】：用户打完字按保存时调用，负责把长篇大论的正文永久存进仓库。
  // 【具体步骤】：
  // 1. 把新正文存进本地缓存放好。
  // 2. 立刻调用 refresh 刷新列表！（因为保存会让这篇文章的“最后修改时间”变新，刷新后它就会瞬间置顶排在最上面）。
  // ==========================================
  async function saveContent(content) {
    if (!activeDocId.value) return null;
    const doc = await localStorageAdapter.saveDocContent(
      activeDocId.value,
      content,
    );
    await refresh();
    currentContent.value = content;
    return doc;
  }

  // ==========================================
  // 方法 6：renameDoc (重命名文档)
  // 【核心作用】：用户改文档名字时调用，负责去仓库改个名字，然后再刷新列表，让旁边看得见新的名字。
  // ==========================================
  async function renameDoc(id, newTitle) {
    const ok = await localStorageAdapter.renameDocument(id, newTitle);
    if (ok) await refresh();
    return ok;
  }

  // ==========================================
  // 方法 7：deleteDoc (删除文档)
  // 【核心作用】：用户点击垃圾桶时调用，负责彻底抹除文章数据。
  // 【具体步骤】：
  // 1. 底层干掉这篇文档。
  // 2. 刷新左侧列表（它就不见了）。
  // 3. 【防白屏设计】：如果用户删掉的正好是屏幕中间正捧着看的这一篇，大管家会马上随便抓上面“最新鲜”的另一篇打开当替补；如果全都删光了，就彻底清空白板。
  // ==========================================
  async function deleteDoc(id) {
    const ok = await localStorageAdapter.deleteDocument(id);
    if (ok) {
      await refresh();
      if (activeDocId.value === id) {
        const next = sortedDocuments.value[0];
        if (next) {
          await selectDoc(next.id);
        } else {
          activeDocId.value = null;
          currentContent.value = "";
        }
      }
    }
    return ok;
  }

  // ==========================================
  // 方法 8：loadContent (静默读取正文内容)
  // 【核心作用】：专门给特殊的小功能用的（比如偷偷在背后获取数据去导出成PDF或图片）。
  // 【特点】：只管拿数据看，但不改变 currentContent 显示的内容，不会打断用户正在编辑的其他文章。
  // ==========================================
  async function loadContent(id) {
    if (!id) return "";
    return localStorageAdapter.getDocContent(id);
  }

  // ----------------- 【第四部分：暴露 / 导出大礼包】 -----------------
  // 大管家把上面辛辛苦苦折腾出的所有状态、精密算盘、和对外的所有呼叫面板，
  // 全部打包成一个硕大的礼包一并对外暴露！
  // 今后外面的 Vue 页面只要在代码里写一句：const store = useDocStore(); 就能在这个商城里随便进货！
  return {
    documents,
    activeDocId,
    currentContent,
    loading,
    activeDoc,
    sortedDocuments,
    init,
    refresh,
    selectDoc,
    createDoc,
    saveContent,
    renameDoc,
    deleteDoc,
    loadContent,
  };
});

