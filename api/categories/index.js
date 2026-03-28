const { getJSON } = require('../_github');

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const { data } = await getJSON('data/categories.json');
  res.json(data);
}
