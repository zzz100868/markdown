/** @format */

// routes/main.js 定义核心业务路由。
// 目前主要是各种导出/预览页面，它们共享 Frame 外层布局。

import Frame from "@pages/partials/Frame.vue";

export default [
  {
    path: "/export",
    component: Frame,
    children: [
      {
        path: "png",
        component: () => import("@pages/ExportImage.vue"),
      },
      {
        path: "pdf",
        component: () => import("@pages/ExportPdf.vue"),
      },
      {
        path: "docx",
        component: () => import("@pages/ExportDocx.vue"),
      },
      {
        path: "ppt",
        component: () => import("@pages/ExportPPT.vue"),
      },
      {
        path: "html",
        component: () => import("@pages/ExportHtml.vue"),
      },
    ],
  },
];
