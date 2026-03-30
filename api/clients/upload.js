const { putBinary, getJSON, putJSON } = require('../_github');

const OWNER  = process.env.GITHUB_OWNER;
const REPO   = process.env.GITHUB_REPO;
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const RAW    = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}`;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { clientId, name, data, size, type } = req.body;
    if (!data || !clientId || !name) return res.status(400).json({ success: false, error: 'Missing fields' });

    const fileId  = Date.now().toString() + Math.random().toString(36).slice(2);
    const ext     = (name.match(/\.[^.]+$/) || [''])[0];
    const filePath = `files/clients/${clientId}/${fileId}${ext}`;
    const base64  = data.includes(',') ? data.split(',')[1] : data;

    await putBinary(filePath, base64, `Add client file: ${name}`);

    const fileEntry = { id: fileId, name, size: size || 0, type: type || '', src: `${RAW}/${filePath}`, addedAt: Date.now() };

    // Append file entry to client record in manifest
    const { data: clients, sha } = await getJSON('data/clients.json');
    const client = clients.find(c => c.id === clientId);
    if (client) {
      if (!client.files) client.files = [];
      client.files.push(fileEntry);
      await putJSON('data/clients.json', clients, 'Add client file', sha);
    }

    res.json({ success: true, file: fileEntry });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports.config = { api: { bodyParser: { sizeLimit: '25mb' } } };
