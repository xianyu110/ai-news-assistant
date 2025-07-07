<template>
  <view class="detail-container">
    <!-- 加载状态 -->
    <view class="loading-state" v-if="loading">
      <uni-icons type="spinner-cycle" size="30" color="#007aff"></uni-icons>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 新闻详情 -->
    <view class="news-detail" v-if="!loading && newsDetail">
      <!-- 头部信息 -->
      <view class="news-header">
        <view class="category-time">
          <view class="news-category" :class="getCategoryClass(newsDetail.category)">
            {{ newsDetail.category }}
          </view>
          <text class="news-time">{{ formatTime(newsDetail.publishTime) }}</text>
        </view>
        <view class="news-source">
          <text>来源：{{ newsDetail.source }}</text>
        </view>
      </view>

      <!-- 标题 -->
      <view class="news-title">{{ newsDetail.title }}</view>

      <!-- 标签 -->
      <view class="news-tags" v-if="newsDetail.tags && newsDetail.tags.length">
        <view 
          v-for="tag in newsDetail.tags" 
          :key="tag"
          class="tag-item"
        >
          {{ tag }}
        </view>
      </view>

      <!-- 内容 -->
      <view class="news-content">
        <text class="content-text">{{ newsDetail.content }}</text>
      </view>

      <!-- 原文链接 -->
      <view class="source-link" v-if="newsDetail.sourceUrl" @click="openSourceUrl">
        <uni-icons type="link" size="16" color="#007aff"></uni-icons>
        <text class="link-text">查看原文</text>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <button 
          class="action-btn favorite-btn"
          :class="{ favorited: newsDetail.isFavorited }"
          @click="toggleFavorite"
        >
          <uni-icons 
            :type="newsDetail.isFavorited ? 'heart-filled' : 'heart'" 
            size="18" 
            :color="newsDetail.isFavorited ? '#fff' : '#007aff'"
          ></uni-icons>
          <text>{{ newsDetail.isFavorited ? '已收藏' : '收藏' }}</text>
        </button>
        
        <button class="action-btn share-btn" @click="shareNews">
          <uni-icons type="redo" size="18" color="#007aff"></uni-icons>
          <text>分享</text>
        </button>
      </view>

      <!-- 相关推荐 -->
      <view class="related-news" v-if="relatedNews.length > 0">
        <view class="section-title">相关推荐</view>
        <view 
          v-for="(news, index) in relatedNews" 
          :key="news._id"
          class="related-item"
          @click="viewRelatedNews(news)"
        >
          <view class="related-title">{{ news.title }}</view>
          <view class="related-meta">
            <text class="related-category">{{ news.category }}</text>
            <text class="related-time">{{ formatTime(news.publishTime) }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 错误状态 -->
    <view class="error-state" v-if="!loading && !newsDetail">
      <uni-icons type="info" size="60" color="#ddd"></uni-icons>
      <text class="error-text">新闻不存在或已删除</text>
      <button class="back-btn" @click="goBack">返回</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { app, ensureLogin } from '../../utils/cloudbase'

// 响应式数据
const loading = ref(true)
const newsDetail = ref<any>(null)
const relatedNews = ref<any[]>([])
const newsId = ref('')

// 页面加载
onMounted(async () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  newsId.value = currentPage.options?.id || ''
  
  if (newsId.value) {
    await loadNewsDetail()
  } else {
    loading.value = false
  }
})

// 加载新闻详情
const loadNewsDetail = async () => {
  loading.value = true
  
  try {
    await ensureLogin()
    
    const db = app.database()
    const collection = db.collection('ai_news')
    
    // 获取新闻详情
    const result = await collection.doc(newsId.value).get()
    
    if (result.data.length > 0) {
      newsDetail.value = result.data[0]
      
      // 检查收藏状态
      await checkFavoriteStatus()
      
      // 加载相关新闻
      await loadRelatedNews()
    }
  } catch (error) {
    console.error('加载新闻详情失败:', error)
    uni.showToast({ title: '加载失败', icon: 'error' })
  } finally {
    loading.value = false
  }
}

// 检查收藏状态
const checkFavoriteStatus = async () => {
  try {
    const db = app.database()
    const collection = db.collection('user_favorites')
    
    const result = await collection.where({
      newsId: newsId.value
    }).limit(1).get()
    
    newsDetail.value.isFavorited = result.data.length > 0
  } catch (error) {
    console.error('检查收藏状态失败:', error)
  }
}

// 加载相关新闻
const loadRelatedNews = async () => {
  try {
    const db = app.database()
    const collection = db.collection('ai_news')
    
    // 根据标签或分类查找相关新闻
    const query = newsDetail.value.tags && newsDetail.value.tags.length > 0
      ? collection.where({
          tags: db.command.in(newsDetail.value.tags),
          _id: db.command.neq(newsId.value)
        })
      : collection.where({
          category: newsDetail.value.category,
          _id: db.command.neq(newsId.value)
        })
    
    const result = await query
      .orderBy('publishTime', 'desc')
      .limit(5)
      .get()
    
    relatedNews.value = result.data
  } catch (error) {
    console.error('加载相关新闻失败:', error)
  }
}

// 切换收藏状态
const toggleFavorite = async () => {
  try {
    const db = app.database()
    const collection = db.collection('user_favorites')
    
    if (newsDetail.value.isFavorited) {
      // 取消收藏
      await collection.where({
        newsId: newsId.value
      }).remove()
      newsDetail.value.isFavorited = false
      uni.showToast({ title: '已取消收藏', icon: 'success' })
    } else {
      // 添加收藏
      await collection.add({
        newsId: newsId.value,
        title: newsDetail.value.title,
        category: newsDetail.value.category,
        createTime: new Date()
      })
      newsDetail.value.isFavorited = true
      uni.showToast({ title: '已收藏', icon: 'success' })
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
    uni.showToast({ title: '操作失败', icon: 'error' })
  }
}

// 分享新闻
const shareNews = () => {
  uni.showActionSheet({
    itemList: ['复制链接', '复制标题', '分享给朋友'],
    success: (res) => {
      if (res.tapIndex === 0) {
        // 复制链接
        uni.setClipboardData({
          data: newsDetail.value.sourceUrl || '暂无链接',
          success: () => {
            uni.showToast({ title: '已复制链接', icon: 'success' })
          }
        })
      } else if (res.tapIndex === 1) {
        // 复制标题
        uni.setClipboardData({
          data: newsDetail.value.title,
          success: () => {
            uni.showToast({ title: '已复制标题', icon: 'success' })
          }
        })
      } else if (res.tapIndex === 2) {
        // 分享功能
        uni.share({
          title: newsDetail.value.title,
          summary: newsDetail.value.content,
          href: newsDetail.value.sourceUrl
        })
      }
    }
  })
}

// 打开原文链接
const openSourceUrl = () => {
  if (newsDetail.value.sourceUrl) {
    // #ifdef H5
    window.open(newsDetail.value.sourceUrl, '_blank')
    // #endif
    
    // #ifndef H5
    uni.setClipboardData({
      data: newsDetail.value.sourceUrl,
      success: () => {
        uni.showModal({
          title: '提示',
          content: '链接已复制到剪贴板，请在浏览器中打开',
          showCancel: false
        })
      }
    })
    // #endif
  }
}

// 查看相关新闻
const viewRelatedNews = (news: any) => {
  uni.redirectTo({
    url: `/pages/ai-news/news-detail?id=${news._id}`
  })
}

// 返回
const goBack = () => {
  uni.navigateBack()
}

// 格式化时间
const formatTime = (time: any) => {
  if (!time) return ''
  
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
  }
}

// 获取分类样式类名
const getCategoryClass = (category: string) => {
  const classMap: Record<string, string> = {
    '投融资': 'category-finance',
    '开源项目': 'category-opensource',
    '产品发布': 'category-product',
    '行业动态': 'category-industry',
    '技术研究': 'category-tech',
    '综合资讯': 'category-general'
  }
  return classMap[category] || 'category-default'
}
</script>

<style scoped>
.detail-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 40rpx;
}

.loading-text, .error-text {
  font-size: 28rpx;
  color: #999;
  margin-top: 20rpx;
}

.back-btn {
  background-color: #007aff;
  color: #fff;
  border: none;
  border-radius: 30rpx;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
  margin-top: 40rpx;
}

.news-detail {
  background-color: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.news-header {
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.category-time {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.news-category {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  color: #fff;
}

.category-finance { background-color: #ff6b6b; }
.category-opensource { background-color: #4ecdc4; }
.category-product { background-color: #45b7d1; }
.category-industry { background-color: #f9ca24; }
.category-tech { background-color: #6c5ce7; }
.category-general { background-color: #a0a0a0; }
.category-default { background-color: #95a5a6; }

.news-time {
  font-size: 22rpx;
  color: #999;
}

.news-source {
  font-size: 24rpx;
  color: #666;
}

.news-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  line-height: 1.4;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.news-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.tag-item {
  padding: 8rpx 16rpx;
  background-color: #f0f8ff;
  color: #007aff;
  font-size: 24rpx;
  border-radius: 16rpx;
  border: 1rpx solid #007aff;
}

.news-content {
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.content-text {
  font-size: 30rpx;
  color: #333;
  line-height: 1.6;
}

.source-link {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.link-text {
  font-size: 26rpx;
  color: #007aff;
  margin-left: 8rpx;
}

.action-buttons {
  display: flex;
  padding: 30rpx;
  gap: 20rpx;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
  border-radius: 30rpx;
  font-size: 28rpx;
  border: 1rpx solid #007aff;
  background-color: #fff;
  color: #007aff;
}

.action-btn text {
  margin-left: 8rpx;
}

.favorite-btn.favorited {
  background-color: #ff4757;
  border-color: #ff4757;
  color: #fff;
}

.related-news {
  margin: 20rpx;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
  padding-bottom: 16rpx;
  border-bottom: 2rpx solid #007aff;
}

.related-item {
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.related-item:last-child {
  border-bottom: none;
}

.related-title {
  font-size: 28rpx;
  color: #333;
  line-height: 1.4;
  margin-bottom: 12rpx;
}

.related-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.related-category {
  font-size: 22rpx;
  color: #007aff;
  background-color: #f0f8ff;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

.related-time {
  font-size: 22rpx;
  color: #999;
}
</style> 