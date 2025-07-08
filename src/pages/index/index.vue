<template>
  <view class="container">
    <view class="header">
      <text class="title">AI快讯助手</text>
      <text class="subtitle">每日AI资讯，实时更新 · 无服务器架构</text>
    </view>

    <view class="features">
      <view class="feature-card">
        <text class="feature-icon">🤖</text>
        <text class="feature-title">AI快讯聚合</text>
        <text class="feature-desc">每日更新AI领域最新资讯</text>
      </view>

      <view class="feature-card">
        <text class="feature-icon">📱</text>
        <text class="feature-title">多端同步</text>
        <text class="feature-desc">H5、小程序一码多端</text>
      </view>

      <view class="feature-card">
        <text class="feature-icon">🔧</text>
        <text class="feature-title">纯前端架构</text>
        <text class="feature-desc">无服务器，GitHub自动更新</text>
      </view>
    </view>

    <view class="actions">
      <button class="btn btn-primary" @click="goToDemo">
        体验云开发功能
      </button>
      <button class="btn btn-secondary" @click="goToNews">
        AI快讯助手
      </button>
      <button class="btn btn-debug" @click="goToDebug">
        🔧 调试工具
      </button>
    </view>

    <view class="footer">
      <image class="logo" src="https://7463-tcb-advanced-a656fc-1257967285.tcb.qcloud.la/mcp/powered-by-cloudbase-badge.svg" mode="widthFix" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 跳转到演示页面
const goToDemo = () => {
  uni.navigateTo({
    url: '/pages/demo/demo'
  })
}

// 跳转到AI快讯
const goToNews = () => {
  uni.navigateTo({
    url: '/pages/ai-news/news-list'
  })
}

// 跳转到调试页面
const goToDebug = () => {
  uni.navigateTo({
    url: '/pages/debug/debug'
  })
}
</script>

<style scoped>
.container {
  padding: 40rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  text-align: center;
  margin-bottom: 60rpx;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  color: white;
  display: block;
  margin-bottom: 10rpx;
}

.subtitle {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  display: block;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-bottom: 60rpx;
}

.feature-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10rpx);
  border-radius: 20rpx;
  padding: 30rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.2);
}

.feature-icon {
  font-size: 48rpx;
  display: block;
  margin-bottom: 15rpx;
}

.feature-title {
  font-size: 32rpx;
  font-weight: bold;
  color: white;
  display: block;
  margin-bottom: 10rpx;
}

.feature-desc {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-bottom: 40rpx;
}

.btn {
  width: 100%;
  padding: 20rpx 30rpx;
  border-radius: 40rpx;
  border: none;
  font-size: 28rpx;
  font-weight: bold;
  text-align: center;
}

.btn-primary {
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  color: white;
  box-shadow: 0 8rpx 20rpx rgba(255, 107, 107, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2rpx solid rgba(255, 255, 255, 0.3);
}

.btn-debug {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8rpx 20rpx rgba(102, 126, 234, 0.3);
}

.footer {
  margin-top: 60rpx;
  text-align: center;
}

.footer .logo {
  width: 300rpx;
  opacity: 0.8;
}
</style>
