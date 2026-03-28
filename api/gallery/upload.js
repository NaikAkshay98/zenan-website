const { getJSON, putJSON, putBinary } = require('../_github');

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { name, category, data } = req.body;
    if (!data) return res.status(400).json({ success: false, error: 'No image data' });

    // Generate unique filename
    const id       = Date.now().toString() + Math.random().toString(36).slice(2);
    const filename = id + '.jpg';
    const filePath = `images/gallery/${filename}`;

    // Commit image file to GitHub
    await putBinary(filePath, data, `Add gallery image: ${name}`);

    // Update manifest
    const { data: manifest, sha } = await getJSON('images/gallery/manifest.json');
    const entry = {
      id,
      filename,
      name:       name || filename,
      src:        '/' + filePath,
      category:   category || 'glassware',
      uploadedAt: new Date().toISOString()
    };
    manifest.push(entry);
    await putJSON('images/gallery/manifest.json', manifest, `Update gallery manifest`, sha);

    res.json({ success: true, image: entry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
}
