const { getJSON, putJSON } = require('../_github');

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    const { data } = await getJSON('data/clients.json');
    return res.json(data);
  }
  if (req.method === 'POST') {
    try {
      const { sha } = await getJSON('data/clients.json');
      await putJSON('data/clients.json', req.body, 'Update clients', sha);
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
  res.status(405).end();
};

module.exports.config = { api: { bodyParser: { sizeLimit: '2mb' } } };
