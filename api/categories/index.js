const { getJSON, putJSON, putBinary, appendToManifest } = require('../_github');

const OWNER  = process.env.GITHUB_OWNER;
const REPO   = process.env.GITHUB_REPO;
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const RAW    = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}`;

module.exports = async function handler(req, res) {
  const type = req.query.type;

  // ── Promotions: file upload
  if (req.method === 'POST' && type === 'promotions-upload') {
    try {
      const { title, data, fileType, ext } = req.body;
      if (!data) return res.status(400).json({ success: false, error: 'No file data' });
      const id = Date.now().toString() + Math.random().toString(36).slice(2);
      const filename = id + (ext || '.jpg');
      const filePath = `images/promotions/${filename}`;
      const base64 = data.includes(',') ? data.split(',')[1] : data;
      await putBinary(filePath, base64, `Add promotion: ${title || filename}`);
      const entry = { id, title: title || 'Promotion', fileType: fileType || 'image/jpeg', src: `${RAW}/${filePath}`, uploadedAt: new Date().toISOString() };
      await appendToManifest('data/promotions.json', entry, 'Update promotions');
      return res.json({ success: true, promo: entry });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // ── Promotions: list GET/POST
  if (type === 'promotions') {
    if (req.method === 'GET') {
      const { data } = await getJSON('data/promotions.json');
      return res.json(data);
    }
    if (req.method === 'POST') {
      try {
        const { sha } = await getJSON('data/promotions.json');
        await putJSON('data/promotions.json', req.body, 'Update promotions', sha);
        return res.json({ success: true });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    }
  }

  // ── Product categories (existing)
  if (req.method === 'GET') {
    const { data } = await getJSON('data/categories.json');
    return res.json(data);
  }
  if (req.method === 'POST') {
    try {
      const { sha } = await getJSON('data/categories.json');
      await putJSON('data/categories.json', req.body, 'Update categories', sha);
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  res.status(405).end();
};

module.exports.config = { api: { bodyParser: { sizeLimit: '15mb' } } };
