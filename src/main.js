/** @format */

// main.js 是整个 Vue 应用的启动入口。
// 这里会按顺序完成：引入依赖 -> 创建应用 -> 安装全局能力 -> 挂载到页面。

import { createApp } from "vue"; // Vue 3 的核心方法：用根组件创建一个应用实例
import { createPinia } from "pinia"; // Pinia 状态管理库：集中保存多个页面/组件都要用的数据
import "virtual:svg-icons-register"; // vite-plugin-svg-icons 生成的虚拟模块：把 src/assets/icons 里的 SVG 注册成 symbol
import "./assets/styles/tailwind.css"; // Tailwind 的全局入口样式：让页面可以直接使用原子化 class
import installGlobal from "./global.js"; // 自定义全局安装函数：统一注册 Element Plus、全局方法和全局组件
import App from "./App.vue"; // 根组件：所有路由页面最终都会渲染到它里面的 router-view
import router from "./router"; // 路由实例：决定不同 URL 应该展示哪个 Vue 页面

const app = createApp(App); // 创建 Vue 应用实例，App.vue 是整个应用的外壳
const pinia = createPinia(); // 创建 Pinia 仓库实例，后面所有 store 都挂在它下面

installGlobal(app); // 安装全局能力，比如 this.$message、this.$eventBus 和 <icon>

app.use(pinia); // 让所有组件都能使用 Pinia store
app.use(router); // 让所有组件都能使用路由能力，比如 <router-view>、this.$router

app.mount("#app"); // 把 Vue 应用挂载到 index.html 中 id="app" 的 DOM 节点上
