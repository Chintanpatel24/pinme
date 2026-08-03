const GITHUB_API = 'https://api.github.com';

// Simple in-memory cache with size limit to prevent memory leaks
const cache = new Map();
const MAX_CACHE_SIZE = 1000;
const STALE_TTL = 24 * 60 * 60 * 1000; // 24 hours stale fallback window
const revalidationLocks = new Map();

let tokenIndex = 0;

// Global rate limit tracking variables
let globalRemaining = 60; // Default limit for unauthenticated requests
let globalLimit = 60;
let globalReset = 0;

function getRotatedToken() {
  const tokenEnv = process.env.GITHUB_TOKEN || '';
  if (!tokenEnv) return null;
  const tokens = tokenEnv.split(',').map(t => t.trim()).filter(Boolean);
  if (tokens.length === 0) return null;
  const token = tokens[tokenIndex % tokens.length];
  return token;
}

// Dynamically compute Cache TTL and Revalidation Cooldown based on remaining rate limits.
// If we have ample requests remaining (remaining > 5), we set extremely short cache times (5 seconds)
// so the card self-refreshes aggressively and automatically.
function getDynamicCacheTTL() {
  if (globalRemaining > 5) {
    return 5 * 1000; // 5 seconds
  }
  return 30 * 60 * 1000; // 30 minutes standard fallback
}

function getDynamicRevalidationCooldown() {
  if (globalRemaining > 5) {
    return 5 * 1000; // 5 seconds
  }
  return 15 * 60 * 1000; // 15 minutes standard fallback
}

async function fetchGitHub(url) {
  const tokenEnv = process.env.GITHUB_TOKEN || '';
  const tokens = tokenEnv.split(',').map(t => t.trim()).filter(Boolean);
  const maxAttempts = Math.max(1, tokens.length);
  let lastError = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const headers = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'pinme/1.0',
    };
    // Rotate tokens to load balance requests
    const token = tokens.length > 0 ? tokens[(tokenIndex + attempt) % tokens.length] : null;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const res = await fetch(url, {
        headers,
        next: { revalidate: 1800 }, // 30 minutes Edge/CDN caching
      });

      // Update global rate limit variables from headers
      const remainingHeader = res.headers.get('x-ratelimit-remaining');
      const limitHeader = res.headers.get('x-ratelimit-limit');
      const resetHeader = res.headers.get('x-ratelimit-reset');
      if (remainingHeader !== null) globalRemaining = parseInt(remainingHeader, 10);
      if (limitHeader !== null) globalLimit = parseInt(limitHeader, 10);
      if (resetHeader !== null) globalReset = parseInt(resetHeader, 10);

      if (res.status === 403 || res.status === 429) {
        lastError = new Error(`GitHub API rate limit exceeded (status ${res.status})`);
        continue; // Try next token
      }
      if (res.status === 404) {
        throw new Error('Not Found');
      }
      if (!res.ok) {
        throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
      }

      // Success, rotate token pointer for load balancing
      tokenIndex = (tokenIndex + 1) % Math.max(1, tokens.length);
      return res;
    } catch (err) {
      lastError = err;
      if (err.message === 'Not Found') {
        throw err;
      }
    }
  }
  throw lastError || new Error('Fetch failed');
}

function setInCache(key, value) {
  if (cache.size >= MAX_CACHE_SIZE && !cache.has(key)) {
    const firstKey = cache.keys().next().value;
    if (firstKey !== undefined) {
      cache.delete(firstKey);
    }
  }
  cache.set(key, value);
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

async function triggerBackgroundUpdate(fullName, fetchLangs) {
  const [user, repo] = fullName.split('/');
  const cacheKey = fullName.toLowerCase();

  try {
    const res = await fetchGitHub(`${GITHUB_API}/repos/${user}/${repo}`);
    const data = await res.json();

    let languages = null;
    if (fetchLangs) {
      try {
        const langRes = await fetchGitHub(`${GITHUB_API}/repos/${user}/${repo}/languages`);
        languages = await langRes.json();
      } catch {
        languages = {};
      }
    }

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
      languages: languages,
    };

    setInCache(cacheKey, {
      data: repoData,
      timestamp: Date.now()
    });
  } catch (err) {
    console.error(`Background update error for ${fullName}:`, err);
  }
}

export async function getRepoData(fullName, fetchLangs = false) {
  const [user, repo] = fullName.split('/');
  if (!user || !repo) {
    throw new Error(`Invalid repo format: "${fullName}". Use "owner/repo".`);
  }

  const cacheKey = fullName.toLowerCase();
  const cached = cache.get(cacheKey);

  const dynamicCacheTTL = getDynamicCacheTTL();
  const dynamicRevalidationCooldown = getDynamicRevalidationCooldown();

  // If we have a cached entry, and we either don't need fetchLangs OR we already have cached languages,
  // we can use it directly if it's fresh.
  if (cached && (Date.now() - cached.timestamp < dynamicCacheTTL)) {
    if (!fetchLangs || cached.data.languages) {
      return cached.data;
    }
  }

  // If stale but within fallback window, return stale immediately and update in background
  if (cached) {
    const isStale = Date.now() - cached.timestamp < STALE_TTL;
    const hasNeededLangs = !fetchLangs || cached.data.languages;

    if (isStale && hasNeededLangs) {
      const lastRevalidated = revalidationLocks.get(cacheKey);
      if (!lastRevalidated || (Date.now() - lastRevalidated > dynamicRevalidationCooldown)) {
        revalidationLocks.set(cacheKey, Date.now());
        triggerBackgroundUpdate(fullName, fetchLangs).catch(err => {
          console.error(`Background update initiation failed for ${fullName}:`, err);
        });
      }
      return cached.data;
    }
  }

  // Otherwise, perform fresh synchronous fetch
  try {
    const res = await fetchGitHub(`${GITHUB_API}/repos/${user}/${repo}`);
    const data = await res.json();

    let languages = null;
    if (fetchLangs) {
      try {
        const langRes = await fetchGitHub(`${GITHUB_API}/repos/${user}/${repo}/languages`);
        languages = await langRes.json();
      } catch {
        languages = {};
      }
    }

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
      languages: languages,
    };

    setInCache(cacheKey, {
      data: repoData,
      timestamp: Date.now()
    });

    return repoData;
  } catch (error) {
    if (cached) {
      console.warn(`Sync fetch failed for ${fullName}, falling back to stale cache.`);
      return cached.data;
    }

    // Graceful card fallback instead of throwing error and rendering red error blocks.
    // Creates a beautiful, fully styled SVG card detailing the fallback/error context.
    const errorMessage = error.message === 'Not Found'
      ? `Repository "${fullName}" not found.`
      : error.message;

    const fallbackRepoData = {
      name: repo,
      full_name: fullName,
      description: `Metadata currently unavailable (${errorMessage}). Please check again later or ensure the repo is public.`,
      language: 'Markdown',
      stargazers_count: '0',
      forks_count: '0',
      html_url: `https://github.com/${user}/${repo}`,
      size: '0 KB',
      license: '',
      open_issues_count: '0',
      watchers_count: '0',
      updated_at: '',
      topics: [],
      archived: false,
      fork: false,
      is_template: false,
      languages: {},
    };

    return fallbackRepoData;
  }
}

export async function getMultipleRepos(repos, fetchLangs = false) {
  const results = await Promise.allSettled(repos.map(r => getRepoData(r, fetchLangs)));
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
