# PinMe
> Under active devlopment

Generate SVG cards that look exactly like **GitHub pinned repositories** — with real-time data from the GitHub API. Embed them in your README to showcase your projects.

### Optional: columns

```
GET /api/pin?user=vercel&repos=next.js,turbo,hyper&cols=3
```

| Param | Default | Description |
|---|---|---|
| `cols` | `3` | Number of columns in the grid (1–6) |

## Card preview

Each card is **340 × 112px** and includes:

- Repository name (owner/repo, blue link)
- Description (up to 2 lines, truncated)
- Language dot with color
- Star count
- Fork count
- Clickable — opens the repo on GitHub

The layout and styling match GitHub's native pinned repos.

## Deploy your own instance

### Local development

```bash
git clone <your-repo>
cd pinme
npm install
npm run dev
```

Visit `http://localhost:3000` for the web UI.

### Environment variables (optional)

Copy `.env.example` to `.env.local` and add a GitHub token for higher rate limits:

```
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

Without a token, the GitHub API allows **60 requests per hour**. With a token, you get **5,000 requests per hour**. Create a token at https://github.com/settings/tokens (no scopes needed for public repos).

## Self-hosting notes

The project is a Next.js 14 app using the App Router. The API route runs on the Edge runtime for fast responses. All caching is handled via `Cache-Control` headers:

| Scenario | Cache duration |
|---|---|
| Successful response | 1 hour |
| Error response | 1 minute |

## Project structure

```
├── app/
│   ├── api/pin/route.js    # SVG generation endpoint
│   ├── page.js             # Interactive web UI
│   ├── layout.js           # Root layout
│   └── globals.css         # Styles
├── lib/
│   ├── github.js           # GitHub API client
│   ├── svg.js              # SVG rendering engine
│   └── languages.js        # 300+ language → color mappings
├── public/
├── .env.example            # Environment template
├── next.config.js
├── package.json
└── LICENSE
```
