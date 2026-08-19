import { seedDatabase } from '../../lib/seedData.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { force = false } = req.body || {};
    const result = await seedDatabase(Boolean(force));
    return res.status(200).json(result);
  } catch (error) {
    console.error('Seed error:', error);
    return res.status(500).json({ message: 'Failed to seed database', error: error.message });
  }
}
