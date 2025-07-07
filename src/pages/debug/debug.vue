<template>
  <view class="debug-container">
    <view class="debug-card">
      <text class="debug-title">云开发连接调试</text>
      
      <view class="debug-section">
        <text class="section-title">环境信息</text>
        <text class="debug-info">环境ID: {{ envId }}</text>
        <text class="debug-info">SDK状态: {{ sdkStatus }}</text>
        <text class="debug-info">登录状态: {{ loginStatus }}</text>
      </view>
      
      <view class="debug-section">
        <text class="section-title">测试操作</text>
        <button class="debug-btn" @click="testInit">测试初始化</button>
        <button class="debug-btn" @click="testLogin">测试登录</button>
        <button class="debug-btn" @click="testWxCloud">测试wx.cloud</button>
        <button class="debug-btn" @click="testFunction">测试云函数</button>
        <button class="debug-btn" @click="clearCache">清理缓存</button>
      </view>
      
      <view class="debug-section">
        <text class="section-title">日志信息</text>
        <view class="log-container">
          <text 
            v-for="(log, index) in logs" 
            :key="index" 
            class="log-item"
            :class="log.type"
          >
            {{ log.message }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { app, ensureLogin, checkEnvironment } from '../../utils/cloudbase'

const envId = ref('codedemo-0gwailqxfd0e68b3')
const sdkStatus = ref('未知')
const loginStatus = ref('未知')
const logs = ref<Array<{message: string, type: string}>>([])

const addLog = (message: string, type: string = 'info') => {
  logs.value.push({
    message: `[${new Date().toLocaleTimeString()}] ${message}`,
    type
  })
  console.log(message)
}

onMounted(() => {
  addLog('页面加载完成')
  testInit()
})

const testInit = async () => {
  try {
    addLog('开始测试云开发初始化...')
    
    // 检查环境配置
    const envValid = checkEnvironment()
    addLog(`环境配置检查: ${envValid ? '通过' : '失败'}`, envValid ? 'success' : 'error')
    
    if (app && app.auth) {
      sdkStatus.value = '已初始化'
      addLog('云开发SDK初始化成功', 'success')
    } else {
      sdkStatus.value = '初始化失败'
      addLog('云开发SDK初始化失败', 'error')
    }
  } catch (error) {
    addLog(`初始化失败: ${error}`, 'error')
    sdkStatus.value = '失败'
  }
}

const testLogin = async () => {
  try {
    addLog('开始测试登录...')
    const result = await ensureLogin()
    
    if (result && result.user) {
      loginStatus.value = '已登录'
      addLog(`登录成功: ${result.user.uid}`, 'success')
    } else {
      loginStatus.value = '登录失败'
      addLog('登录失败', 'error')
    }
  } catch (error) {
    addLog(`登录失败: ${error}`, 'error')
    loginStatus.value = '失败'
  }
}

const testWxCloud = async () => {
  try {
    addLog('开始测试 wx.cloud 状态...')
    
    // #ifdef MP-WEIXIN
    if (typeof wx !== 'undefined') {
      addLog('wx 对象存在', 'success')
      
      if (wx.cloud) {
        addLog('wx.cloud 对象存在', 'success')
        
        try {
          // 重新初始化 wx.cloud
          wx.cloud.init({
            env: 'codedemo-0gwailqxfd0e68b3',
            traceUser: true
          })
          addLog('wx.cloud 重新初始化完成', 'success')
          
          // 测试云函数列表
          const result = await wx.cloud.callFunction({
            name: 'ai-news-crawler',
            data: { action: 'stats' }
          })
          addLog(`wx.cloud 测试调用成功: ${JSON.stringify(result)}`, 'success')
          
        } catch (initError) {
          addLog(`wx.cloud 初始化/调用失败: ${initError}`, 'error')
        }
      } else {
        addLog('wx.cloud 对象不存在', 'error')
      }
    } else {
      addLog('wx 对象不存在（可能不在小程序环境）', 'error')
    }
    // #endif
    
    // #ifndef MP-WEIXIN
    addLog('当前不在小程序环境', 'info')
    // #endif
    
  } catch (error) {
    addLog(`wx.cloud 测试失败: ${error}`, 'error')
  }
}

const testFunction = async () => {
  try {
    addLog('开始测试云函数调用...')
    
    // 优先使用小程序的 wx.cloud 方式
    // #ifdef MP-WEIXIN
    if (typeof wx !== 'undefined' && wx.cloud) {
      try {
        addLog('使用 wx.cloud 调用云函数...')
        const result = await wx.cloud.callFunction({
          name: 'ai-news-crawler',
          data: {
            action: 'query',
            limit: 1
          }
        })
        
        if (result && result.result) {
          addLog(`wx.cloud 调用成功: ${JSON.stringify(result.result).substring(0, 100)}...`, 'success')
          return
        } else {
          addLog('wx.cloud 调用失败: 无返回结果', 'error')
        }
      } catch (wxError) {
        addLog(`wx.cloud 调用失败: ${wxError}`, 'error')
      }
    } else {
      addLog('wx.cloud 不可用', 'error')
    }
    // #endif
    
    // 备用方案：使用 CloudBase SDK
    addLog('尝试使用 CloudBase SDK...')
    const result = await app.callFunction({
      name: 'ai-news-crawler',
      data: {
        action: 'query',
        limit: 1
      }
    })
    
    if (result && result.result) {
      addLog(`CloudBase SDK 调用成功: ${JSON.stringify(result.result).substring(0, 100)}...`, 'success')
    } else {
      addLog('CloudBase SDK 调用失败: 无返回结果', 'error')
    }
  } catch (error) {
    addLog(`云函数调用失败: ${error}`, 'error')
  }
}

const clearCache = () => {
  try {
    // 清理本地存储
    uni.clearStorageSync()
    
    // 清理会话存储
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear()
    }
    
    // 清理本地存储
    if (typeof localStorage !== 'undefined') {
      localStorage.clear()
    }
    
    addLog('缓存清理完成，请刷新页面', 'success')
  } catch (error) {
    addLog(`清理缓存失败: ${error}`, 'error')
  }
}
</script>

<style>
.debug-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.debug-card {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.debug-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 30rpx;
}

.debug-section {
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #666;
  display: block;
  margin-bottom: 20rpx;
}

.debug-info {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-bottom: 10rpx;
}

.debug-btn {
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 12rpx;
  padding: 20rpx 30rpx;
  margin: 10rpx 20rpx 10rpx 0;
  font-size: 24rpx;
}

.debug-btn:active {
  background-color: #0056cc;
}

.log-container {
  max-height: 400rpx;
  overflow-y: auto;
  border: 2rpx solid #eee;
  border-radius: 8rpx;
  padding: 20rpx;
  background-color: #fafafa;
}

.log-item {
  font-size: 22rpx;
  display: block;
  margin-bottom: 8rpx;
  line-height: 1.4;
}

.log-item.info {
  color: #666;
}

.log-item.success {
  color: #52c41a;
}

.log-item.error {
  color: #ff4d4f;
}
</style> 