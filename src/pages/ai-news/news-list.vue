<template>
  <view class="news-container">
    <!-- 蓝色渐变顶部横幅 -->
    <view class="header-banner">
      <view class="header-content">
        <view class="header-title">
          <text class="main-title">每日AI快讯</text>
          <text class="sub-title">AI资讯 · 实时更新</text>
        </view>
        <view class="header-stats" v-if="stats">
          <text class="today-count">今日 {{ stats.todayCount }}</text>
        </view>
      </view>
      
      <!-- 搜索框 -->
      <view class="header-search">
        <view class="search-box" @click="goToSearch">
          <uni-icons type="search" size="18" color="#666"></uni-icons>
          <text class="search-placeholder">搜索AI快讯、公司、技术...</text>
        </view>
        <view class="refresh-btn" @click="refreshNews">
          <uni-icons type="reload" size="20" :color="loading ? '#ccc' : '#fff'"></uni-icons>
        </view>
      </view>
    </view>

    <!-- 分类标签 -->
    <view class="category-section">
      <scroll-view scroll-x="true" class="category-scroll">
        <view class="category-list">
          <view 
            v-for="(category, index) in categories" 
            :key="index"
            class="category-item"
            :class="{ active: selectedCategory === category }"
            @click="selectCategory(category)"
          >
            {{ category }}
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 按日期分组的新闻列表 -->
    <view class="content-area">
      <view 
        v-for="(group, date) in groupedNews" 
        :key="date"
        class="date-group"
      >
        <!-- 日期标题 -->
        <view class="date-header">
          <view class="date-line"></view>
          <view class="date-info">
            <text class="date-text">{{ formatDateHeader(date) }}</text>
            <text class="weekday-text">{{ getWeekday(date) }}</text>
          </view>
          <view class="date-line"></view>
        </view>

        <!-- 该日期的新闻列表 -->
        <view class="news-list">
          <view 
            v-for="(news, index) in group" 
            :key="news.id"
            class="news-card"
            @click="viewNewsDetail(news)"
          >
            <!-- 新闻卡片头部 -->
            <view class="card-header">
              <view class="news-category" :class="getCategoryClass(news.category)">
                {{ news.category }}
              </view>
              <view class="news-time">{{ formatTimeOnly(news.publishTime) }}</view>
            </view>
            
            <!-- 新闻标题 -->
            <view class="news-title">{{ news.title }}</view>
            
            <!-- 新闻内容摘要 -->
            <view class="news-summary">{{ news.content }}</view>
            
            <!-- 标签 -->
            <view class="news-tags" v-if="news.tags && news.tags.length">
              <view 
                v-for="tag in news.tags.slice(0, 3)" 
                :key="tag"
                class="tag-chip"
              >
                {{ tag }}
              </view>
            </view>
            
            <!-- 底部信息 -->
            <view class="card-footer">
              <view class="source-info">
                <uni-icons type="paperplane" size="14" color="#999"></uni-icons>
                <text class="source-text">{{ news.source }}</text>
              </view>
              <view class="card-actions">
                <view class="action-btn" @click.stop="toggleFavorite(news)">
                  <uni-icons 
                    :type="news.isFavorited ? 'heart-filled' : 'heart'" 
                    size="16" 
                    :color="news.isFavorited ? '#ff4757' : '#ccc'"
                  ></uni-icons>
                </view>
                <view class="action-btn" @click.stop="shareNews(news)">
                  <uni-icons type="redo" size="16" color="#ccc"></uni-icons>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 加载更多 -->
      <view class="load-more-section" v-if="hasMore">
        <view class="load-indicator">
          <text class="load-text">{{ loadingMore ? '加载中...' : '上拉加载更多' }}</text>
        </view>
      </view>
      
      <!-- 没有更多数据 -->
      <view class="end-section" v-if="!hasMore && newsList.length > 0">
        <view class="end-indicator">
          <view class="end-line"></view>
          <text class="end-text">没有更多内容了</text>
          <view class="end-line"></view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="!loading && filteredNews.length === 0">
      <uni-icons type="info-circle" size="60" color="#ddd"></uni-icons>
      <text class="empty-text">暂无AI快讯</text>
      <button class="retry-btn" @click="loadNews">刷新试试</button>
    </view>

    <!-- 全局加载状态 -->
    <view class="loading-overlay" v-if="loading">
      <view class="loading-content">
        <uni-icons type="spinner-cycle" size="30" color="#007aff"></uni-icons>
        <text class="loading-text">加载中...</text>
      </view>
    </view>

    <!-- 浮动按钮：爬取最新数据 -->
    <view class="fab" @click="crawlLatestNews">
      <uni-icons type="download" size="24" color="#fff"></uni-icons>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { NewsService, LocalStorage, NewsItem } from '../../utils/cloudbase'

// 声明 wx 对象类型（小程序环境）
declare const wx: any

// 响应式数据
const loading = ref(false)
const loadingMore = ref(false)
const newsList = ref<any[]>([])
const selectedCategory = ref('全部')
const currentPage = ref(1)
const pageSize = ref(20)
const hasMore = ref(true)
const stats = ref<any>(null)

// 分类列表
const categories = ref([
  '全部', '投融资', '开源项目', '产品发布', '行业动态', '技术研究', '综合资讯'
])

// 计算属性：过滤后的新闻
const filteredNews = computed(() => {
  if (selectedCategory.value === '全部') {
    return newsList.value
  }
  return newsList.value.filter(news => news.category === selectedCategory.value)
})

// 计算属性：按日期分组的新闻
const groupedNews = computed(() => {
  const groups: Record<string, any[]> = {}
  
  filteredNews.value.forEach(news => {
    const date = new Date(news.publishTime).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(news)
  })
  
  // 按日期倒序排列
  const sortedGroups: Record<string, any[]> = {}
  Object.keys(groups)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .forEach(date => {
      sortedGroups[date] = groups[date].sort((a, b) => 
        new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime()
      )
    })
  
  return sortedGroups
})

// 页面加载
onMounted(async () => {
  await initPage()
})

// 下拉刷新
onPullDownRefresh(async () => {
  await refreshNews()
  uni.stopPullDownRefresh()
})

// 上拉加载更多
onReachBottom(async () => {
  if (!loadingMore.value && hasMore.value) {
    await loadMoreNews()
  }
})

// 初始化页面
const initPage = async () => {
  try {
    await Promise.all([
      loadNews(),
      loadStats()
    ])
  } catch (error) {
    console.error('初始化失败:', error)
    uni.showToast({ title: '初始化失败', icon: 'error' })
  }
}

// 加载新闻列表
const loadNews = async (page = 1) => {
  if (page === 1) {
    loading.value = true
    newsList.value = []
    currentPage.value = 1
    hasMore.value = true
  } else {
    loadingMore.value = true
  }

  try {
    console.log('📰 开始加载AI快讯数据...')
    
    // 使用新的数据服务
    const result = await NewsService.getNews()
    
    if (result.success) {
      const allData = result.data || []
      
      // 分页处理
      const startIndex = (page - 1) * pageSize.value
      const endIndex = startIndex + pageSize.value
      const pageData = allData.slice(startIndex, endIndex)
      
      if (page === 1) {
        newsList.value = pageData
      } else {
        newsList.value.push(...pageData)
      }
      
      hasMore.value = endIndex < allData.length
      currentPage.value = page
      
      // 加载用户收藏状态
      await loadFavoriteStatus()
      
      console.log(`✅ 成功加载 ${pageData.length} 条新闻，总共 ${allData.length} 条`)
    } else {
      throw new Error(result.error || '加载失败')
    }
  } catch (error) {
    console.error('❌ 加载新闻失败:', error)
    uni.showToast({ 
      title: '加载失败，请稍后重试', 
      icon: 'error' 
    })
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// 加载更多新闻
const loadMoreNews = async () => {
  await loadNews(currentPage.value + 1)
}

// 刷新新闻
const refreshNews = async () => {
  await loadNews(1)
}

// 加载统计信息
const loadStats = async () => {
  try {
    const result = await NewsService.getNews()
    
    if (result.success) {
      stats.value = result.stats
      console.log('📊 统计信息加载成功:', result.stats)
    }
  } catch (error) {
    console.error('❌ 加载统计失败:', error)
  }
}

// 爬取最新数据
const crawlLatestNews = async () => {
  uni.showLoading({ title: '更新数据中...' })
  
  try {
    // 清除本地缓存，强制重新获取最新数据
    uni.removeStorageSync('newsData')
    
    const result = await NewsService.getNews()
    
    uni.hideLoading()
    
    if (result.success) {
      uni.showToast({ 
        title: `数据已更新，共 ${result.count} 条`, 
        icon: 'success' 
      })
      await refreshNews()
      await loadStats()
    } else {
      throw new Error(result.error || '更新失败')
    }
  } catch (error) {
    uni.hideLoading()
    console.error('❌ 更新数据失败:', error)
    uni.showToast({ title: '更新失败，请稍后重试', icon: 'error' })
  }
}

// 选择分类
const selectCategory = (category: string) => {
  selectedCategory.value = category
}

// 查看新闻详情
const viewNewsDetail = (news: any) => {
  uni.navigateTo({
    url: `/pages/ai-news/news-detail?id=${news.id}`
  })
}

// 跳转搜索页面
const goToSearch = () => {
  uni.navigateTo({
    url: '/pages/ai-news/search'
  })
}

// 切换收藏状态
const toggleFavorite = async (news: any) => {
  try {
    if (news.isFavorited) {
      // 取消收藏
      LocalStorage.removeFavorite(news.id)
      news.isFavorited = false
      uni.showToast({ title: '已取消收藏', icon: 'success' })
    } else {
      // 添加收藏
      LocalStorage.saveFavorite(news)
      news.isFavorited = true
      uni.showToast({ title: '已收藏', icon: 'success' })
    }
  } catch (error) {
    console.error('❌ 收藏操作失败:', error)
    uni.showToast({ title: '操作失败', icon: 'error' })
  }
}

// 分享新闻
const shareNews = (news: any) => {
  uni.showActionSheet({
    itemList: ['复制链接', '分享给朋友'],
    success: (res) => {
      if (res.tapIndex === 0) {
        // 复制链接
        uni.setClipboardData({
          data: news.sourceUrl || '暂无链接',
          success: () => {
            uni.showToast({ title: '已复制链接', icon: 'success' })
          }
        })
      } else if (res.tapIndex === 1) {
        // 分享功能
        uni.share({
          title: news.title,
          summary: news.content,
          href: news.sourceUrl
        })
      }
    }
  })
}

// 加载收藏状态
const loadFavoriteStatus = async () => {
  try {
    newsList.value.forEach(news => {
      news.isFavorited = LocalStorage.isFavorited(news.id)
    })
    console.log('✅ 收藏状态加载成功')
  } catch (error) {
    console.error('❌ 加载收藏状态失败:', error)
  }
}

// 格式化日期标题 (月日格式)
const formatDateHeader = (dateString: string) => {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  
  if (date.toDateString() === today.toDateString()) {
    return '今天'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '昨天'
  } else {
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }
}

// 获取星期几
const getWeekday = (dateString: string) => {
  const date = new Date(dateString)
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weekdays[date.getDay()]
}

// 格式化时间 (仅显示时分)
const formatTimeOnly = (time: any) => {
  if (!time) return ''
  
  const date = new Date(time)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  
  return `${hours}:${minutes}`
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
.news-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
}

/* 蓝色渐变顶部横幅 */
.header-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 30rpx 40rpx;
  position: relative;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30rpx;
}

.header-title {
  display: flex;
  flex-direction: column;
}

.main-title {
  font-size: 44rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 8rpx;
}

.sub-title {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.header-stats {
  background: rgba(255, 255, 255, 0.2);
  padding: 12rpx 20rpx;
  border-radius: 25rpx;
  backdrop-filter: blur(10rpx);
}

.today-count {
  font-size: 24rpx;
  color: #fff;
  font-weight: 500;
}

/* 搜索框 */
.header-search {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10rpx);
  border-radius: 50rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.search-placeholder {
  margin-left: 16rpx;
  color: #666;
  font-size: 28rpx;
  flex: 1;
}

.refresh-btn {
  width: 80rpx;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10rpx);
}

/* 分类标签 */
.category-section {
  background: #fff;
  padding: 20rpx 0;
  border-top-left-radius: 30rpx;
  border-top-right-radius: 30rpx;
  margin-top: -20rpx;
  position: relative;
  z-index: 2;
}

.category-scroll {
  white-space: nowrap;
}

.category-list {
  display: flex;
  padding: 0 30rpx;
  gap: 20rpx;
}

.category-item {
  padding: 16rpx 28rpx;
  background: #f8f9fa;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: #666;
  white-space: nowrap;
  transition: all 0.3s ease;
  border: 2rpx solid transparent;
}

.category-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  transform: scale(1.05);
  box-shadow: 0 4rpx 15rpx rgba(102, 126, 234, 0.3);
}

/* 内容区域 */
.content-area {
  background: #f8f9fa;
  min-height: calc(100vh - 300rpx);
  padding: 0 30rpx 30rpx;
}

/* 日期分组 */
.date-group {
  margin-bottom: 40rpx;
}

.date-header {
  display: flex;
  align-items: center;
  margin: 30rpx 0 20rpx;
}

.date-line {
  flex: 1;
  height: 1rpx;
  background: linear-gradient(90deg, transparent, #ddd, transparent);
}

.date-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 30rpx;
}

.date-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.weekday-text {
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
}

/* 新闻卡片 */
.news-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.news-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 20rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.news-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background: linear-gradient(90deg, #667eea, #764ba2);
}

.news-card:active {
  transform: translateY(2rpx);
  box-shadow: 0 1rpx 10rpx rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.news-category {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  color: #fff;
  font-weight: 500;
}

.category-finance { background: linear-gradient(135deg, #ff6b6b, #ee5a24); }
.category-opensource { background: linear-gradient(135deg, #4ecdc4, #44a08d); }
.category-product { background: linear-gradient(135deg, #45b7d1, #3742fa); }
.category-industry { background: linear-gradient(135deg, #f9ca24, #f0932b); }
.category-tech { background: linear-gradient(135deg, #6c5ce7, #a29bfe); }
.category-general { background: linear-gradient(135deg, #a0a0a0, #747d8c); }
.category-default { background: linear-gradient(135deg, #95a5a6, #7f8c8d); }

.news-time {
  font-size: 22rpx;
  color: #999;
  background: #f8f9fa;
  padding: 6rpx 12rpx;
  border-radius: 12rpx;
}

.news-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #222;
  line-height: 1.5;
  margin-bottom: 16rpx;
  word-break: break-word;
}

.news-summary {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 20rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.news-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.tag-chip {
  padding: 6rpx 12rpx;
  background: linear-gradient(135deg, #f0f8ff, #e6f3ff);
  color: #2196f3;
  font-size: 22rpx;
  border-radius: 12rpx;
  border: 1rpx solid #e3f2fd;
  font-weight: 500;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16rpx;
  border-top: 1rpx solid #f5f5f5;
}

.source-info {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.source-text {
  font-size: 24rpx;
  color: #999;
}

.card-actions {
  display: flex;
  gap: 24rpx;
}

.action-btn {
  padding: 12rpx;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.action-btn:active {
  background: #f5f5f5;
  transform: scale(0.95);
}

/* 加载更多 */
.load-more-section {
  padding: 40rpx 0;
  text-align: center;
}

.load-indicator {
  display: inline-block;
  padding: 16rpx 32rpx;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 30rpx;
  backdrop-filter: blur(10rpx);
}

.load-text {
  font-size: 26rpx;
  color: #666;
}

/* 结束提示 */
.end-section {
  padding: 40rpx 0;
  text-align: center;
}

.end-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
}

.end-line {
  width: 60rpx;
  height: 1rpx;
  background: #ddd;
}

.end-text {
  font-size: 24rpx;
  color: #999;
  padding: 0 20rpx;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
  background: #fff;
  margin: 30rpx;
  border-radius: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  margin: 30rpx 0;
}

.retry-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  border: none;
  border-radius: 30rpx;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
}

/* 全局加载状态 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5rpx);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
  padding: 40rpx;
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.1);
}

.loading-text {
  font-size: 28rpx;
  color: #007aff;
}

/* 浮动按钮 */
.fab {
  position: fixed;
  right: 30rpx;
  bottom: 100rpx;
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 30rpx rgba(102, 126, 234, 0.4);
  z-index: 100;
  transition: all 0.3s ease;
}

.fab:active {
  transform: scale(0.95);
}
</style> 