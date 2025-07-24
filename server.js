import express from 'express'
import fs from 'fs'
import path from 'path'
import cors from 'cors'

const app = express()
const PORT = 3001

// Enable CORS for all routes
app.use(cors())
app.use(express.json())

// API endpoint to serve local news data
app.get('/api/local-news', (req, res) => {
  try {
    // Path to the original project's data file
    const dataPath = '/Users/chinamanor/Downloads/cursor编程/ai-news-assistant/src/data/ai-news.json'
    
    if (fs.existsSync(dataPath)) {
      const rawData = fs.readFileSync(dataPath, 'utf8')
      const data = JSON.parse(rawData)
      
      console.log(`✅ Serving ${data.data?.length || 0} news items from local data`)
      res.json(data)
    } else {
      console.warn('❌ Local data file not found')
      res.status(404).json({ error: 'Local data file not found' })
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

app.listen(PORT, () => {
  console.log(`🚀 Local news API server running on http://localhost:${PORT}`)
  console.log(`📰 News API available at http://localhost:${PORT}/api/local-news`)
})