/**
 * eventBus.js 创建一个轻量事件总线。
 * 用来让没有父子关系的组件互相通知，例如导入文件后通知编辑器刷新。
 */

import mitt from "mitt";

const emitter = mitt();

export default emitter;
