<template>
  <view class="news-container">
    <!-- 横幅标题 -->
    <view class="header-banner">
      <view class="banner-bg">
        <view class="banner-content">
          <view class="banner-icon">
            <view class="news-icon">📰</view>
          </view>
          <view class="banner-text">
            <view class="banner-title">每日AI快讯</view>
            <view class="banner-subtitle">AI行业资讯 | 热点 | 融资 | 产品动态</view>
          </view>
        </view>
      </view>
      
      <!-- 描述文字 -->
      <view class="description">
        AI工具集每日实时更新 AI 行业的最新资讯、新闻、热点、融资、产品动态、爆料等，让你随时了解人工智能领域最新趋势、更新突破和热门大事件。
        <text class="highlight" @click="joinGroup">加入AI工具集官方社群</text>
        ，获取最新一手信息！
      </view>
    </view>

    <!-- 搜索框 -->
    <view class="search-section">
      <view class="search-box" @click="goToSearch">
        <uni-icons type="search" size="16" color="#999"></uni-icons>
        <text class="search-placeholder">输入关键词搜索定位(精确匹配)</text>
      </view>
    </view>

    <!-- 统计信息 -->
    <view class="stats-section" v-if="stats.totalCount > 0">
      <view class="stats-item">
        <text class="stats-number">{{ stats.totalCount }}</text>
        <text class="stats-label">总快讯</text>
      </view>
      <view class="stats-item">
        <text class="stats-number">{{ stats.todayCount }}</text>
        <text class="stats-label">今日新增</text>
      </view>
      <view class="stats-item">
        <text class="stats-number">{{ Math.ceil((Date.now() - updateTime) / 1000 / 60) }}</text>
        <text class="stats-label">分钟前更新</text>
      </view>
    </view>

    <!-- 加载状态 -->
    <view class="loading-state" v-if="loading && newsList.length === 0">
      <uni-icons type="spinner-cycle" size="30" color="#4285F4"></uni-icons>
      <text class="loading-text">正在加载最新快讯...</text>
    </view>

    <!-- 新闻列表 -->
    <view class="news-list" v-if="!loading || newsList.length > 0">
      <view 
        v-for="(dateGroup, dateKey) in groupedNews" 
        :key="dateKey"
        class="date-group"
      >
        <!-- 日期标题 -->
        <view class="date-header">
          <view class="date-indicator"></view>
          <text class="date-text">{{ formatDateGroup(dateKey) }}</text>
        </view>
        
        <!-- 该日期的新闻列表 -->
        <view class="date-news-list">
          <view 
            v-for="(news, index) in dateGroup" 
            :key="news.id"
            class="news-item"
            @click="viewNewsDetail(news)"
          >
            <view class="news-content">
              <view class="news-title">{{ news.title }}</view>
              <view class="news-meta">
                <text class="news-source">来源：{{ news.source }}</text>
                <text class="news-time">{{ formatTime(news.publishTime) }}</text>
              </view>
              <view class="news-tags" v-if="news.tags && news.tags.length > 0">
                <text 
                  v-for="tag in news.tags.slice(0, 3)" 
                  :key="tag"
                  class="news-tag"
                >
                  {{ tag }}
                </text>
              </view>
            </view>
            
            <!-- 收藏按钮 -->
            <view class="news-actions">
              <view 
                class="favorite-btn"
                :class="{ favorited: news.isFavorited }"
                @click.stop="toggleFavorite(news)"
              >
                <uni-icons 
                  :type="news.isFavorited ? 'heart-filled' : 'heart'" 
                  :color="news.isFavorited ? '#FF6B6B' : '#CCC'" 
                  size="16"
                ></uni-icons>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 加载更多 -->
    <view class="load-more" v-if="loadingMore">
      <uni-icons type="spinner-cycle" size="20" color="#4285F4"></uni-icons>
      <text class="load-more-text">正在加载更多...</text>
    </view>

    <!-- 没有更多数据 -->
    <view class="no-more" v-if="!hasMore && newsList.length > 0">
      <text class="no-more-text">— 已加载全部快讯 —</text>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="!loading && newsList.length === 0">
      <uni-icons type="info" size="60" color="#DDD"></uni-icons>
      <text class="empty-text">暂无快讯数据</text>
      <button class="refresh-btn" @click="refreshNews">刷新试试</button>
    </view>

    <!-- 浮动刷新按钮 -->
    <view class="floating-refresh" @click="refreshNews" v-if="!loading">
      <uni-icons type="refresh" size="20" color="#4285F4"></uni-icons>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { NewsService, LocalStorage } from '../../utils/cloudbase'

// 声明 wx 对象类型（小程序环境）
declare const wx: any

// 响应式数据
const loading = ref(false)
const loadingMore = ref(false)
const newsList = ref<any[]>([])
const stats = ref({
  totalCount: 0,
  todayCount: 0,
  categories: [] as string[],
  sources: [] as string[]
})
const updateTime = ref(Date.now())
const currentPage = ref(1)
const pageSize = ref(20)
const hasMore = ref(true)

// 按日期分组的新闻
const groupedNews = computed(() => {
  const groups: Record<string, any[]> = {}
  
  newsList.value.forEach(news => {
    const date = new Date(news.publishTime)
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(news)
  })
  
  // 按日期降序排序
  const sortedKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a))
  const sortedGroups: Record<string, any[]> = {}
  
  sortedKeys.forEach(key => {
    sortedGroups[key] = groups[key].sort((a, b) => 
      new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime()
    )
  })
  
  return sortedGroups
})

// 页面初始化
onMounted(async () => {
  await initPage()
})

// H5版本不支持下拉刷新和上拉加载
// 使用手动刷新按钮和加载更多按钮代替

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
    console.log('📰 开始加载新闻数据...')
    
    const result = await NewsService.getNews()
    
    if (result.success) {
      const allNews = result.data || []
      updateTime.value = new Date(result.updateTime).getTime()
      
      // 分页处理
      const startIndex = (page - 1) * pageSize.value
      const endIndex = startIndex + pageSize.value
      const pageNews = allNews.slice(startIndex, endIndex)
      
      if (page === 1) {
        newsList.value = pageNews
      } else {
        newsList.value = [...newsList.value, ...pageNews]
      }
      
      // 检查是否还有更多数据
      hasMore.value = endIndex < allNews.length
      
      // 加载收藏状态
      await loadFavoriteStatus()
      
      console.log(`✅ 成功加载 ${pageNews.length} 条新闻，总计 ${newsList.value.length} 条`)
      
      if (page === 1 && pageNews.length > 0) {
        uni.showToast({ 
          title: `已加载 ${pageNews.length} 条最新快讯`, 
          icon: 'success',
          duration: 2000
        })
      }
    } else {
      throw new Error(result.error || '加载失败')
    }
  } catch (error) {
    console.error('❌ 加载新闻失败:', error)
    uni.showToast({ title: '加载失败', icon: 'error' })
  } finally {
    loading.value = false
    loadingMore.value = false
  }
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

// 刷新新闻
const refreshNews = async () => {
  console.log('🔄 刷新新闻数据...')
  currentPage.value = 1
  await loadNews(1)
  await loadStats()
}

// 加载更多
const loadMore = async () => {
  if (!hasMore.value || loadingMore.value) return
  
  currentPage.value += 1
  await loadNews(currentPage.value)
}

// 切换收藏状态
const toggleFavorite = (news: any) => {
  try {
    if (news.isFavorited) {
      LocalStorage.removeFavorite(news.id)
      news.isFavorited = false
      uni.showToast({ title: '已取消收藏', icon: 'success' })
    } else {
      LocalStorage.saveFavorite(news)
      news.isFavorited = true
      uni.showToast({ title: '已收藏', icon: 'success' })
    }
  } catch (error) {
    console.error('❌ 收藏操作失败:', error)
    uni.showToast({ title: '操作失败', icon: 'error' })
  }
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

// 查看新闻详情
const viewNewsDetail = (news: any) => {
  uni.navigateTo({
    url: `/pages/ai-news/news-detail?id=${news.id}`
  })
}

// 前往搜索页面
const goToSearch = () => {
  uni.navigateTo({
    url: '/pages/ai-news/search'
  })
}

// 加入群组
const joinGroup = () => {
  uni.showModal({
    title: '提示',
    content: '请关注AI工具集官方网站获取更多信息',
    showCancel: false
  })
}

// 格式化日期分组
const formatDateGroup = (dateKey: string) => {
  const date = new Date(dateKey)
  const today = new Date()
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekDay = weekDays[date.getDay()]
  
  if (dateKey === today.toISOString().split('T')[0]) {
    return `今天·${weekDay}`
  } else if (dateKey === yesterday.toISOString().split('T')[0]) {
    return `昨天·${weekDay}`
  } else {
    return `${month}月${day}日·${weekDay}`
  }
}

// 格式化时间
const formatTime = (time: any) => {
  if (!time) return ''
  
  const date = new Date(time)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${hours}:${minutes}`
}
</script>

<style scoped lang="scss">
.news-container {
  min-height: 100vh;
  background: #F5F7FA;
}

// 横幅样式
.header-banner {
  background: #4285F4;
  padding: 30rpx 20rpx 20rpx;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 120%;
    height: 200%;
    background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
    transform: rotate(15deg);
  }
}

.banner-bg {
  position: relative;
  z-index: 1;
}

.banner-content {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.banner-icon {
  width: 80rpx;
  height: 80rpx;
  background: rgba(255,255,255,0.2);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.news-icon {
  font-size: 40rpx;
}

.banner-text {
  flex: 1;
}

.banner-title {
  font-size: 36rpx;
  font-weight: bold;
  color: white;
  margin-bottom: 8rpx;
}

.banner-subtitle {
  font-size: 24rpx;
  color: rgba(255,255,255,0.9);
  background: rgba(255,255,255,0.15);
  padding: 6rpx 12rpx;
  border-radius: 12rpx;
  display: inline-block;
}

.description {
  font-size: 24rpx;
  line-height: 1.6;
  color: rgba(255,255,255,0.9);
  
  .highlight {
    color: #FFE082;
    text-decoration: underline;
  }
}

// 搜索框样式
.search-section {
  padding: 20rpx;
  background: white;
  margin-bottom: 1rpx;
}

.search-box {
  display: flex;
  align-items: center;
  padding: 24rpx 20rpx;
  background: #F8F9FA;
  border-radius: 12rpx;
  border: 2rpx solid #E9ECEF;
}

.search-placeholder {
  font-size: 28rpx;
  color: #999;
  margin-left: 12rpx;
}

// 统计信息样式
.stats-section {
  display: flex;
  justify-content: space-around;
  padding: 20rpx;
  background: white;
  margin-bottom: 20rpx;
}

.stats-item {
  text-align: center;
  
  .stats-number {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    color: #4285F4;
    margin-bottom: 8rpx;
  }
  
  .stats-label {
    font-size: 24rpx;
    color: #666;
  }
}

// 加载状态
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 20rpx;
  
  .loading-text {
    font-size: 28rpx;
    color: #666;
    margin-top: 20rpx;
  }
}

// 新闻列表样式
.news-list {
  padding: 0 20rpx 20rpx;
}

.date-group {
  margin-bottom: 40rpx;
}

.date-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  padding: 0 4rpx;
}

.date-indicator {
  width: 8rpx;
  height: 8rpx;
  background: #4285F4;
  border-radius: 50%;
  margin-right: 12rpx;
}

.date-text {
  font-size: 28rpx;
  font-weight: bold;
  color: #4285F4;
}

.date-news-list {
  background: white;
  border-radius: 12rpx;
  overflow: hidden;
}

.news-item {
  display: flex;
  align-items: flex-start;
  padding: 24rpx;
  border-bottom: 1rpx solid #F0F0F0;
  transition: background-color 0.2s;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:active {
    background: #F8F9FA;
  }
}

.news-content {
  flex: 1;
  margin-right: 20rpx;
}

.news-title {
  font-size: 30rpx;
  color: #333;
  line-height: 1.5;
  margin-bottom: 12rpx;
  font-weight: 500;
}

.news-meta {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.news-source {
  font-size: 24rpx;
  color: #666;
  margin-right: 20rpx;
}

.news-time {
  font-size: 24rpx;
  color: #999;
}

.news-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.news-tag {
  font-size: 20rpx;
  color: #4285F4;
  background: rgba(66, 133, 244, 0.1);
  padding: 4rpx 8rpx;
  border-radius: 8rpx;
}

.news-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.favorite-btn {
  padding: 12rpx;
  border-radius: 50%;
  transition: background-color 0.2s;
  
  &:active {
    background: #F0F0F0;
  }
  
  &.favorited {
    background: rgba(255, 107, 107, 0.1);
  }
}

// 加载更多样式
.load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  
  .load-more-text {
    font-size: 28rpx;
    color: #666;
    margin-left: 12rpx;
  }
}

// 没有更多数据
.no-more {
  text-align: center;
  padding: 40rpx;
  
  .no-more-text {
    font-size: 24rpx;
    color: #999;
  }
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 40rpx;
  
  .empty-text {
    font-size: 28rpx;
    color: #999;
    margin: 20rpx 0 40rpx;
  }
  
  .refresh-btn {
    background: #4285F4;
    color: white;
    border: none;
    border-radius: 24rpx;
    padding: 20rpx 40rpx;
    font-size: 28rpx;
  }
}

// 浮动刷新按钮
.floating-refresh {
  position: fixed;
  right: 30rpx;
  bottom: 30rpx;
  width: 80rpx;
  height: 80rpx;
  background: white;
  border-radius: 50%;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  
  &:active {
    transform: scale(0.95);
  }
}
</style> 