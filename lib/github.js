const GITHUB_API = 'https://api.github.com';

// Simple in-memory cache for Edge runtime / serverless contexts
const cache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes in milliseconds

function getHeaders() {
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'pinme/1.0',
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

function formatCount(n) {
  if (n < 1000) return String(n);
  const k = n / 1000;
  if (k < 10) {
    return k.toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return Math.round(k) + 'k';
}

function formatSize(kb) {
  if (!kb) return '';
  if (kb < 1024) return `${kb} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1).replace(/\.0$/, '')} MB`;
}

function formatDate(dateString) {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  } catch {
    return '';
  }
}

export async function getRepoData(fullName) {
  const [user, repo] = fullName.split('/');
  if (!user || !repo) {
    throw new Error(`Invalid repo format: "${fullName}". Use "owner/repo".`);
  }

  const cacheKey = fullName.toLowerCase();
  const cached = cache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return cached.data;
  }

  const token = process.env.GITHUB_TOKEN;
  let headers = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'pinme/1.0',
  };

  let res = await fetch(`${GITHUB_API}/repos/${user}/${repo}`, {
    headers: headers,
    next: { revalidate: 1800 }, // 30 minutes CDN cache revalidate
  });

  // If rate limited (403) and a token is available, retry with authentication
  if (res.status === 403 && token) {
    headers.Authorization = `Bearer ${token}`;
    res = await fetch(`${GITHUB_API}/repos/${user}/${repo}`, {
      headers: headers,
      next: { revalidate: 1800 },
    });
  }

  if (res.status === 404) {
    throw new Error(`Repository "${fullName}" not found.`);
  }
  if (res.status === 403 && !token) {
    throw new Error('GitHub API rate limit exceeded. Try again later.');
  }
  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  const repoData = {
    name: data.name,
    full_name: data.full_name,
    description: data.description || '',
    language: data.language,
    stargazers_count: formatCount(data.stargazers_count),
    forks_count: formatCount(data.forks_count),
    html_url: data.html_url,
    size: formatSize(data.size),
    license: data.license ? (data.license.spdx_id || data.license.name) : '',
    open_issues_count: data.open_issues_count ? formatCount(data.open_issues_count) : '',
    watchers_count: formatCount(data.subscribers_count !== undefined ? data.subscribers_count : data.watchers_count || 0),
    updated_at: formatDate(data.pushed_at || data.updated_at),
    topics: Array.isArray(data.topics) ? data.topics : [],
    archived: !!data.archived,
    fork: !!data.fork,
    is_template: !!data.is_template,
  };

  cache.set(cacheKey, {
    data: repoData,
    timestamp: Date.now()
  });

  return repoData;
}

export async function getMultipleRepos(repos) {
  const results = await Promise.allSettled(repos.map(getRepoData));
  const successful = [];
  const errors = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      successful.push(result.value);
    } else {
      errors.push(result.reason.message);
    }
  }
  return { repos: successful, errors };
}
