#!/usr/bin/env node

/**
 * Vercel KV 测试脚本
 * 用于验证 KV 配置是否正确
 */

import { kv } from '@vercel/kv';

async function testKV() {
  console.log('🧪 开始测试 Vercel KV 连接...\n');

  try {
    // 测试 1: 写入数据
    console.log('📝 测试 1: 写入测试数据...');
    const testKey = 'test:connection';
    const testValue = {
      message: 'Hello from Vercel KV!',
      timestamp: new Date().toISOString()
    };
    
    await kv.set(testKey, testValue);
    console.log('✅ 写入成功\n');

    // 测试 2: 读取数据
    console.log('📖 测试 2: 读取测试数据...');
    const result = await kv.get(testKey);
    console.log('✅ 读取成功:', result);
    console.log('');

    // 测试 3: 检查新闻数据
    console.log('📰 测试 3: 检查新闻数据...');
    const newsData = await kv.get('news:latest');
    
    if (newsData) {
      console.log('✅ 找到新闻数据');
      console.log(`   - 总数: ${newsData.total || 0}`);
      console.log(`   - 展示: ${newsData.data?.length || 0} 条`);
      console.log(`   - 最后更新: ${newsData.lastUpdate || '未知'}`);
    } else {
      console.log('⚠️  暂无新闻数据（这是正常的，运行爬虫后会有数据）');
    }
    console.log('');

    // 测试 4: 清理测试数据
    console.log('🧹 测试 4: 清理测试数据...');
    await kv.del(testKey);
    console.log('✅ 清理完成\n');

    console.log('🎉 所有测试通过！Vercel KV 配置正确。\n');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('\n可能的原因:');
    console.error('1. Vercel KV 数据库未创建');
    console.error('2. 环境变量未配置');
    console.error('3. 数据库未连接到项目');
    console.error('\n请查看 VERCEL_KV_SETUP.md 获取配置指南。\n');
    process.exit(1);
  }
}

testKV();
