const { getJSON, putJSON } = require('../_github');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { sha } = await getJSON('data/clients.json');
    await putJSON('data/clients.json', req.body, 'Update clients', sha);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports.config = { api: { bodyParser: { sizeLimit: '2mb' } } };
