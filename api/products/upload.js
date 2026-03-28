const { putBinary, appendToManifest } = require('../_github');

const OWNER  = process.env.GITHUB_OWNER;
const REPO   = process.env.GITHUB_REPO;
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const RAW    = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}`;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { name, data } = req.body;
    if (!data) return res.status(400).json({ success: false, error: 'No image data' });

    const id       = Date.now().toString() + Math.random().toString(36).slice(2);
    const filename = id + '.jpg';
    const filePath = `images/products/${filename}`;

    await putBinary(filePath, data, `Add product image: ${name}`);

    const entry = {
      id, filename,
      name:       name || filename,
      src:        `${RAW}/${filePath}`,
      variants:   [{ id: id + '_v0', itemNumber: '', oz: '' }],
      categories: [],
      enabled:    true,
      uploadedAt: new Date().toISOString()
    };

    await appendToManifest('images/products/manifest.json', entry, 'Update products manifest');
    res.json({ success: true, image: entry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports.config = { api: { bodyParser: { sizeLimit: '10mb' } } };
