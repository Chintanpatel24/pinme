import { getLanguageColor } from './languages';

const CARD_WIDTH = 340;
const CARD_HEIGHT = 112;
const CARD_GAP = 16;
const PADDING = 16;
const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Noto Sans, Helvetica, Arial, sans-serif';

const REPO_ICON = `<path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z" fill="#656d76"/>`;

const STAR_ICON = `<path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" fill="#656d76"/>`;

const FORK_ICON = `<path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 1.5 0Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z" fill="#656d76"/>`;

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function truncateText(text, maxLen) {
  if (text.length <= maxLen) return escapeXml(text);
  return escapeXml(text.slice(0, maxLen - 3)) + '...';
}

function wrapDescription(desc, maxLen) {
  if (!desc) return [];
  const lines = [];
  let remaining = desc;
  while (remaining.length > 0 && lines.length < 2) {
    if (remaining.length <= maxLen) {
      lines.push(remaining);
      break;
    }
    let breakPoint = remaining.lastIndexOf(' ', maxLen);
    if (breakPoint === -1 || breakPoint === 0) breakPoint = maxLen;
    lines.push(remaining.slice(0, breakPoint));
    remaining = remaining.slice(breakPoint).trim();
  }
  if (remaining.length > 0 && lines.length === 2) {
    if (lines[1].length + 3 <= maxLen) {
      lines[1] = lines[1] + '...';
    } else {
      lines[1] = lines[1].slice(0, maxLen - 3) + '...';
    }
  }
  return lines;
}

function generateCard(repo) {
  const {
    full_name,
    description,
    language,
    stargazers_count,
    forks_count,
    html_url,
  } = repo;

  const langColor = getLanguageColor(language);
  const descLines = wrapDescription(description, 40);
  const name = truncateText(full_name, 32);

  const descPart = descLines.length > 0
    ? descLines.map((line, i) =>
        `<text x="${PADDING}" y="${58 + i * 16}" fill="#656d76" font-size="12" font-family="${FONT_FAMILY}">${escapeXml(line)}</text>`
      ).join('')
    : '';

  const langDotY = descLines.length > 0 ? 87 : 72;
  const langTextY = langDotY + 5;
  const iconY = langDotY - 10;

  const languagePart = language
    ? `<circle cx="${PADDING}" cy="${langDotY}" r="6" fill="${langColor}"/>` +
      `<text x="${PADDING + 14}" y="${langTextY}" fill="#656d76" font-size="12" font-family="${FONT_FAMILY}">${escapeXml(language)}</text>`
    : '';

  let starX = language ? 110 : PADDING;
  let forkX = 210;

  return `
    <a href="${escapeXml(html_url)}" target="_top">
      <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" rx="6" fill="#ffffff" stroke="#d0d7de" stroke-width="1"/>
      <rect width="4" height="${CARD_HEIGHT}" fill="${langColor}" clip-path="url(#cardClip)"/>
      <g transform="translate(${PADDING}, 20)">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          ${REPO_ICON}
        </svg>
      </g>
      <text x="${PADDING + 22}" y="34" fill="#0969da" font-size="14" font-weight="600" font-family="${FONT_FAMILY}">${name}</text>
      ${descPart}
      ${languagePart}
      <g transform="translate(${starX}, ${iconY})">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          ${STAR_ICON}
        </svg>
      </g>
      <text x="${starX + 18}" y="${langTextY}" fill="#656d76" font-size="12" font-family="${FONT_FAMILY}">${escapeXml(stargazers_count)}</text>
      <g transform="translate(${forkX}, ${iconY})">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          ${FORK_ICON}
        </svg>
      </g>
      <text x="${forkX + 18}" y="${langTextY}" fill="#656d76" font-size="12" font-family="${FONT_FAMILY}">${escapeXml(forks_count)}</text>
    </a>`;
}

export function generateSingleSVG(repo) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" fill="none">
  <defs>
    <clipPath id="cardClip">
      <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" rx="6"/>
    </clipPath>
  </defs>
  ${generateCard(repo)}
</svg>`;
}

export function generateGridSVG(repos, cols = 3) {
  if (repos.length === 0) {
    return generateErrorSVG('No repositories to display.');
  }
  if (repos.length === 1) {
    return generateSingleSVG(repos[0]);
  }

  cols = Math.min(cols, repos.length, 6);
  const rows = Math.ceil(repos.length / cols);
  const totalWidth = cols * CARD_WIDTH + (cols - 1) * CARD_GAP;
  const totalHeight = rows * CARD_HEIGHT + (rows - 1) * CARD_GAP;

  const cards = repos.map((repo, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col * (CARD_WIDTH + CARD_GAP);
    const y = row * (CARD_HEIGHT + CARD_GAP);
    return `<g transform="translate(${x}, ${y})">
  ${generateCard(repo)}
</g>`;
  }).join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}" fill="none">
  <defs>
    <clipPath id="cardClip">
      <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" rx="6"/>
    </clipPath>
  </defs>
  ${cards}
</svg>`;
}

export function generateErrorSVG(message) {
  const lines = wrapDescription(message, 50);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="80" viewBox="0 0 400 80" fill="none">
  <defs>
    <clipPath id="cardClip">
      <rect width="400" height="80" rx="6"/>
    </clipPath>
  </defs>
  <rect width="400" height="80" rx="6" fill="#fff" stroke="#cf222e" stroke-width="1"/>
  <rect width="4" height="80" fill="#cf222e" clip-path="url(#cardClip)"/>
  <text x="20" y="30" fill="#cf222e" font-size="14" font-weight="600" font-family="${FONT_FAMILY}">Error</text>
  ${lines.map((line, i) =>
    `<text x="20" y="${52 + i * 16}" fill="#656d76" font-size="12" font-family="${FONT_FAMILY}">${escapeXml(line)}</text>`
  ).join('')}
</svg>`;
}
