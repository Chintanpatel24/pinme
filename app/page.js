'use client';

import { useState, useCallback } from 'react';

const API_BASE = typeof window !== 'undefined' ? window.location.origin : '';

export default function Home() {
  const [user, setUser] = useState('');
  const [repos, setRepos] = useState('');
  const [svgUrl, setSvgUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = useCallback(async () => {
    if (!user.trim()) {
      setError('Enter a GitHub username.');
      return;
    }
    setLoading(true);
    setError('');
    setSvgUrl('');
    setCopied(false);

    const repoList = repos.split(',').map(r => r.trim()).filter(Boolean);

    try {
      const params = new URLSearchParams({ user: user.trim() });
      if (repoList.length > 0) {
        params.set('repos', repoList.join(','));
      } else {
        setError('Enter at least one repository name.');
        setLoading(false);
        return;
      }
      const url = `${API_BASE}/api/pin?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) {
        const text = await res.text();
        setError('Failed to generate. Check the username and repo names.');
        return;
      }
      setSvgUrl(url);
    } catch {
      setError('Network error. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  }, [user, repos]);

  const copyEmbed = useCallback(async () => {
    if (!svgUrl) return;
    const repoList = repos.split(',').map(r => r.trim()).filter(Boolean);
    if (repoList.length === 1) {
      const embed = `<a href="https://github.com/${user.trim()}/${repoList[0]}">
  <img src="${svgUrl}" alt="${user.trim()}/${repoList[0]}" />
</a>`;
      await navigator.clipboard.writeText(embed);
    } else {
      const embed = `<img src="${svgUrl}" alt="GitHub Pinned Repos" />`;
      await navigator.clipboard.writeText(embed);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [svgUrl, user, repos]);

  const copyMarkdown = useCallback(async () => {
    if (!svgUrl) return;
    const embed = `[![GitHub Pinned Repos](${svgUrl})](${svgUrl})`;
    await navigator.clipboard.writeText(embed);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [svgUrl]);

  return (
    <div className="container">
      <h1>PinMe</h1>
      <p className="subtitle">
        Generate GitHub pinned repo SVGs for your README.
      </p>

      <div className="card">
        <h2>Generate</h2>
        <div className="form-group">
          <label htmlFor="user">GitHub Username</label>
          <input
            id="user"
            type="text"
            value={user}
            onChange={e => setUser(e.target.value)}
            placeholder="e.g. octocat"
          />
        </div>
        <div className="form-group">
          <label htmlFor="repos">Repository Names (up to 6, comma-separated)</label>
          <input
            id="repos"
            type="text"
            value={repos}
            onChange={e => setRepos(e.target.value)}
            placeholder="e.g. hello-world, git-consortium, Spoon-Knife"
          />
          <div className="hint">Separate multiple repos with commas. Max 6.</div>
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
              <textarea readOnly value={`<img src="${svgUrl}" alt="GitHub Pinned Repos" />`} />
              <div className="btn-group">
                <button className="btn" onClick={copyEmbed}>
                  {copied ? 'Copied!' : 'Copy HTML Embed'}
                </button>
                <button className="btn-secondary" onClick={copyMarkdown}>
                  Copy Markdown
                </button>
              </div>
              <p style={{ marginTop: 12, fontSize: 12, color: '#656d76' }}>
                For single repos, the HTML embed wraps the image in a clickable link.
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
        <pre>{'<img src="https://your-domain.vercel.app/api/pin?user=USER&repos=REPO1,REPO2" />'}</pre>

        <p style={{ marginTop: 16 }}><strong>Optional parameters:</strong></p>
        <ul>
          <li><code>cols</code> — number of columns (default: 3, max: 6)</li>
        </ul>
        <pre>GET /api/pin?user=USER&repos=REPO1,REPO2,REPO3,REPO4&cols=2</pre>
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
