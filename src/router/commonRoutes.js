/** @format */

// commonRoutes.js 定义全站通用路由。
// 包含首页、关于页、首页别名以及兜底 404 页面。

import Frame from "@pages/partials/Frame.vue";
import NotFound from "@pages/partials/NotFound.vue";

export default [
  {
    path: "/",
    component: () => import("@pages/Main.vue"),
  },
  {
    path: "/about-arya",
    component: Frame,
    children: [
      {
        path: "",
        component: () => import("@pages/About.vue"),
      },
    ],
  },
  {
    path: "/index",
    redirect: "/",
  },
  {
    path: "/:pathMatch(.*)*",
    component: NotFound,
  },
];
