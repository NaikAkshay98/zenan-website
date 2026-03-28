const { getJSON, putJSON, getSha, deleteFile } = require('../_github');

module.exports = async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).end();
  try {
    const { id } = req.query;
    const { data: manifest, sha: manifestSha } = await getJSON('images/gallery/manifest.json');
    const img = manifest.find(i => i.id === id);

    if (img) {
      const fileSha = await getSha(`images/gallery/${img.filename}`);
      if (fileSha) await deleteFile(`images/gallery/${img.filename}`, fileSha, `Delete gallery image: ${img.name}`);
    }

    await putJSON('images/gallery/manifest.json', manifest.filter(i => i.id !== id), 'Update gallery manifest', manifestSha);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
