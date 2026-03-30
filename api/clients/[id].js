const { getJSON, putJSON, getSha, deleteFile } = require('../_github');

const OWNER  = process.env.GITHUB_OWNER;
const REPO   = process.env.GITHUB_REPO;
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const RAW    = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/`;

module.exports = async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).end();
  try {
    const { id } = req.query;
    const { data: clients, sha } = await getJSON('data/clients.json');
    const client = clients.find(c => c.id === id);

    // Delete all attached files from GitHub
    if (client?.files?.length) {
      for (const f of client.files) {
        if (f.src) {
          const filePath = f.src.replace(RAW, '');
          const fileSha = await getSha(filePath);
          if (fileSha) await deleteFile(filePath, fileSha, `Delete client file: ${f.name}`);
        }
      }
    }

    await putJSON('data/clients.json', clients.filter(c => c.id !== id), 'Delete client', sha);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
