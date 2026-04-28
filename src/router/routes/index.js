/** @format */

// routes/index.js 是业务路由聚合入口。
// 将拆分出去的路由模块统一导出，方便 router/index.js 一次性加载。

import mainRoutes from "./main";

export default mainRoutes;
