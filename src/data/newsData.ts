// AI快讯模拟数据
export interface NewsItem {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  source: string
  sourceUrl?: string
  publishTime: string
  imageUrl?: string
  summary: string
}

export const mockNewsData: NewsItem[] = [
  {
    id: '1',
    title: '通义网络智能体WebSailor开源，检索性能登顶开源榜单！',
    content: '阿里云通义实验室开源网络智能体WebSailor。智能体具备强大的推理和检索能力，在智能体评测集BrowseComp上超越DeepSeek R1、Grok-3等模型，登顶开源网络智能体榜单。WebSailor通过创新的post-training方法和强化学习算法DUPO，大幅提升了复杂网页推理任务的表现。',
    summary: '阿里云开源强大的网络智能体，在评测中击败多个知名模型',
    category: '开源项目',
    tags: ['AI模型', '开源', '智能体'],
    source: '阿里云',
    publishTime: new Date().toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400'
  },
  {
    id: '2',
    title: 'OpenAI发布GPT-4 Turbo最新版本，性能提升显著',
    content: 'OpenAI今日发布了GPT-4 Turbo的最新版本，相比之前版本在推理能力、代码生成和多语言理解方面都有显著提升。新版本还降低了API调用成本，并提高了响应速度。该更新将逐步向所有用户推出。',
    summary: 'GPT-4 Turbo新版本发布，性能全面提升，成本降低',
    category: '产品发布',
    tags: ['OpenAI', 'GPT-4', '大语言模型'],
    source: 'OpenAI',
    publishTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1676299081847-824916de030a?w=400'
  },
  {
    id: '3',
    title: 'Anthropic获得40亿美元投资，估值达180亿美元',
    content: 'AI安全公司Anthropic宣布完成由Google领投的40亿美元C轮融资，公司估值达到180亿美元。这笔资金将用于扩大Claude系列模型的研发，提升AI安全性研究，并扩展全球业务。Anthropic表示将继续专注于开发安全、有用、无害的AI系统。',
    summary: 'Anthropic获得巨额融资，专注AI安全研究',
    category: '投融资',
    tags: ['投融资', 'Anthropic', 'AI安全'],
    source: 'TechCrunch',
    publishTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400'
  },
  {
    id: '4',
    title: '谷歌发布最强量子芯片Willow，5分钟完成传统计算机需138亿年的任务',
    content: '谷歌量子AI团队发布了全新的量子芯片Willow，该芯片在量子纠错方面取得了重大突破。Willow芯片能够在5分钟内完成当今最强超级计算机需要138亿年才能完成的计算任务，标志着量子计算领域的一个重要里程碑。',
    summary: '谷歌量子芯片实现重大突破，计算能力指数级提升',
    category: '技术研究',
    tags: ['量子计算', '谷歌', '芯片技术'],
    source: '谷歌',
    publishTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400'
  },
  {
    id: '5',
    title: 'Meta发布Llama 3.3，700亿参数模型性能媲美4050亿参数版本',
    content: 'Meta AI发布了Llama 3.3 70B模型，这是一个经过优化的700亿参数版本，在多个基准测试中的表现可以媲美4050亿参数的Llama 3.1版本。新模型在保持高性能的同时大幅降低了计算资源需求，使更多开发者能够部署和使用。',
    summary: 'Meta发布高效版Llama模型，小参数实现大性能',
    category: '开源项目',
    tags: ['Meta', 'Llama', '开源模型'],
    source: 'Meta AI',
    publishTime: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1677756119517-756a188d2d94?w=400'
  },
  {
    id: '6',
    title: 'ByteDance推出视频生成模型PixelDance，支持高质量3D动画',
    content: '字节跳动发布了新的视频生成AI模型PixelDance，该模型能够生成高质量的3D动画视频，支持多种风格和场景。PixelDance在视频连贯性、物理真实感和艺术表现力方面都表现出色，已集成到豆包等产品中。',
    summary: '字节发布视频生成模型，3D动画能力出众',
    category: '产品发布',
    tags: ['字节跳动', '视频生成', 'AI模型'],
    source: '字节跳动',
    publishTime: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400'
  },
  {
    id: '7',
    title: 'AI芯片市场持续升温，英伟达H200需求激增',
    content: '据最新市场报告显示，AI芯片市场需求持续旺盛，英伟达的H200 GPU供不应求。多家云服务提供商和AI公司都在积极采购H200芯片来支持大模型训练和推理。预计2024年AI芯片市场规模将达到900亿美元。',
    summary: 'AI芯片市场火热，英伟达H200供不应求',
    category: '行业动态',
    tags: ['AI芯片', '英伟达', '市场趋势'],
    source: '市场研究公司',
    publishTime: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400'
  },
  {
    id: '8',
    title: 'Stability AI推出Stable Video 3D，从单张图片生成3D视频',
    content: 'Stability AI发布了Stable Video 3D模型，能够从单张静态图片生成高质量的3D视频内容。该模型采用了先进的3D重建技术和视频生成算法，生成的视频具有良好的空间一致性和时间连贯性。',
    summary: 'Stability AI发布3D视频生成模型，单图生成3D视频',
    category: '技术研究',
    tags: ['Stability AI', '3D视频', '图像生成'],
    source: 'Stability AI',
    publishTime: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400'
  }
]

export const categories = [
  '全部',
  '投融资',
  '开源项目', 
  '产品发布',
  '行业动态',
  '技术研究',
  '综合资讯'
]

export const popularTags = [
  'AI模型',
  '大语言模型',
  '开源',
  '投融资',
  '视频生成',
  '图像生成',
  '芯片技术',
  'OpenAI',
  '谷歌',
  'Meta'
] 