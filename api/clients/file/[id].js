const { getJSON, putJSON, getSha, deleteFile } = require('../../_github');

const OWNER  = process.env.GITHUB_OWNER;
const REPO   = process.env.GITHUB_REPO;
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const RAW    = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/`;

module.exports = async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).end();
  try {
    const { id: fileId } = req.query;
    const { data: clients, sha } = await getJSON('data/clients.json');

    let fileRecord = null;
    for (const c of clients) {
      const f = (c.files || []).find(f => f.id === fileId);
      if (f) { fileRecord = f; c.files = c.files.filter(f => f.id !== fileId); break; }
    }

    if (fileRecord?.src) {
      const filePath = fileRecord.src.replace(RAW, '');
      const fileSha = await getSha(filePath);
      if (fileSha) await deleteFile(filePath, fileSha, `Delete client file: ${fileRecord.name}`);
    }

    await putJSON('data/clients.json', clients, 'Remove client file', sha);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
