const { getJSON } = require('../_github');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const { data } = await getJSON('images/products/manifest.json');
  res.json(data);
};
