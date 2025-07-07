/**
 * 格式化日期
 * @param date 日期对象或时间戳
 * @param format 格式化字符串，默认 'YYYY-MM-DD HH:mm:ss'
 */
export function formatDate(date: Date | number, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const seconds = d.getSeconds().toString().padStart(2, '0');

  return format
    .replace('YYYY', year.toString())
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 显示提示信息
 * @param title 提示标题
 * @param icon 图标类型
 * @param duration 显示时长
 */
export function showToast(title: string, icon: 'success' | 'error' | 'loading' | 'none' = 'none', duration: number = 2000) {
  uni.showToast({
    title,
    icon,
    duration
  });
}

/**
 * 显示加载中
 * @param title 加载提示文字
 */
export function showLoading(title: string = '加载中...') {
  uni.showLoading({
    title,
    mask: true
  });
}

/**
 * 隐藏加载中
 */
export function hideLoading() {
  uni.hideLoading();
}

/**
 * 页面跳转
 * @param url 页面路径
 * @param type 跳转类型
 */
export function navigateTo(url: string, type: 'navigateTo' | 'redirectTo' | 'switchTab' = 'navigateTo') {
  switch (type) {
    case 'navigateTo':
      uni.navigateTo({ url });
      break;
    case 'redirectTo':
      uni.redirectTo({ url });
      break;
    case 'switchTab':
      uni.switchTab({ url });
      break;
  }
}

/**
 * 获取系统信息
 */
export function getSystemInfo(): Promise<UniApp.GetSystemInfoResult> {
  return new Promise((resolve, reject) => {
    uni.getSystemInfo({
      success: resolve,
      fail: reject
    });
  });
}

/**
 * 深拷贝对象
 * @param obj 要拷贝的对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  if (typeof obj === 'object') {
    const cloned = {} as any;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  return obj;
} 