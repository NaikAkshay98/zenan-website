const OWNER  = process.env.GITHUB_OWNER;
const REPO   = process.env.GITHUB_REPO;
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const TOKEN  = process.env.GITHUB_TOKEN;
const BASE   = `https://api.github.com/repos/${OWNER}/${REPO}/contents`;

const HEADERS = {
  'Authorization': `Bearer ${TOKEN}`,
  'Accept': 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28'
};

// Read a JSON file from the repo. Returns { data, sha } or { data: [], sha: null } if not found.
async function getJSON(path) {
  const r = await fetch(`${BASE}/${path}?ref=${BRANCH}`, { headers: HEADERS });
  if (!r.ok) return { data: [], sha: null };
  const file = await r.json();
  const content = JSON.parse(Buffer.from(file.content, 'base64').toString('utf8'));
  return { data: content, sha: file.sha };
}

// Write a JSON file to the repo.
async function putJSON(path, data, message, sha) {
  const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
  const body = { message, content, branch: BRANCH };
  if (sha) body.sha = sha;
  const r = await fetch(`${BASE}/${path}`, {
    method: 'PUT',
    headers: { ...HEADERS, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return r.ok;
}

// Write a binary file (base64 encoded) to the repo.
async function putBinary(path, base64, message, sha) {
  const body = { message, content: base64, branch: BRANCH };
  if (sha) body.sha = sha;
  const r = await fetch(`${BASE}/${path}`, {
    method: 'PUT',
    headers: { ...HEADERS, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return r.ok;
}

// Get just the SHA of a file (to check if it exists).
async function getSha(path) {
  const r = await fetch(`${BASE}/${path}?ref=${BRANCH}`, { headers: HEADERS });
  if (!r.ok) return null;
  return (await r.json()).sha;
}

// Delete a file from the repo.
async function deleteFile(path, sha, message) {
  const r = await fetch(`${BASE}/${path}`, {
    method: 'DELETE',
    headers: { ...HEADERS, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sha, branch: BRANCH })
  });
  return r.ok;
}

module.exports = { getJSON, putJSON, putBinary, getSha, deleteFile };
