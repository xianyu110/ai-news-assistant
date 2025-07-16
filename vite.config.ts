import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// 复制数据文件到构建产物
function copyDataFiles() {
  return {
    name: 'copy-data-files',
    writeBundle() {
      const srcDataDir = join(process.cwd(), 'src/data');
      const distDataDir = join(process.cwd(), 'dist/build/h5/static/data');
      
      if (!existsSync(distDataDir)) {
        mkdirSync(distDataDir, { recursive: true });
      }
      
      // 复制关键数据文件
      const files = ['ai-news.json', 'all-news.json'];
      files.forEach(file => {
        const srcFile = join(srcDataDir, file);
        const distFile = join(distDataDir, file);
        if (existsSync(srcFile)) {
          copyFileSync(srcFile, distFile);
          console.log(`✅ 复制数据文件: ${file}`);
        }
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni(), copyDataFiles()],
  base: '/', // 使用相对路径，适用于各种部署环境
  build: {
    outDir: 'dist/build/h5',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
});
