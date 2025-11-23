import express from 'express'
import fs from 'fs'
import path from 'path'
import cors from 'cors'

const app = express()

// Enable CORS for all routes
app.use(cors())
app.use(express.json())

// API endpoint to serve local news data
app.get('/api/local-news', (req, res) => {
  try {
    // In a serverless environment, the current working directory is the root of the project.
    // The `public` directory will be at the root after the build process.
    const dataPath = path.join(process.cwd(), 'dist', 'mock-data', 'ai-news.json');
    
    // As a fallback for local dev, check the original path too
    const localDataPath = path.join(process.cwd(), 'public', 'mock-data', 'ai-news.json');

    let finalPath = dataPath;
    if (!fs.existsSync(finalPath)) {
      finalPath = localDataPath;
    }
    
    if (fs.existsSync(finalPath)) {
      const rawData = fs.readFileSync(finalPath, 'utf8')
      const data = JSON.parse(rawData)
      
      console.log(`✅ Serving ${data.data?.length || 0} news items from ${finalPath}`)
      res.json(data)
    } else {
      console.warn(`❌ Data file not found at ${dataPath} or ${localDataPath}`)
      res.status(404).json({ error: 'Data file not found' })
    }
  } catch (error) {
    console.error('❌ Error reading local data:', error)
    res.status(500).json({ error: 'Error reading local data', message: error.message })
  }
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Export the app for Vercel
export default app;
