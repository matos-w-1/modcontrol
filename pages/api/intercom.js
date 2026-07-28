export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { shift_start, shift_end } = req.body

  try {
    const response = await fetch('https://api.intercom.io/conversations', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer dG9rOjUxNjYzN2FiXzg3MDJfNGZjOF9hYzQzXzRmOTZhN2NjYzRmNzoxOjA=',
        'Accept': 'application/json',
        'Intercom-Version': '2.11'
      }
    })

    const data = await response.json()
    const conversations = data.conversations || []

    // Filter by shift time
    const start = new Date(shift_start).getTime() / 1000
    const end   = new Date(shift_end).getTime() / 1000

    const filtered = conversations.filter(c => c.created_at >= start && c.created_at <= end)

    res.json({
      total: filtered.length,
      conversations: filtered
    })
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}