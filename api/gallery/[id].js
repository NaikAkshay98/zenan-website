const { getJSON, putJSON, getSha, deleteFile } = require('../_github');

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).end();
  try {
    const { id } = req.query;
    const { data: manifest, sha: manifestSha } = await getJSON('images/gallery/manifest.json');
    const img = manifest.find(i => i.id === id);

    if (img) {
      // Delete the actual image file from GitHub
      const fileSha = await getSha(`images/gallery/${img.filename}`);
      if (fileSha) await deleteFile(`images/gallery/${img.filename}`, fileSha, `Delete gallery image: ${img.name}`);
    }

    // Update manifest
    const updated = manifest.filter(i => i.id !== id);
    await putJSON('images/gallery/manifest.json', updated, 'Update gallery manifest', manifestSha);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
