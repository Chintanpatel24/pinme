# PinMe

Generate elegant SVG cards that look exactly like **GitHub pinned repositories** with real-time data from the GitHub API. Embed them in your README to showcase your projects with working repo links!

<div align="center">
  <img src="assets/pinme.png" width="350" alt="PinMe logo">
</div>

---

## Features

- **GitHub Pinned Look & Feel:** Perfect dimensions, typography, and theme modes (`light`, `dark`, `black`, `transparent`, and `transparent-light`).
- **Dynamic Languages Track:** Beautiful, horizontal progress-bar styled language distribution segmenting (top 5 languages with color dots + customizable percentages).
- **Advanced Customization:** Fully customize width, height, border radius, backgrounds, linear gradients, title colors, text/icon colors, and status metadata badges.
- **Ultra Scalable & Resilient:**
  - Cap-eviction safe in-memory caching to completely prevent memory leaks.
  - Comma-separated dynamic dynamic GitHub API token rotation & load balancing.
  - Stale-while-revalidate background updating with rate-limiting failover.
  - Multi-tier edge and client-side CDN caching.

---

## Direct Usage
- visit website to genrate yours - pinme
### Single Repository
```
GET /api/pin?user=owner&repo=repo_name
```

```html
<a href="https://github.com/owner/repo_name">
  <img src="https://your-domain.vercel.app/api/pin?user=owner&repo=repo_name" alt="Pinned Repo Card" />
</a>
```

### Multiple Repositories (Up to 6)
```
GET /api/pin?user=owner&repos=repo1,repo2,repo3&cols=3
```

---

## Customization Parameters

| Param | Default | Description |
|---|---|---|
| `user` | *Required* | The GitHub owner/username. |
| `repo` / `repos` | *Required* | Single repository name or comma-separated list of up to 6 repositories. |
| `cols` | `2` | Number of grid columns for multi-repo display (1-6). |
| `theme` | `light` | Theme to render: `light`, `dark`, `black`, `transparent`, or `transparent-light`. |
| `width` | `340` | Custom card width in pixels (min: 200, max: 1000). |
| `height` | `112` (`140` if `show_langs` active) | Custom card height in pixels (min: 70, max: 500). |
| `rx` | `6` | Custom card border radius in pixels (min: 0, max: 40). |
| `border` | `false` | Enable language-colored left vertical highlighted border strip. |
| `show_langs` | `false` | Enable a comprehensive visual horizontal languages track. |
| `langs_percentage` | `false` | Append numerical percentage values next to each track language label. |
| `stats` | `true` | Display counts for stars and forks. |
| `show_size` | `false` | Display total compiled repository size metadata. |
| `show_license` | `false` | Display SPDX license metadata info. |
| `show_issues` | `false` | Display open issues count metadata. |
| `show_watchers` | `false` | Display watcher/subscriber counts. |
| `show_topics` | `false` | Display repository topics / tags. |
| `show_updated` | `false` | Display last pushed or updated timestamp. |
| `show_badges` | `false` | Display dynamic status badges (e.g. `Archived`, `Template`, `Fork`). |
| `custom_bg` | `""` | Customize background color or linear-gradient stops (e.g. `linear-gradient(#000,#21262d)`). |
| `custom_title` | `""` | Custom HEX color for the repository link title. |
| `custom_text` | `""` | Custom HEX color for description text and icons. |

---

## Self-Hosting & Scalability

PinMe can be deployed on Vercel / Next.js Edge Runtime in single clicks.

### Dynamic Token Rotation
To multi-fold your rate limits (up to 5,000 requests/hour per token), PinMe rotates automatically over multiple API keys. Add them as a comma-separated list in your environment variables:

```env
GITHUB_TOKEN=ghp_firstToken,ghp_secondToken,ghp_thirdToken
```
