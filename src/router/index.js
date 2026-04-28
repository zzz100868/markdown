/** @format */

// router/index.js 是路由系统入口。
// 这里创建 Vue Router 实例，并把业务路由、公共路由组装到一起。

import { createRouter, createWebHistory } from "vue-router";
import RoutesMapConfig from "./routes";
import commonRoutesMap from "./commonRoutes";

const routerInstance = createRouter({
  history: createWebHistory("/"),
  linkActiveClass: "active",
  scrollBehavior: () => ({ top: 0 }),
  routes: RoutesMapConfig.concat(commonRoutesMap),
});

export default routerInstance;
