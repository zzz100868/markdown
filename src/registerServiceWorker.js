/** @format */

// registerServiceWorker.js 负责注册 PWA Service Worker。
// 它让生产环境下的静态资源可以被浏览器缓存，提高二次打开速度。

import { register } from "register-service-worker";

if (import.meta.env.PROD) {
  register(`${import.meta.env.BASE_URL}service-worker.js`, {
    ready() {
      console.log(
        "App is being served from cache by a service worker.\n" +
          "For more details, visit https://goo.gl/AFskqB",
      );
    },
    cached() {
      console.log("Content has been cached for offline use.");
    },
    updated() {
      console.log("New content is available; please refresh.");
    },
    offline() {
      console.log(
        "No internet connection found. App is running in offline mode.",
      );
    },
    error(error) {
      console.error("Error during service worker registration:", error);
    },
  });
}
