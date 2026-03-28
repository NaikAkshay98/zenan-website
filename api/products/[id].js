const { getJSON, putJSON, getSha, deleteFile } = require('../_github');

module.exports = async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).end();
  try {
    const { id } = req.query;
    const { data: manifest, sha: manifestSha } = await getJSON('images/products/manifest.json');
    const img = manifest.find(i => i.id === id);

    if (img) {
      const fileSha = await getSha(`images/products/${img.filename}`);
      if (fileSha) await deleteFile(`images/products/${img.filename}`, fileSha, `Delete product image: ${img.name}`);
    }

    await putJSON('images/products/manifest.json', manifest.filter(i => i.id !== id), 'Update products manifest', manifestSha);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
