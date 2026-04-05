export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  res.status(200).json({
    message: 'Auth API is working',
    timestamp: new Date().toISOString(),
    note: 'Database connection not configured yet'
  });
}