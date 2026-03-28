const { getJSON, putJSON } = require('../_github');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { sha } = await getJSON('data/categories.json');
    await putJSON('data/categories.json', req.body, 'Update categories', sha);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports.config = { api: { bodyParser: { sizeLimit: '1mb' } } };
