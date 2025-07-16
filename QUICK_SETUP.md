# 📲 微信推送快速配置指南

## 🚀 1分钟完成配置

### 步骤1：获取Server酱密钥
1. 访问 [Server酱官网](https://sct.ftqq.com/)
2. 使用微信扫码登录
3. 复制您的推送密钥（类似 `SCT203875TfpJ2RVuzPBOMeLwACaLvVM9x`）

### 步骤2：配置GitHub Secret
1. 进入您的GitHub仓库
2. 点击 `Settings` → `Secrets and variables` → `Actions`
3. 点击 `New repository secret`
4. 添加密钥：
   - **Name**: `SERVERCHAN_KEY`
   - **Value**: 您的Server酱密钥

### 步骤3：测试推送
在本地运行测试命令：
```bash
npm run test-wechat-push YOUR_SERVERCHAN_KEY
```

**完成！** 现在每次数据更新都会自动发送微信推送 🎉

## 📱 推送效果

您将收到包含以下内容的微信推送：
- 📊 数据统计（总量、新增等）
- 🔥 **当天所有AI资讯**（不限数量）
- 📅 资讯发布日期
- 🔗 快速访问链接
- 📱 项目介绍

## 🛠️ 手动控制

### 禁用推送
在GitHub Actions手动触发时，可以选择禁用推送：
1. 进入 `Actions` → `Update AI News Data`
2. 点击 `Run workflow`
3. 将 `是否启用微信推送` 设置为 `false`

### 查看推送状态
在GitHub Actions的Summary中可以看到推送状态：
- ✅ 推送成功
- ❌ 推送失败
- ⚠️ 推送跳过

## 🔧 故障排除

### 推送失败？
1. 检查Server酱密钥是否正确
2. 确认微信已绑定Server酱账号
3. 查看GitHub Actions日志获取详细错误

### 没有收到推送？
1. 确认有数据更新（无更新不会推送）
2. 检查微信是否开启推送通知
3. 访问Server酱官网查看推送记录

### 测试推送
使用测试脚本验证配置：
```bash
node scripts/test-wechat-push.js YOUR_SERVERCHAN_KEY
```

## 📞 获取帮助

- 📖 完整文档：查看 [README.md](./README.md)
- 🐛 问题反馈：提交 [GitHub Issues](https://github.com/xianyu110/ai-news-assistant/issues)
- 💬 Server酱支持：访问 [Server酱官网](https://sct.ftqq.com/)

---

**享受AI资讯的及时推送！** 🚀 