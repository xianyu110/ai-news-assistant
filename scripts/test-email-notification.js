const { sendEmailNotification } = require('./send-email-notification');

// 测试邮箱配置
const TEST_EMAIL = process.argv[2] || '3497181457@qq.com';

// 模拟测试新闻数据
const testNewsData = [
  {
    title: '测试：GPT-5 即将发布，性能提升50%',
    content: '据内部消息，OpenAI 即将发布 GPT-5，在推理能力和创造性方面有显著提升，预计将重新定义 AI 助手的标准。新版本在多项基准测试中表现优异，特别是在代码生成和数学推理方面。',
    publishTime: new Date().toISOString(),
    category: '大模型',
    source: 'AI资讯助手'
  },
  {
    title: '测试：Claude 3.5 Sonnet 突破性更新',
    content: 'Anthropic 发布 Claude 3.5 Sonnet 重大更新，在代码生成和数学推理方面表现卓越，已超越多项基准测试。这次更新引入了全新的思维链推理机制，显著提升了复杂问题的解决能力。',
    publishTime: new Date().toISOString(),
    category: '大模型',
    source: 'AI资讯助手'
  },
  {
    title: '测试：国产AI芯片实现重大突破',
    content: '中国科技公司在AI芯片领域取得重大突破，新一代芯片在性能和能耗方面达到国际先进水平。这一成就标志着我国在AI硬件领域迈出了重要一步，有望减少对进口芯片的依赖。',
    publishTime: new Date().toISOString(),
    category: '芯片',
    source: 'AI资讯助手'
  },
  {
    title: '测试：AI在医疗诊断中的应用获得FDA批准',
    content: 'FDA批准了一项基于AI的医疗诊断系统，该系统能够快速准确地识别多种疾病。这标志着AI技术在医疗领域的应用迈上了新台阶，有望改善医疗诊断的准确性和效率。',
    publishTime: new Date().toISOString(),
    category: '医疗AI',
    source: 'AI资讯助手'
  },
  {
    title: '测试：全球AI治理框架初步形成',
    content: '国际AI治理框架初步形成，多国达成共识建立AI安全和伦理标准。这一框架旨在促进AI技术的健康发展，同时确保AI系统的安全性和可靠性，为全球AI发展提供指导。',
    publishTime: new Date().toISOString(),
    category: '政策',
    source: 'AI资讯助手'
  }
];

// 测试邮件发送功能
async function testEmailNotification() {
  console.log('📧 开始测试邮箱通知功能...');
  console.log('⏰ 测试时间:', new Date().toLocaleString('zh-CN'));
  
  if (!TEST_EMAIL) {
    console.error('❌ 请提供测试邮箱地址');
    console.log('使用方法: node test-email-notification.js <email>');
    process.exit(1);
  }
  
  console.log('📮 测试邮箱:', TEST_EMAIL);
  console.log('📊 测试数据:', `${testNewsData.length} 条AI资讯`);
  
  try {
    const result = await sendEmailNotification(TEST_EMAIL, testNewsData);
    
    console.log('\n📊 测试结果:');
    console.log('- 成功:', result.success ? '✅' : '❌');
    
    if (result.success) {
      console.log('- 邮件ID:', result.messageId);
      console.log('- 目标邮箱:', result.targetEmail);
      console.log('\n✅ 邮箱通知测试成功!');
      console.log('📱 请检查您的邮箱，应该会收到测试邮件');
    } else {
      console.log('- 错误信息:', result.error);
      console.log('\n❌ 邮箱通知测试失败!');
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
    process.exit(1);
  }
}

// 测试多个邮箱
async function testMultipleEmails() {
  const emails = process.argv.slice(2);
  
  if (emails.length === 0) {
    console.error('❌ 请提供至少一个测试邮箱地址');
    console.log('使用方法: node test-email-notification.js <email1> <email2> ...');
    process.exit(1);
  }
  
  console.log('📧 开始批量测试邮箱通知功能...');
  console.log('📮 测试邮箱:', emails.join(', '));
  
  const results = [];
  
  for (const email of emails) {
    console.log(`\n📤 正在发送到: ${email}`);
    
    try {
      const result = await sendEmailNotification(email, testNewsData);
      results.push({ email, ...result });
      
      if (result.success) {
        console.log(`✅ ${email} 发送成功`);
      } else {
        console.log(`❌ ${email} 发送失败: ${result.error}`);
      }
      
      // 发送间隔，避免被限制
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ ${email} 发送异常:`, error.message);
      results.push({ email, success: false, error: error.message });
    }
  }
  
  // 显示汇总结果
  console.log('\n📊 批量测试结果:');
  const successCount = results.filter(r => r.success).length;
  const failCount = results.length - successCount;
  
  console.log(`- 总计: ${results.length} 个邮箱`);
  console.log(`- 成功: ${successCount} 个`);
  console.log(`- 失败: ${failCount} 个`);
  
  if (failCount > 0) {
    console.log('\n❌ 失败的邮箱:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`- ${r.email}: ${r.error}`);
    });
  }
  
  console.log('\n🎉 批量测试完成!');
}

// 测试邮箱配置
async function testEmailConfig() {
  console.log('📧 测试邮箱配置...');
  
  const nodemailer = require('nodemailer');
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.qq.com',
    port: 587,
    secure: false,
    auth: {
      user: '3497181457@qq.com',
      pass: process.env.EMAIL_PASSWORD || 'bddxuogmqjinciha'
    }
  });
  
  try {
    await transporter.verify();
    console.log('✅ 邮箱配置验证成功');
    return true;
  } catch (error) {
    console.error('❌ 邮箱配置验证失败:', error.message);
    return false;
  }
}

// 主函数
async function main() {
  console.log('🚀 邮箱通知测试工具');
  console.log('==========================================');
  
  // 先测试邮箱配置
  const configValid = await testEmailConfig();
  if (!configValid) {
    console.log('\n💡 解决方案:');
    console.log('1. 检查邮箱地址和授权码是否正确');
    console.log('2. 确保QQ邮箱已开启SMTP服务');
    console.log('3. 检查网络连接是否正常');
    process.exit(1);
  }
  
  // 根据参数数量选择测试方式
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // 使用默认邮箱测试
    await testEmailNotification();
  } else if (args.length === 1) {
    // 单个邮箱测试
    await testEmailNotification();
  } else {
    // 多个邮箱测试
    await testMultipleEmails();
  }
  
  console.log('\n🎯 下一步操作:');
  console.log('1. 检查邮箱收件箱（包括垃圾邮件）');
  console.log('2. 验证邮件内容和格式');
  console.log('3. 配置GitHub Actions中的邮件通知');
  console.log('4. 设置定时任务进行自动推送');
}

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 程序执行失败:', error.message);
    process.exit(1);
  });
}

module.exports = {
  testEmailNotification,
  testMultipleEmails,
  testEmailConfig
}; 