const { getJSON, putJSON } = require('../_github');

export const config = { api: { bodyParser: { sizeLimit: '2mb' } } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { sha } = await getJSON('images/products/manifest.json');
    await putJSON('images/products/manifest.json', req.body, 'Update products manifest', sha);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
