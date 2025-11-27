import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const data = await kv.get('news:latest');
    
    if (data) {
      console.log(`✅ Serving ${data.data?.length || 0} news items from Vercel KV`);
      return res.status(200).json(data);
    } else {
      console.warn(`❌ 'news:latest' key not found in Vercel KV`);
      return res.status(404).json({ error: 'Data not found' });
    }
  } catch (error) {
    console.error('❌ Error reading data from Vercel KV:', error);
    return res.status(500).json({ 
      error: 'Error reading data from Vercel KV', 
      message: error.message 
    });
  }
}
