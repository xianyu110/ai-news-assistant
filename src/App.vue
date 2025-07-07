<template>
  <view id="app">
    <router-view />
  </view>
</template>

<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { initCloudBase, checkEnvironment } from "./utils/cloudbase";

onLaunch(() => {
  console.log("App Launch");

  // 异步初始化云开发，避免阻塞应用启动
  setTimeout(async () => {
    // 检查云开发环境配置
    if (checkEnvironment()) {
      try {
        // 初始化云开发
        const success = await initCloudBase();
        if (success) {
          console.log("云开发初始化成功");
        } else {
          console.warn("云开发初始化失败");
        }
      } catch (error) {
        console.error("云开发初始化异常:", error);
      }
    } else {
      console.warn("云开发环境ID未配置，请在 src/utils/cloudbase.ts 中配置");
    }

    // 小程序云开发初始化
    // #ifdef MP-WEIXIN
    if (typeof wx !== 'undefined' && wx.cloud) {
      try {
        wx.cloud.init({
          env: 'test-9gfe9noc86c78276', // 环境ID
          traceUser: true
        })
        console.log('小程序云开发初始化完成')
        
        // 在游客模式下，延迟一点再调用，确保初始化完成
        setTimeout(() => {
          console.log('云开发环境ready')
        }, 1000)
      } catch (error) {
        console.error('小程序云开发初始化失败:', error)
      }
    } else {
      console.warn('wx.cloud 不可用，可能不在小程序环境中')
    }
    // #endif
  }).catch(error => {
    console.error('应用初始化失败:', error)
  })
});

onShow(() => {
  console.log("App Show");
});

onHide(() => {
  console.log("App Hide");
});
</script>

<style>
/* 全局样式 */
page {
  background-color: #f5f5f5;
}

/* 通用按钮样式 */
.btn {
  border-radius: 12rpx;
  font-size: 28rpx;
  padding: 20rpx 40rpx;
  border: none;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #007aff;
  color: white;
}

.btn-primary:active {
  background-color: #0056cc;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
}

.btn-secondary:active {
  background-color: #e0e0e0;
}

.btn:disabled {
  opacity: 0.5;
}

/* 通用卡片样式 */
.card {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

/* 通用输入框样式 */
.input {
  padding: 20rpx;
  border: 2rpx solid #ddd;
  border-radius: 12rpx;
  font-size: 28rpx;
  background-color: white;
}

.input:focus {
  border-color: #007aff;
}
</style>
