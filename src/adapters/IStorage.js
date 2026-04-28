/**
 * IStorage.js 是存储层的“接口说明书”。
 * 业务代码只关心这些方法，不关心底层到底是 localStorage、IndexedDB 还是远程接口。
 */

export class IStorage {
  // 获取所有文档的元数据列表（按 updatedAt 降序）
  async getDocuments() {
    throw new Error("getDocuments() must be implemented");
  }

  // 获取单篇文档的元数据
  async getDocument(id) {
    throw new Error("getDocument() must be implemented");
  }

  // 获取文档正文内容
  async getDocContent(id) {
    throw new Error("getDocContent() must be implemented");
  }

  // 保存文档内容
  async saveDocContent(id, content) {
    throw new Error("saveDocContent() must be implemented");
  }

  // 创建新文档
  async createDocument(title = "未命名文档") {
    throw new Error("createDocument() must be implemented");
  }

  // 重命名文档
  async renameDocument(id, newTitle) {
    throw new Error("renameDocument() must be implemented");
  }

  // 删除文档
  async deleteDocument(id) {
    throw new Error("deleteDocument() must be implemented");
  }

  // 获取当前激活的文档 ID
  async getActiveDocId() {
    throw new Error("getActiveDocId() must be implemented");
  }

  // 设置当前激活的文档 ID
  async setActiveDocId(id) {
    throw new Error("setActiveDocId() must be implemented");
  }

  // 从旧版本数据迁移
  async migrateFromLegacy(defaultContent = "") {
    throw new Error("migrateFromLegacy() must be implemented");
  }
}
