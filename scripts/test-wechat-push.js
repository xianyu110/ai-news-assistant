#!/usr/bin/env node

const axios = require('axios');

/**
 * 测试Server酱推送功能
 * 使用方法：node scripts/test-wechat-push.js YOUR_SERVERCHAN_KEY
 */

async function testServerChanPush(key) {
  try {
    console.log('🔍 开始测试Server酱推送功能...');
    console.log('🔑 使用密钥:', key.substring(0, 10) + '...');
    
    // 构建测试推送内容
    const title = 'AI新闻助手 - 测试推送';
    const content = `
## 📊 测试数据统计
- **总数据量**: 1500 条
- **今日新增**: 15 条
- **更新时间**: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}

## 🔗 快速访问
[🌐 在线查看](https://xianyu110.github.io/ai-news-assistant/)

## 🔥 今日资讯

**📅 今日共收录 6 条AI资讯**

### 1. ChatGPT发布重大更新
GPT-4在多模态处理方面取得重大突破，支持更复杂的图像和文本混合输入，为用户提供更智能的交互体验...
**分类**: 产品发布
**来源**: AI工具集
**日期**: ${new Date().toLocaleDateString('zh-CN')}
---

### 2. 谷歌AI助手新功能上线
谷歌AI助手新增实时语音对话功能，支持多语言实时翻译，大幅提升用户沟通效率...
**分类**: 产品发布
**来源**: AI工具集
**日期**: ${new Date().toLocaleDateString('zh-CN')}
---

### 3. 开源AI项目获得巨额融资
知名开源AI项目获得1000万美元A轮融资，用于加速模型训练和开发者生态建设...
**分类**: 投融资
**来源**: AI工具集
**日期**: ${new Date().toLocaleDateString('zh-CN')}
---

### 4. 百度文心大模型新版本发布
百度发布文心大模型4.0版本，在代码生成、数学推理等方面表现显著提升...
**分类**: 产品发布
**来源**: AI工具集
**日期**: ${new Date().toLocaleDateString('zh-CN')}
---

### 5. AI芯片初创公司完成C轮融资
专注于AI芯片设计的初创公司完成5000万美元C轮融资，加速产品商业化进程...
**分类**: 投融资
**来源**: AI工具集
**日期**: ${new Date().toLocaleDateString('zh-CN')}
---

### 6. 微软发布Copilot新功能
微软为Copilot增加了图像生成和视频编辑功能，进一步扩展AI助手的应用场景...
**分类**: 产品发布
**来源**: AI工具集
**日期**: ${new Date().toLocaleDateString('zh-CN')}
---

## 📱 关于AI新闻助手
AI新闻助手是一个基于UniApp + GitHub Actions的零成本AI新闻聚合应用，每2小时自动更新AI行业最新资讯。

🌟 **项目特色**:
- 🔄 自动爬取AI工具集每日快讯
- 📱 支持多端访问（H5、小程序、App）
- 🎯 智能分类和搜索功能
- 💾 本地收藏无需登录
- 🔗 GitHub Pages零成本部署

---
✅ 如果您收到了这条消息，说明微信推送功能配置成功！
`;
    
    // 发送推送
    const url = `https://sctapi.ftqq.com/${key}.send`;
    
    console.log('📤 发送推送请求...');
    
    const response = await axios.post(url, {
      title: title,
      desp: content
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('📨 Server酱响应:', response.data);
    
    if (response.data.code === 0) {
      console.log('✅ 推送发送成功！');
      console.log('📱 请检查您的微信，应该会收到推送消息');
      console.log('🎉 微信推送功能配置成功！');
      
      return {
        success: true,
        message: '推送发送成功',
        data: response.data
      };
    } else {
      console.error('❌ 推送发送失败:', response.data.message);
      return {
        success: false,
        message: response.data.message || '推送发送失败'
      };
    }
    
  } catch (error) {
    console.error('💥 测试推送失败:', error.message);
    
    if (error.response) {
      console.error('📋 错误详情:', error.response.data);
      return {
        success: false,
        message: `API错误: ${error.response.status} - ${error.response.data?.message || error.message}`
      };
    } else if (error.request) {
      console.error('🌐 网络错误: 请求超时或网络连接问题');
      return {
        success: false,
        message: '网络错误: 请求超时或网络连接问题'
      };
    } else {
      return {
        success: false,
        message: error.message
      };
    }
  }
}

// 主函数
async function main() {
  const key = process.argv[2];
  
  if (!key) {
    console.error('❌ 错误: 请提供Server酱密钥');
    console.log('💡 使用方法: node scripts/test-wechat-push.js YOUR_SERVERCHAN_KEY');
    console.log('📖 示例: node scripts/test-wechat-push.js SCT203875TfpJ2RVuzPBOMeLwACaLvVM9x');
    process.exit(1);
  }
  
  // 验证密钥格式
  if (!key.startsWith('SCT') || key.length < 20) {
    console.error('❌ 错误: Server酱密钥格式不正确');
    console.log('💡 正确格式: SCT + 数字字母组合，长度通常在20-40位');
    console.log('📖 示例: SCT203875TfpJ2RVuzPBOMeLwACaLvVM9x');
    process.exit(1);
  }
  
  console.log('🚀 开始测试微信推送功能...');
  console.log('⏰ 测试时间:', new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }));
  console.log('');
  
  const result = await testServerChanPush(key);
  
  console.log('');
  console.log('📊 测试结果:');
  console.log('- 成功:', result.success ? '✅' : '❌');
  console.log('- 消息:', result.message);
  
  if (result.success) {
    console.log('');
    console.log('🎯 下一步操作:');
    console.log('1. 在GitHub仓库中配置Secrets');
    console.log('2. 设置SERVERCHAN_KEY为您的密钥');
    console.log('3. 配置其他必要的云开发密钥');
    console.log('4. 运行GitHub Actions工作流测试');
  } else {
    console.log('');
    console.log('🔍 故障排除:');
    console.log('1. 检查Server酱密钥是否正确');
    console.log('2. 确认微信已绑定到Server酱账号');
    console.log('3. 检查网络连接是否正常');
    console.log('4. 访问 https://sct.ftqq.com/ 查看账号状态');
  }
}

// 运行测试
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testServerChanPush }; 