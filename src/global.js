/** @format */

// global.js 负责集中安装全局能力。
// 这里把 Element Plus、全局消息方法、事件总线和 icon 组件一次性挂到 app 上。

import { appTitle } from "./config/constant";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import { ElMessage, ElMessageBox, ElLoading } from "element-plus";
import Icon from "@components/Icon";
import eventBus from "@helper/eventBus";

window.$appTitle = appTitle;

export default function installGlobal(app) {
  app.use(ElementPlus);

  // 全局方法
  app.config.globalProperties.$message = ElMessage;
  app.config.globalProperties.$confirm = ElMessageBox.confirm;
  app.config.globalProperties.$alert = ElMessageBox.alert;
  app.config.globalProperties.$prompt = ElMessageBox.prompt;
  app.config.globalProperties.$loading = ElLoading.service;
  app.config.globalProperties.$eventBus = eventBus;

  // 全局组件
  app.component("icon", Icon);
}
