import express from 'express';
import cors from 'cors';
import { kv } from '@vercel/kv';

const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// API endpoint to serve news data from Vercel KV
app.get('/api/local-news', async (req, res) => {
  try {
    const data = await kv.get('news:latest');
    
    if (data) {
      console.log(`✅ Serving ${data.data?.length || 0} news items from Vercel KV`);
      res.json(data);
    } else {
      console.warn(`❌ 'news:latest' key not found in Vercel KV`);
      res.status(404).json({ error: 'Data not found' });
    }
  } catch (error) {
    console.error('❌ Error reading data from Vercel KV:', error);
    res.status(500).json({ error: 'Error reading data from Vercel KV', message: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Export the app for Vercel
export default app;
