const fs = require('fs');
const path = require('path');
const { crawlAINews } = require('./crawl-news');

/**
 * 历史数据管理器
 */
class HistoryManager {
  constructor() {
    this.dataDir = path.join(__dirname, '../src/data');
    this.historyDir = path.join(this.dataDir, 'history');
    this.currentFile = path.join(this.dataDir, 'ai-news.json');
    this.allNewsFile = path.join(this.dataDir, 'all-news.json');
    this.historyIndexFile = path.join(this.historyDir, 'index.json');
    
    // 确保目录存在
    [this.dataDir, this.historyDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * 更新历史数据
   */
  async updateHistory() {
    try {
      console.log('🔄 开始更新历史数据...');
      
      // 1. 爬取最新数据
      const newData = await crawlAINews();
      
      if (!newData.success || !newData.data.length) {
        console.log('❌ 没有获取到新数据');
        return false;
      }
      
      // 2. 读取现有的全量数据
      const allNews = this.loadAllNews();
      
      // 3. 合并和去重
      const mergedData = this.mergeAndDeduplicate(allNews.data, newData.data);
      
      // 4. 按时间排序
      mergedData.sort((a, b) => new Date(b.publishTime) - new Date(a.publishTime));
      
      // 5. 更新全量数据文件
      const updatedAllNews = {
        success: true,
        updateTime: new Date().toISOString(),
        count: mergedData.length,
        data: mergedData,
        stats: this.generateStats(mergedData)
      };
      
      fs.writeFileSync(this.allNewsFile, JSON.stringify(updatedAllNews, null, 2));
      
      // 6. 更新当前数据文件（只包含最新的50条）
      const currentData = {
        ...updatedAllNews,
        data: mergedData.slice(0, 50),
        count: Math.min(50, mergedData.length)
      };
      
      fs.writeFileSync(this.currentFile, JSON.stringify(currentData, null, 2));
      
      // 7. 按日期归档
      await this.archiveByDate(mergedData);
      
      // 8. 更新历史索引
      this.updateHistoryIndex();
      
      console.log(`✅ 历史数据更新完成！总数据量: ${mergedData.length} 条`);
      console.log(`📊 今日新增: ${newData.data.length} 条`);
      console.log(`📁 当前展示: ${currentData.count} 条`);
      
      return {
        totalCount: mergedData.length,
        newCount: newData.data.length,
        currentCount: currentData.count
      };
      
    } catch (error) {
      console.error('❌ 更新历史数据失败:', error);
      return false;
    }
  }

  /**
   * 加载全量数据
   */
  loadAllNews() {
    try {
      if (fs.existsSync(this.allNewsFile)) {
        const content = fs.readFileSync(this.allNewsFile, 'utf-8');
        return JSON.parse(content);
      }
    } catch (error) {
      console.warn('读取全量数据失败:', error);
    }
    
    // 返回默认结构
    return {
      success: true,
      updateTime: new Date().toISOString(),
      count: 0,
      data: [],
      stats: {
        todayCount: 0,
        totalCount: 0,
        categories: [],
        sources: []
      }
    };
  }

  /**
   * 合并数据并去重
   */
  mergeAndDeduplicate(existingData, newData) {
    const allData = [...existingData];
    
    // 按ID去重，优先保留新数据
    newData.forEach(newItem => {
      const existingIndex = allData.findIndex(item => 
        item.id === newItem.id || 
        (item.title === newItem.title && item.source === newItem.source)
      );
      
      if (existingIndex >= 0) {
        // 更新现有数据
        allData[existingIndex] = {
          ...allData[existingIndex],
          ...newItem,
          crawlTime: newItem.crawlTime // 更新爬取时间
        };
      } else {
        // 添加新数据
        allData.push(newItem);
      }
    });
    
    return allData;
  }

  /**
   * 按日期归档数据
   */
  async archiveByDate(allData) {
    try {
      // 按日期分组
      const groupedByDate = {};
      
      allData.forEach(item => {
        const date = new Date(item.publishTime).toISOString().split('T')[0];
        if (!groupedByDate[date]) {
          groupedByDate[date] = [];
        }
        groupedByDate[date].push(item);
      });
      
      // 保存每日归档
      for (const [date, items] of Object.entries(groupedByDate)) {
        const archiveFile = path.join(this.historyDir, `${date}.json`);
        
        // 按时间排序
        items.sort((a, b) => new Date(b.publishTime) - new Date(a.publishTime));
        
        const archiveData = {
          date: date,
          count: items.length,
          data: items,
          updateTime: new Date().toISOString()
        };
        
        fs.writeFileSync(archiveFile, JSON.stringify(archiveData, null, 2));
      }
      
      console.log(`📁 已归档 ${Object.keys(groupedByDate).length} 天的数据`);
      
    } catch (error) {
      console.error('归档数据失败:', error);
    }
  }

  /**
   * 更新历史索引
   */
  updateHistoryIndex() {
    try {
      const files = fs.readdirSync(this.historyDir)
        .filter(file => file.endsWith('.json') && file !== 'index.json')
        .map(file => {
          const date = file.replace('.json', '');
          const filePath = path.join(this.historyDir, file);
          const stats = fs.statSync(filePath);
          
          // 读取文件获取计数
          try {
            const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            return {
              date: date,
              file: file,
              count: content.count || 0,
              size: stats.size,
              updateTime: content.updateTime || stats.mtime.toISOString()
            };
          } catch {
            return {
              date: date,
              file: file,
              count: 0,
              size: stats.size,
              updateTime: stats.mtime.toISOString()
            };
          }
        })
        .sort((a, b) => b.date.localeCompare(a.date)); // 按日期倒序
      
      const index = {
        totalDays: files.length,
        totalSize: files.reduce((sum, file) => sum + file.size, 0),
        updateTime: new Date().toISOString(),
        files: files
      };
      
      fs.writeFileSync(this.historyIndexFile, JSON.stringify(index, null, 2));
      console.log(`📋 历史索引已更新，包含 ${files.length} 天的数据`);
      
    } catch (error) {
      console.error('更新历史索引失败:', error);
    }
  }

  /**
   * 生成统计信息
   */
  generateStats(data) {
    const today = new Date().toISOString().split('T')[0];
    const todayCount = data.filter(item => 
      item.publishTime.startsWith(today)
    ).length;
    
    const categories = [...new Set(data.map(item => item.category))];
    const sources = [...new Set(data.map(item => item.source))];
    
    // 统计各分类数量
    const categoryStats = {};
    categories.forEach(cat => {
      categoryStats[cat] = data.filter(item => item.category === cat).length;
    });
    
    return {
      todayCount,
      totalCount: data.length,
      categories: categories,
      sources: sources,
      categoryStats: categoryStats,
      dateRange: data.length > 0 ? {
        earliest: data[data.length - 1]?.publishTime,
        latest: data[0]?.publishTime
      } : null
    };
  }

  /**
   * 清理过期数据（可选）
   */
  cleanupOldData(daysToKeep = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      const cutoffString = cutoffDate.toISOString().split('T')[0];
      
      const files = fs.readdirSync(this.historyDir)
        .filter(file => file.endsWith('.json') && file !== 'index.json')
        .filter(file => {
          const date = file.replace('.json', '');
          return date < cutoffString;
        });
      
      files.forEach(file => {
        fs.unlinkSync(path.join(this.historyDir, file));
        console.log(`🗑️ 删除过期文件: ${file}`);
      });
      
      if (files.length > 0) {
        this.updateHistoryIndex();
        console.log(`🧹 清理完成，删除了 ${files.length} 个过期文件`);
      }
      
    } catch (error) {
      console.error('清理过期数据失败:', error);
    }
  }
}

// 如果是直接运行脚本
if (require.main === module) {
  const manager = new HistoryManager();
  
  manager.updateHistory().then(result => {
    if (result) {
      console.log('🎉 历史数据更新完成！');
      console.log(`📊 统计: 总计${result.totalCount}条，新增${result.newCount}条，当前显示${result.currentCount}条`);
    } else {
      console.log('❌ 历史数据更新失败');
    }
    process.exit(0);
  }).catch(error => {
    console.error('💥 脚本执行失败:', error);
    process.exit(1);
  });
}

module.exports = { HistoryManager }; 