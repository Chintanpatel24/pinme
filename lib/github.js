const GITHUB_API = 'https://api.github.com';

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

export async function getRepoData(fullName) {
  const [user, repo] = fullName.split('/');
  if (!user || !repo) {
    throw new Error(`Invalid repo format: "${fullName}". Use "owner/repo".`);
  }

  const token = process.env.GITHUB_TOKEN;
  let headers = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'pinme/1.0',
  };

  let res = await fetch(`${GITHUB_API}/repos/${user}/${repo}`, {
    headers: headers,
    next: { revalidate: 3600 },
  });

  // If rate limited (403) and a token is available, retry with authentication
  if (res.status === 403 && token) {
    headers.Authorization = `Bearer ${token}`;
    res = await fetch(`${GITHUB_API}/repos/${user}/${repo}`, {
      headers: headers,
      next: { revalidate: 3600 },
    });
  }

  if (res.status === 404) {
    throw new Error(`Repository "${fullName}" not found.`);
  }
  if (res.status === 403 && !token) {
    throw new Error('GitHub API rate limit exceeded for unauthenticated requests. Add GITHUB_TOKEN to .env for higher limits, or try again later.');
  }
  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  return {
    name: data.name,
    full_name: data.full_name,
    description: data.description || '',
    language: data.language,
    stargazers_count: formatCount(data.stargazers_count),
    forks_count: formatCount(data.forks_count),
    html_url: data.html_url,
  };
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
