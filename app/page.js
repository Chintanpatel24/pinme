'use client';

import { useState, useCallback } from 'react';

const API_BASE = typeof window !== 'undefined' ? window.location.origin : '';

function getRepoList(value) {
  return value.split(',').map(repo => repo.trim()).filter(Boolean).slice(0, 6);
}

function getCardUrl(user, repo, border, theme, showStats) {
  const params = new URLSearchParams({ user, repo });
  if (border) params.set('border', 'true');
  if (theme && theme !== 'light') params.set('theme', theme);
  if (!showStats) params.set('stats', 'false');
  return `${API_BASE}/api/pin?${params.toString()}`;
}

function getGridUrl(user, repos, border, theme, showStats) {
  const params = new URLSearchParams({ user });
  if (repos.length === 1) {
    params.set('repo', repos[0]);
  } else {
    params.set('repos', repos.join(','));
    params.set('cols', '2');
  }
  if (border) params.set('border', 'true');
  if (theme && theme !== 'light') params.set('theme', theme);
  if (!showStats) params.set('stats', 'false');
  return `${API_BASE}/api/pin?${params.toString()}`;
}

function getHtmlEmbed(user, repos, border, theme, showStats) {
  if (!user || repos.length === 0) return '';

  if (repos.length === 1) {
    const repo = repos[0];
    const fullHref = repo.includes('/') ? `https://github.com/${repo}` : `https://github.com/${user}/${repo}`;
    const altText = repo.includes('/') ? repo : `${user}/${repo}`;
    return `<a href="${fullHref}">
  <img src="${getCardUrl(user, repo, border, theme, showStats)}" alt="${altText}" />
</a>`;
  }

  const rows = [];
  for (let i = 0; i < repos.length; i += 2) {
    const cells = repos.slice(i, i + 2).map(repo => {
      const fullHref = repo.includes('/') ? `https://github.com/${repo}` : `https://github.com/${user}/${repo}`;
      const altText = repo.includes('/') ? repo : `${user}/${repo}`;
      return `    <td>
      <a href="${fullHref}">
        <img src="${getCardUrl(user, repo, border, theme, showStats)}" alt="${altText}" />
      </a>
    </td>`;
    });
    rows.push(`  <tr>
${cells.join('\n')}
  </tr>`);
  }

  return `<table>
${rows.join('\n')}
</table>`;
}

function getMarkdownEmbed(user, repos, border, theme, showStats) {
  if (!user || repos.length === 0) return '';

  const imageLink = repo => {
    const fullHref = repo.includes('/') ? `https://github.com/${repo}` : `https://github.com/${user}/${repo}`;
    const altText = repo.includes('/') ? repo : `${user}/${repo}`;
    return `[![${altText}](${getCardUrl(user, repo, border, theme, showStats)})](${fullHref})`;
  };
  if (repos.length === 1) return imageLink(repos[0]);

  const rows = [];
  for (let i = 0; i < repos.length; i += 2) {
    const left = imageLink(repos[i]);
    const right = repos[i + 1] ? imageLink(repos[i + 1]) : '';
    rows.push(`| ${left} | ${right} |`);
  }

  return `| | |
|---|---|
${rows.join('\n')}`;
}

export default function Home() {
  const [user, setUser] = useState('');
  const [repos, setRepos] = useState('');
  const [border, setBorder] = useState(false);
  const [theme, setTheme] = useState('light');
  const [showStats, setShowStats] = useState(true);
  const [generatedUser, setGeneratedUser] = useState('');
  const [generatedRepos, setGeneratedRepos] = useState('');
  const [generatedBorder, setGeneratedBorder] = useState(false);
  const [generatedTheme, setGeneratedTheme] = useState('light');
  const [generatedShowStats, setGeneratedShowStats] = useState(true);
  const [svgUrl, setSvgUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const trimmedUser = generatedUser.trim();
  const repoList = getRepoList(generatedRepos);
  const embedCode = getHtmlEmbed(trimmedUser, repoList, generatedBorder, generatedTheme, generatedShowStats);

  const generate = useCallback(async () => {
    const normalizedUser = user.trim();
    if (!normalizedUser) {
      setError('Enter a GitHub username.');
      return;
    }
    setLoading(true);
    setError('');
    setSvgUrl('');
    setCopied(false);

    const nextRepoList = getRepoList(repos);

    try {
      if (nextRepoList.length === 0) {
        setError('Enter at least one repository name.');
        setLoading(false);
        return;
      }
      const url = getGridUrl(normalizedUser, nextRepoList, border, theme, showStats);
      const res = await fetch(url);
      if (!res.ok) {
        setError('Failed to generate. Check the username and repo names.');
        return;
      }
      setSvgUrl(url);
      setGeneratedUser(normalizedUser);
      setGeneratedRepos(repos);
      setGeneratedBorder(border);
      setGeneratedTheme(theme);
      setGeneratedShowStats(showStats);
    } catch {
      setError('Network error. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  }, [user, repos, border, theme, showStats]);

  const copyEmbed = useCallback(async () => {
    if (!svgUrl || !embedCode) return;
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [svgUrl, embedCode]);

  const copyMarkdown = useCallback(async () => {
    if (!svgUrl) return;
    const embed = getMarkdownEmbed(
      generatedUser.trim(),
      getRepoList(generatedRepos),
      generatedBorder,
      generatedTheme,
      generatedShowStats
    );
    await navigator.clipboard.writeText(embed);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [svgUrl, generatedUser, generatedRepos, generatedBorder, generatedTheme, generatedShowStats]);

  return (
    <div className="container">
      <div className="header-section">
        <h1>PinMe</h1>
        <p className="subtitle">
          Generate elegant SVG cards of your pinned repositories with real-time GitHub data.
        </p>
      </div>

      <div className="card">
        <h2>Generate</h2>
        <div className="form-group">
          <label htmlFor="user">GitHub Username</label>
          <input
            id="user"
            type="text"
            value={user}
            onChange={e => setUser(e.target.value)}
            placeholder="vercel"
          />
        </div>
        <div className="form-group">
          <label htmlFor="repos">Repository Names (up to 6, comma-separated)</label>
          <input
            id="repos"
            type="text"
            value={repos}
            onChange={e => setRepos(e.target.value)}
            placeholder="next.js, turbo, hyper"
          />
          <div className="hint">Separate multiple repos with commas. Supports full paths like owner/repo. Max 6.</div>
        </div>
        <div className="form-group">
          <label>Card Style</label>
          <div className="style-options">
            <label>
              <input
                type="radio"
                name="border"
                checked={!border}
                onChange={() => setBorder(false)}
              />
              Standard (Clean GitHub Look)
            </label>
            <label>
              <input
                type="radio"
                name="border"
                checked={border}
                onChange={() => setBorder(true)}
              />
              Language Left Border (Color Highlights)
            </label>
          </div>
        </div>
        <div className="form-group">
          <label>Theme</label>
          <div className="style-options">
            <label>
              <input
                type="radio"
                name="theme"
                checked={theme === 'light'}
                onChange={() => setTheme('light')}
              />
              Light (Default)
            </label>
            <label>
              <input
                type="radio"
                name="theme"
                checked={theme === 'dark'}
                onChange={() => setTheme('dark')}
              />
              Dark (GitHub Style)
            </label>
            <label>
              <input
                type="radio"
                name="theme"
                checked={theme === 'black'}
                onChange={() => setTheme('black')}
              />
              Black (True Dark)
            </label>
            <label>
              <input
                type="radio"
                name="theme"
                checked={theme === 'transparent'}
                onChange={() => setTheme('transparent')}
              />
              Transparent (Dark Outline)
            </label>
          </div>
        </div>
        <div className="form-group">
          <label>Options</label>
          <div className="style-options">
            <label>
              <input
                type="checkbox"
                checked={showStats}
                onChange={e => setShowStats(e.target.checked)}
              />
              Show Stars and Forks
            </label>
          </div>
        </div>
        <button className="btn" onClick={generate} disabled={loading}>
          {loading ? 'Generating...' : 'Generate SVG'}
        </button>
        {error && <div className="error">{error}</div>}
      </div>

      {svgUrl && (
        <>
          <div className="card">
            <h2>Preview</h2>
            <div className="preview">
              <img src={svgUrl} alt="Generated pinned repos preview" />
            </div>
          </div>

          <div className="card">
            <h2>Embed</h2>
            <div className="embed-section">
              <p style={{ marginBottom: 8 }}>Copy this into your README:</p>
              <textarea readOnly value={embedCode} />
              <div className="btn-group">
                <button className="btn" onClick={copyEmbed}>
                  {copied ? 'Copied!' : 'Copy HTML Embed'}
                </button>
                <button className="btn-secondary" onClick={copyMarkdown}>
                  Copy Markdown
                </button>
              </div>
              <p style={{ marginTop: 12, fontSize: 12, color: '#656d76' }}>
                Each card is wrapped in a GitHub link so it stays clickable in README files.
              </p>
            </div>
          </div>

          <div className="card">
            <h2>Direct URL</h2>
            <pre>{svgUrl}</pre>
          </div>
        </>
      )}

      <div className="card">
        <h2>Usage</h2>
        <p><strong>Single repo:</strong></p>
        <pre>GET /api/pin?user=USER&repo=REPO</pre>
        <pre>{'<a href="https://github.com/USER/REPO">\n  <img src="https://your-domain.vercel.app/api/pin?user=USER&repo=REPO" />\n</a>'}</pre>

        <p style={{ marginTop: 16 }}><strong>Multiple repos (up to 6):</strong></p>
        <pre>GET /api/pin?user=USER&repos=REPO1,REPO2,REPO3</pre>
        <pre>{'<table>\n  <tr>\n    <td>\n      <a href="https://github.com/USER/REPO1">\n        <img src="https://your-domain.vercel.app/api/pin?user=USER&repo=REPO1" />\n      </a>\n    </td>\n    <td>\n      <a href="https://github.com/USER/REPO2">\n        <img src="https://your-domain.vercel.app/api/pin?user=USER&repo=REPO2" />\n      </a>\n    </td>\n  </tr>\n</table>'}</pre>

        <p style={{ marginTop: 16 }}><strong>Optional parameters:</strong></p>
        <ul>
          <li><code>cols</code> — number of columns (default: 2, max: 6)</li>
          <li><code>border</code> — enable left vertical colored border (<code>true</code>)</li>
          <li><code>theme</code> — <code>light</code>, <code>dark</code>, <code>black</code>, or <code>transparent</code></li>
          <li><code>stats</code> — show/hide stars and forks (set to <code>false</code> to hide, default <code>true</code>)</li>
        </ul>
        <pre>GET /api/pin?user=USER&repos=REPO1,REPO2,REPO3,REPO4&cols=2&theme=transparent&stats=false</pre>
      </div>

      <div className="footer">
        <p>
          Built with Next.js —{' '}
          <a href="https://github.com/your-username/pinme" target="_blank" rel="noopener noreferrer">Source</a>
        </p>
      </div>
    </div>
  );
}
