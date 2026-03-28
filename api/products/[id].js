const { getJSON, putJSON, getSha, deleteFile } = require('../_github');

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).end();
  try {
    const { id } = req.query;
    const { data: manifest, sha: manifestSha } = await getJSON('images/products/manifest.json');
    const img = manifest.find(i => i.id === id);

    if (img) {
      const fileSha = await getSha(`images/products/${img.filename}`);
      if (fileSha) await deleteFile(`images/products/${img.filename}`, fileSha, `Delete product image: ${img.name}`);
    }

    const updated = manifest.filter(i => i.id !== id);
    await putJSON('images/products/manifest.json', updated, 'Update products manifest', manifestSha);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
