/**
 * LocalStorageAdapter.js 的作用：
 * 它是负责跟浏览器的“本地储物柜（localStorage）”打交道的搬运工。
 * 它的任务是把你写的 Markdown 标题、正文、列表安全地存进这个储物柜。
 */

import { IStorage } from "./IStorage";

// 【柜子的名字/抽屉标签】
// 集中管理名字的好处是：万一以后想改名字，只改这里就行，不用去每个几百行的代码里找。
const KEY_DOCUMENTS = "arya_documents";   // 存“文档目录”（也就是标题、时间这些信息，是个数组）的抽屉名
const KEY_ACTIVE_DOC = "arya_active_doc"; // 存“当前你正在看哪篇文档的 ID”的抽屉名
const LEGACY_KEY = "vditorvditor";        // 老版本系统用的抽屉名，咱们要把它里的东西搬出来后丢掉
const CONTENT_PREFIX = "arya_doc_";       // 正文抽屉的前缀，真实抽屉名类似 "arya_doc_加上乱码字母"

/**
 * 助手工具 1：生成一个在这个世界上独一无二的随机 ID
 * 原理：用现在的时间数字（Date.now） +  一段随机的字母数字（Math.random 后截取）
 */
function generateId() {
  return `doc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * 助手工具 2：从储物柜里拿出“文档目录”并排好队
 */
function getDocsList() {
  try {
    // localStorage.getItem(标签)：从浏览器储物柜里拿东西
    const raw = localStorage.getItem(KEY_DOCUMENTS);
    
    // JSON.parse：因为储物柜只能放“纯字符串”，拿出来的 raw 是个字符串，
    // 需要用 JSON.parse 把它像拆箱一样，变回能操作的数组 []
    const list = raw ? JSON.parse(raw) : [];

    // list.sort()：数组的排队语法。
    // 这里是用 b的更新时间 减去 a的更新时间，为了把最新的排在前面（降序）
    return list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  } catch {
    // try...catch 是为了防止拆箱失败报错（比如数据被搞坏了），兜底返回个空数组
    return [];
  }
}

/**
 * 助手工具 3：把“文档目录”装箱放回储物柜
 */
function setDocsList(list) {
  // JSON.stringify：把整理好的数组重新打包压缩成“纯字符串”
  // localStorage.setItem(标签, 内容)：把打包好的字符串塞进储物柜
  localStorage.setItem(KEY_DOCUMENTS, JSON.stringify(list));
}

// export class 表示把下面这个大工厂给暴露出去，别人可以通过 import 来用它
export class LocalStorageAdapter extends IStorage {
  
  // 1. 获取所有的文档元数据（给左边那个带标题的列表用的）
  async getDocuments() {
    return getDocsList();
  }

  // 2. 按特定 ID，只在一堆目录里找那一篇文档的元数据
  async getDocument(id) {
    const list = getDocsList();
    // list.find((d) => ...) 是数组的方法
    // 意思是：挨个检查列表里的文档，只要有哪篇的 id 跟我手里的这个对上了，就把那篇拿出来。没找到就返回 null
    return list.find((d) => d.id === id) || null;
  }

  // 3. 把文档正文从储物柜拿出来（正文是单独装抽屉的）
  async getDocContent(id) {
    if (!id) return ""; // 如果连查哪篇都没告诉我，直接给个空的
    try {
      // 根据 "抽屉前缀 + ID" 拼出正文抽屉的名字，直接拿内容！
      return localStorage.getItem(CONTENT_PREFIX + id) || "";
    } catch {
      return "";
    }
  }

  // 4. 保存你要写的内容（防抖后悄悄执行的就是这个）
  async saveDocContent(id, content) {
    if (!id) return null;
    const key = CONTENT_PREFIX + id;
    
    // 把输入的内容原封不动存进去。
    // 如果啥内容也没有(null/undefined)，就存个空字符串 ""
    localStorage.setItem(key, content == null ? "" : String(content));
    
    const list = getDocsList();
    // 把目录也找出来，只为了把带有这篇日记名字的元数据信息回传给调用方用
    const doc = list.find((d) => d.id === id);
    return doc || null;
  }

  // 5. 新建一篇新文档
  async createDocument(title = "未命名文档") {
    const now = Date.now(); // 获取此时此刻的时间
    
    // 造一个新文档的身份证（包含 ID、标题和当前时间）
    const doc = {
      id: generateId(),
      title: String(title || "未命名文档").trim() || "未命名文档", // trim() 是去掉文字两头的空白空格
      createdAt: now, // created=创建，At=在什么时候。连起来就是“创建时间”
      updatedAt: now, // updated=更新，At=在什么时候。连起来就是“最后修改时间”
    };
    
    const list = getDocsList(); // 先拿到老目录
    // list.unshift(doc) 是个数组语法，意思是：这有个新包裹，快给我强行插队塞到列表的"最前面"！
    list.unshift(doc);
    
    setDocsList(list); // 强行插队后，新目录打包塞进储物柜
    
    // 然后给新文档分配一个干净的“空抽屉”，专门留着以后放它的正文
    localStorage.setItem(CONTENT_PREFIX + doc.id, "");
    return doc;
  }

  // 6. 给文档改名字
  async renameDocument(id, newTitle) {
    const list = getDocsList();
    const doc = list.find((d) => d.id === id);
    if (!doc) return false; // 要改名的文档没找到，直接罢工走人
    
    doc.title = String(newTitle || "").trim() || "未命名文档"; // 换上新名字
    doc.updatedAt = Date.now(); // 把它的最新更新时间改到“现在”，这样它在侧边栏就会自动升到最上面了
    
    setDocsList(list); // 把改了名字/时间的目录放回储物柜
    return true;
  }

  // 7. 删除不要的文档
  async deleteDocument(id) {
    if (!id) return false;
    
    // list.filter：过滤数组。
    // 意思就是把数组过筛子：只要不是那个你要删的 ID 的文档，我都留着；恰好那个你要删的，漏下去丢掉。
    const list = getDocsList().filter((d) => d.id !== id);
    setDocsList(list); // 把没被丢掉剩下的目录全部存回去
    
    // removeItem：这是浏览器原生的粗暴删除法，直接把它的“正文抽屉”拔出来倒垃圾桶
    localStorage.removeItem(CONTENT_PREFIX + id);

    // 下面这步也很关键：
    // 如果你正在看着这篇文档（active 就是你正在看，删的就是它），为了避免页面卡住，我们要强制帮你翻到下一页
    const active = localStorage.getItem(KEY_ACTIVE_DOC);
    if (active === id) {
      const next = list[0]; // 随便抓目录里剩下的第一篇
      if (next) {
        localStorage.setItem(KEY_ACTIVE_DOC, next.id); // 登记：以后我就看这新的一篇了
      } else {
        localStorage.removeItem(KEY_ACTIVE_DOC); // 连一篇都没了，清空视野
      }
    }
    return true;
  }

  // 8. 拿到“上一次你关网页前正在看的是哪篇？”的 ID
  async getActiveDocId() {
    return localStorage.getItem(KEY_ACTIVE_DOC);
  }

  // 9. 更新“我目前选的正在看哪篇？”的 ID
  async setActiveDocId(id) {
    if (id) {
      localStorage.setItem(KEY_ACTIVE_DOC, id); // 有就存
    } else {
      localStorage.removeItem(KEY_ACTIVE_DOC);  // 想置空的话就把这个抽屉直接删掉
    }
  }

  // 10. 因为版本太老导致要“搬家”的方法
  // 从一间旧平房（只支持存 1 篇，叫 vditorvditor），把旧包裹搬到新的楼房（支持存 N 篇）里
  async migrateFromLegacy(defaultContent = "") {
    const list = getDocsList();
    if (list.length > 0) return; // 如果新楼房里已经有东西了，代表以前早就搬过家了，就不管了

    // 优先看旧平房还有没有漏下的旧内容，没有就用空的内容
    const legacyContent = localStorage.getItem(LEGACY_KEY);
    const content = legacyContent != null ? legacyContent : defaultContent;
    
    // 新建一篇名为“未命名文档”的新房，把平房的东西放进去，然后把那破平房给拆了（removeItem）
    const doc = await this.createDocument("未命名文档");
    await this.saveDocContent(doc.id, content);
    await this.setActiveDocId(doc.id);
    
    localStorage.removeItem(LEGACY_KEY);
  }
}

// 导出一个做好的新搬运工机器人，让别的 JS 都可以拿去调用它上面的所有功能
export const localStorageAdapter = new LocalStorageAdapter();
