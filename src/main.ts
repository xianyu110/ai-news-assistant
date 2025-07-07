import { createSSRApp } from "vue";
import App from "./App.vue";
import { initCloudBase } from "./utils/cloudbase";

export function createApp() {
  const app = createSSRApp(App);
  
  // 初始化云开发
  initCloudBase().then((success) => {
    if (success) {
      console.log("云开发初始化完成");
    } else {
      console.warn("云开发初始化失败，部分功能可能无法使用");
    }
  });
  
  return {
    app,
  };
}
