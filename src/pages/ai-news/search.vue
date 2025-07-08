<template>
  <view class="search-container">
    <!-- 搜索栏 -->
    <view class="search-header">
      <view class="search-input-box">
        <uni-icons type="search" size="18" color="#999"></uni-icons>
        <input 
          class="search-input"
          v-model="searchKeyword"
          placeholder="搜索AI快讯..."
          @input="onSearchInput"
          @confirm="handleSearch"
          focus
        />
        <view class="clear-btn" v-if="searchKeyword" @click="clearSearch">
          <uni-icons type="clear" size="16" color="#999"></uni-icons>
        </view>
      </view>
      <text class="cancel-btn" @click="goBack">取消</text>
    </view>

    <!-- 搜索建议 -->
    <view class="search-suggestions" v-if="!searchResults.length && !hasSearched">
      <view class="suggestion-section">
        <text class="section-title">热门搜索</text>
        <view class="suggestion-tags">
          <text 
            v-for="tag in hotTags" 
            :key="tag"
            class="suggestion-tag"
            @click="searchByTag(tag)"
          >
            {{ tag }}
          </text>
        </view>
      </view>
      
      <view class="suggestion-section" v-if="searchHistory.length">
        <view class="section-header">
          <text class="section-title">搜索历史</text>
          <text class="clear-history" @click="clearHistory">清空</text>
        </view>
        <view class="suggestion-tags">
          <text 
            v-for="history in searchHistory" 
            :key="history"
            class="suggestion-tag history-tag"
            @click="searchByTag(history)"
          >
            {{ history }}
          </text>
        </view>
      </view>
    </view>

    <!-- 搜索结果 -->
    <view class="search-results" v-if="hasSearched">
      <!-- 结果统计 -->
      <view class="result-stats" v-if="!loading">
        <text class="stats-text">
          找到 {{ searchResults.length }} 条相关结果
          <text v-if="searchKeyword">「{{ searchKeyword }}」</text>
        </text>
      </view>

      <!-- 筛选选项 -->
      <view class="filter-section">
        <scroll-view scroll-x="true" class="filter-scroll">
          <view class="filter-list">
            <view 
              v-for="(filter, index) in filters" 
              :key="index"
              class="filter-item"
              :class="{ active: selectedFilter === filter }"
              @click="selectFilter(filter)"
            >
              {{ filter }}
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 结果列表 -->
      <view class="results-list">
        <view 
          v-for="(news, index) in filteredResults" 
          :key="news._id"
          class="result-item"
          @click="viewNewsDetail(news)"
        >
          <view class="result-header">
            <view class="result-category" :class="getCategoryClass(news.category)">
              {{ news.category }}
            </view>
            <text class="result-time">{{ formatTime(news.publishTime) }}</text>
          </view>
          
          <view class="result-title" v-html="highlightKeyword(news.title)"></view>
          
          <view class="result-content" v-html="highlightKeyword(news.content)"></view>
          
          <view class="result-tags" v-if="news.tags && news.tags.length">
            <text 
              v-for="tag in news.tags.slice(0, 3)" 
              :key="tag"
              class="result-tag"
            >
              {{ tag }}
            </text>
          </view>
        </view>
        
        <!-- 无结果 -->
        <view class="no-results" v-if="!loading && searchResults.length === 0">
          <uni-icons type="search" size="60" color="#ddd"></uni-icons>
          <text class="no-results-text">没有找到相关内容</text>
          <text class="no-results-tip">试试其他关键词</text>
        </view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view class="loading-state" v-if="loading">
      <uni-icons type="spinner-cycle" size="30" color="#007aff"></uni-icons>
      <text class="loading-text">搜索中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { NewsService, LocalStorage } from '../../utils/cloudbase'

// 响应式数据
const searchKeyword = ref('')
const searchResults = ref<any[]>([])
const selectedFilter = ref('全部')
const loading = ref(false)
const hasSearched = ref(false)
const searchHistory = ref<string[]>([])

// 搜索过滤器
const filters = ref(['全部', '投融资', '开源项目', '产品发布', '行业动态', '技术研究', '综合资讯'])

// 热门标签
const hotTags = ref([
  'AI模型', '大语言模型', 'ChatGPT', 'OpenAI', 
  '投融资', '开源', '谷歌', '微软', '百度', 
  '机器学习', '深度学习', '自然语言处理'
])

// 计算属性：过滤后的结果
const filteredResults = computed(() => {
  if (selectedFilter.value === '全部') {
    return searchResults.value
  }
  return searchResults.value.filter(news => news.category === selectedFilter.value)
})

// 页面加载
onMounted(() => {
  loadSearchHistory()
})

// 搜索输入处理
const onSearchInput = () => {
  // 实时搜索可以在这里实现
  // 为了性能考虑，这里使用防抖
}

// 执行搜索
const handleSearch = async () => {
  const keyword = searchKeyword.value.trim()
  if (!keyword) return
  
  loading.value = true
  hasSearched.value = true
  
  try {
    console.log(`🔍 搜索关键词: ${keyword}`)
    
    // 获取所有新闻数据
    const result = await NewsService.getNews()
    
    if (result.success) {
      const allNews = result.data
      
      // 进行本地搜索
      const searchResults = allNews.filter(news => {
        const titleMatch = news.title.toLowerCase().includes(keyword.toLowerCase())
        const contentMatch = news.content.toLowerCase().includes(keyword.toLowerCase())
        const tagsMatch = news.tags && news.tags.some((tag: string) => 
          tag.toLowerCase().includes(keyword.toLowerCase())
        )
        const sourceMatch = news.source.toLowerCase().includes(keyword.toLowerCase())
        
        return titleMatch || contentMatch || tagsMatch || sourceMatch
      })
      
      // 按时间排序
      searchResults.value = searchResults.sort((a, b) => 
        new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime()
      )
      
      console.log(`✅ 找到 ${searchResults.value.length} 条相关结果`)
      
      // 保存搜索历史
      saveSearchHistory(keyword)
    } else {
      throw new Error(result.error || '搜索失败')
    }
    
  } catch (error) {
    console.error('❌ 搜索失败:', error)
    uni.showToast({ title: '搜索失败', icon: 'error' })
  } finally {
    loading.value = false
  }
}

// 通过标签搜索
const searchByTag = (tag: string) => {
  searchKeyword.value = tag
  handleSearch()
}

// 选择过滤器
const selectFilter = (filter: string) => {
  selectedFilter.value = filter
}

// 高亮关键词
const highlightKeyword = (text: string) => {
  if (!searchKeyword.value || !text) return text
  
  const keyword = searchKeyword.value.trim()
  const regex = new RegExp(`(${keyword})`, 'gi')
  return text.replace(regex, '<span style="color: #007aff; background-color: #f0f8ff;">$1</span>')
}

// 查看新闻详情
const viewNewsDetail = (news: any) => {
  uni.navigateTo({
    url: `/pages/ai-news/news-detail?id=${news.id}`
  })
}

// 清空搜索
const clearSearch = () => {
  searchKeyword.value = ''
  searchResults.value = []
  hasSearched.value = false
}

// 返回
const goBack = () => {
  uni.navigateBack()
}

// 保存搜索历史
const saveSearchHistory = (keyword: string) => {
  try {
    // 移除重复的历史记录
    const newHistory = [keyword, ...searchHistory.value.filter(item => item !== keyword)]
    // 最多保存10条历史记录
    searchHistory.value = newHistory.slice(0, 10)
    
    // 保存到本地存储
    uni.setStorageSync('search_history', searchHistory.value)
  } catch (error) {
    console.error('保存搜索历史失败:', error)
  }
}

// 加载搜索历史
const loadSearchHistory = () => {
  try {
    const history = uni.getStorageSync('search_history')
    if (history && Array.isArray(history)) {
      searchHistory.value = history
    }
  } catch (error) {
    console.error('加载搜索历史失败:', error)
  }
}

// 清空搜索历史
const clearHistory = () => {
  uni.showModal({
    title: '提示',
    content: '确定要清空搜索历史吗？',
    success: (res) => {
      if (res.confirm) {
        searchHistory.value = []
        uni.removeStorageSync('search_history')
        uni.showToast({ title: '已清空', icon: 'success' })
      }
    }
  })
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
    return `${date.getMonth() + 1}月${date.getDate()}日`
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
.search-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.search-header {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
}

.search-input-box {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 16rpx 20rpx;
  background-color: #f5f7fa;
  border-radius: 50rpx;
  margin-right: 20rpx;
}

.search-input {
  flex: 1;
  margin-left: 16rpx;
  font-size: 28rpx;
  color: #333;
}

.clear-btn {
  padding: 8rpx;
}

.cancel-btn {
  font-size: 28rpx;
  color: #007aff;
}

.search-suggestions {
  padding: 30rpx;
}

.suggestion-section {
  margin-bottom: 40rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.clear-history {
  font-size: 24rpx;
  color: #999;
}

.suggestion-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.suggestion-tag {
  padding: 12rpx 20rpx;
  background-color: #f0f8ff;
  color: #007aff;
  font-size: 26rpx;
  border-radius: 30rpx;
  border: 1rpx solid #007aff;
}

.history-tag {
  background-color: #f5f7fa;
  color: #666;
  border-color: #ddd;
}

.search-results {
  flex: 1;
}

.result-stats {
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
}

.stats-text {
  font-size: 26rpx;
  color: #666;
}

.filter-section {
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
}

.filter-scroll {
  white-space: nowrap;
}

.filter-list {
  display: flex;
  padding: 20rpx;
}

.filter-item {
  padding: 12rpx 24rpx;
  margin-right: 20rpx;
  background-color: #f5f7fa;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: #666;
  white-space: nowrap;
  transition: all 0.3s;
}

.filter-item.active {
  background-color: #007aff;
  color: #fff;
}

.results-list {
  padding: 20rpx;
}

.result-item {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.result-category {
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

.result-time {
  font-size: 22rpx;
  color: #999;
}

.result-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  line-height: 1.4;
  margin-bottom: 16rpx;
}

.result-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
  margin-bottom: 20rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.result-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.result-tag {
  padding: 6rpx 12rpx;
  background-color: #f0f8ff;
  color: #007aff;
  font-size: 22rpx;
  border-radius: 12rpx;
  border: 1rpx solid #007aff;
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 40rpx;
}

.no-results-text {
  font-size: 28rpx;
  color: #999;
  margin: 30rpx 0 10rpx;
}

.no-results-tip {
  font-size: 24rpx;
  color: #ccc;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 40rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #007aff;
  margin-top: 20rpx;
}
</style> 