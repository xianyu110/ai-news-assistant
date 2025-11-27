// 临时诊断端点 - 检查环境变量
export default function handler(req, res) {
  const envVars = {
    KV_URL: process.env.KV_URL ? '✅ 存在' : '❌ 不存在',
    KV_REST_API_URL: process.env.KV_REST_API_URL ? '✅ 存在' : '❌ 不存在',
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN ? '✅ 存在' : '❌ 不存在',
    KV_REST_API_READ_ONLY_TOKEN: process.env.KV_REST_API_READ_ONLY_TOKEN ? '✅ 存在' : '❌ 不存在',
    KV_REDIS_URL: process.env.KV_REDIS_URL ? '✅ 存在' : '❌ 不存在',
  };

  return res.json({
    message: '环境变量检查',
    variables: envVars,
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('KV') || key.includes('REDIS'))
  });
}
