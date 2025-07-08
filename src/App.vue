<template>
  <view id="app">
    <router-view />
  </view>
</template>

<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";

onLaunch(() => {
  console.log("🚀 AI快讯助手 - 应用启动");
  console.log("📊 纯前端版本，数据来源：AI工具集");
  console.log("🔗 GitHub: https://github.com/xianyu110/ai-news-assistant");
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
