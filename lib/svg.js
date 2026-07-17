import { getLanguageColor } from './languages';

export function stripEmojis(text) {
  if (typeof text !== 'string') return '';
  // Strip emojis safely using unicode property escapes
  return text.replace(/\p{Extended_Pictographic}/gu, '').replace(/\s+/g, ' ').trim();
}

const CARD_GAP = 12;
const PADDING = 16;
const FONT_FAMILY = '-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif';

const REPO_ICON = `<path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"/>`;

const STAR_ICON = `<path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/>`;

const FORK_ICON = `<path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 1.5 0Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"/>`;

const THEMES = {
  light: {
    bg: '#ffffff',
    stroke: '#d0d7de',
    title: '#0969da',
    text: '#656d76',
    icon: '#656d76'
  },
  dark: {
    bg: '#0d1117',
    stroke: '#30363d',
    title: '#58a6ff',
    text: '#8b949e',
    icon: '#8b949e'
  },
  black: {
    bg: '#000000',
    stroke: '#21262d',
    title: '#58a6ff',
    text: '#8b949e',
    icon: '#8b949e'
  },
  transparent: {
    bg: 'none',
    stroke: '#f0f6fc',
    title: '#58a6ff',
    text: '#c9d1d9',
    icon: '#8b949e'
  },
  'transparent-light': {
    bg: 'none',
    stroke: '#1f2328',
    title: '#0969da',
    text: '#57606a',
    icon: '#57606a'
  }
};

const LICENSE_ICON = `<path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm7.25-3.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM9 7.25a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0V8a.75.75 0 0 1 .75-.75Z"/>`;

const ISSUE_ICON = `<path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"/>`;

const SIZE_ICON = `<path d="M1.75 1a.75.75 0 0 0 0 1.5h12.5a.75.75 0 0 0 0-1.5H1.75Zm0 12a.75.75 0 0 0 0 1.5h12.5a.75.75 0 0 0 0-1.5H1.75ZM5.22 5.22a.75.75 0 0 0 0 1.06L6.94 8 5.22 9.72a.75.75 0 1 0 1.06 1.06l2.25-2.25a.75.75 0 0 0 0-1.06L6.28 5.22a.75.75 0 0 0-1.06 0Z"/>`;

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')   
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function estimateTextWidth(text, fontSize = 12) {
  return String(text || '').length * fontSize * 0.58;
}

function truncateText(text, maxLen) {
  text = String(text || '');
  if (text.length <= maxLen) return escapeXml(text);
  return escapeXml(text.slice(0, maxLen - 3)) + '...';
}

function wrapDescription(desc, maxLen, maxLines = 2) {
  if (!desc || maxLines <= 0) return [];
  const lines = [];
  let remaining = desc;
  while (remaining.length > 0 && lines.length < maxLines) {
    if (remaining.length <= maxLen) {
      lines.push(remaining);
      break;
    }
    let breakPoint = remaining.lastIndexOf(' ', maxLen);
    if (breakPoint === -1 || breakPoint === 0) breakPoint = maxLen;
    lines.push(remaining.slice(0, breakPoint));
    remaining = remaining.slice(breakPoint).trim();
  }
  if (remaining.length > 0 && lines.length === maxLines && maxLines > 0) {
    const lastLine = lines[maxLines - 1];
    if (lastLine.length + 3 <= maxLen) {
      lines[maxLines - 1] = lastLine + '...';
    } else {
      lines[maxLines - 1] = lastLine.slice(0, maxLen - 3) + '...';
    }
  }
  return lines;
}

function generateCard(repo, border = false, theme = 'light', showStats = true, width = 340, height = 112, rx = 6, showSize = false, showLicense = false, showIssues = false, customBg = '', customTitle = '', customText = '') {
  const safeWidth = Math.min(Math.max(width || 340, 200), 1000);
  const safeHeight = Math.min(Math.max(height || 112, 70), 400);
  const safeRx = Math.min(Math.max(rx !== undefined ? parseInt(rx, 10) : 6, 0), 40);

  const {
    full_name,
    description,
    language,
    stargazers_count,
    forks_count,
    html_url,
    size,
    license,
    open_issues_count,
  } = repo;

  const themeColors = { ...(THEMES[theme] || THEMES.light) };

  if (customBg) themeColors.bg = customBg;
  if (customTitle) themeColors.title = customTitle;
  if (customText) {
    themeColors.text = customText;
    themeColors.icon = customText;
  }

  const cleanFullName = stripEmojis(full_name || '');
  const cleanDescription = stripEmojis(description || '');

  const langColor = getLanguageColor(language);

  const descMaxLen = Math.max(15, Math.floor((safeWidth - PADDING * 2) / 7));
  const maxLines = Math.max(0, Math.floor((safeHeight - 68) / 16));
  const descLines = wrapDescription(cleanDescription, descMaxLen, maxLines);

  const titleMaxLen = Math.max(10, Math.floor((safeWidth - 60) / 7.5));
  const name = truncateText(cleanFullName, titleMaxLen);

  const href = escapeXml(html_url || '#');
  const title = escapeXml(cleanFullName || 'GitHub repository');
  const cardContent = escapeXml(`${cleanFullName}${cleanDescription ? `: ${cleanDescription}` : ''}`);

  const descPart = descLines.length > 0
    ? descLines.map((line, i) =>
        `<text x="${PADDING}" y="${57 + i * 16}" fill="${themeColors.text}" font-size="12" font-family="${escapeXml(FONT_FAMILY)}">${escapeXml(line)}</text>`
      ).join('')
    : '';

  const metaY = safeHeight - 16;
  const iconY = metaY - 12;
  let cursor = PADDING;

  let languagePart = '';
  if (language) {
    languagePart = `<circle cx="${cursor + 6}" cy="${metaY - 4}" r="6" fill="${langColor}"/>` +
      `<text x="${cursor + 18}" y="${metaY}" fill="${themeColors.text}" font-size="12" font-family="${escapeXml(FONT_FAMILY)}">${escapeXml(language)}</text>`;
    cursor += 18 + estimateTextWidth(language) + 16;
  }

  const starWidth = showStats ? (18 + estimateTextWidth(stargazers_count)) : 0;
  const forkWidth = showStats ? (18 + estimateTextWidth(forks_count)) : 0;
  const sizeWidth = (showSize && size) ? (18 + estimateTextWidth(size)) : 0;
  const licenseWidth = (showLicense && license) ? (18 + estimateTextWidth(license)) : 0;
  const issuesWidth = (showIssues && open_issues_count) ? (18 + estimateTextWidth(open_issues_count)) : 0;

  const totalRightWidth = starWidth + (starWidth ? 16 : 0) +
                          forkWidth + (forkWidth ? 16 : 0) +
                          sizeWidth + (sizeWidth ? 16 : 0) +
                          licenseWidth + (licenseWidth ? 16 : 0) +
                          issuesWidth;

  const maxRightStart = safeWidth - PADDING - totalRightWidth;
  let rightCursor = Math.max(cursor, maxRightStart);

  const starPart = showStats
    ? `<g transform="translate(${rightCursor}, ${iconY})" fill="${themeColors.icon}">
      ${STAR_ICON}
    </g>
    <text x="${rightCursor + 18}" y="${metaY}" fill="${themeColors.text}" font-size="12" font-family="${escapeXml(FONT_FAMILY)}">${escapeXml(stargazers_count)}</text>`
    : '';
  if (showStats) rightCursor += starWidth + 16;

  const forkPart = showStats
    ? `<g transform="translate(${rightCursor}, ${iconY})" fill="${themeColors.icon}">
      ${FORK_ICON}
    </g>
    <text x="${rightCursor + 18}" y="${metaY}" fill="${themeColors.text}" font-size="12" font-family="${escapeXml(FONT_FAMILY)}">${escapeXml(forks_count)}</text>`
    : '';
  if (showStats) rightCursor += forkWidth + 16;

  const sizePart = (showSize && size)
    ? `<g transform="translate(${rightCursor}, ${iconY})" fill="${themeColors.icon}">
      ${SIZE_ICON}
    </g>
    <text x="${rightCursor + 18}" y="${metaY}" fill="${themeColors.text}" font-size="12" font-family="${escapeXml(FONT_FAMILY)}">${escapeXml(size)}</text>`
    : '';
  if (showSize && size) rightCursor += sizeWidth + 16;

  const licensePart = (showLicense && license)
    ? `<g transform="translate(${rightCursor}, ${iconY})" fill="${themeColors.icon}">
      ${LICENSE_ICON}
    </g>
    <text x="${rightCursor + 18}" y="${metaY}" fill="${themeColors.text}" font-size="12" font-family="${escapeXml(FONT_FAMILY)}">${escapeXml(license)}</text>`
    : '';
  if (showLicense && license) rightCursor += licenseWidth + 16;

  const issuesPart = (showIssues && open_issues_count)
    ? `<g transform="translate(${rightCursor}, ${iconY})" fill="${themeColors.icon}">
      ${ISSUE_ICON}
    </g>
    <text x="${rightCursor + 18}" y="${metaY}" fill="${themeColors.text}" font-size="12" font-family="${escapeXml(FONT_FAMILY)}">${escapeXml(open_issues_count)}</text>`
    : '';

  const borderBar = border
    ? `<rect x="1" y="1" width="5" height="${safeHeight - 2}" rx="2" fill="${langColor}"/>`
    : '';

  // Gradient support check
  let gradientDef = '';
  let finalBg = themeColors.bg;
  if (customBg && (customBg.startsWith('linear-gradient') || customBg.startsWith('gradient'))) {
    const stopsMatch = customBg.match(/#[0-9a-fA-F]{3,8}/g);
    if (stopsMatch && stopsMatch.length >= 2) {
      gradientDef = `
      <defs>
        <linearGradient id="customGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${stopsMatch[0]}" />
          <stop offset="100%" stop-color="${stopsMatch[1]}" />
        </linearGradient>
      </defs>`;
      finalBg = 'url(#customGrad)';
    }
  }

  return `
  ${gradientDef}
  <style>
    .card-container {
      animation: fadeIn 0.4s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>
  <g class="card-container">
    <a href="${href}" xlink:href="${href}" target="_blank" rel="noopener noreferrer">
      <title>${title}</title>
      <desc>${cardContent}</desc>
      <rect width="${safeWidth}" height="${safeHeight}" rx="${safeRx}" fill="${finalBg}" stroke="${themeColors.stroke}" stroke-width="1"/>
      ${borderBar}
      <g transform="translate(${PADDING}, 21)" fill="${themeColors.icon}">
        ${REPO_ICON}
      </g>
      <text x="${PADDING + 22}" y="35" fill="${themeColors.title}" font-size="14" font-weight="600" font-family="${escapeXml(FONT_FAMILY)}">${name}</text>
      ${descPart}
      ${languagePart}
      ${starPart}
      ${forkPart}
      ${sizePart}
      ${licensePart}
      ${issuesPart}
    </a>
  </g>
`;
}

export function generateSingleSVG(repo, border = false, theme = 'light', showStats = true, width = 340, height = 112, rx = 6, showSize = false, showLicense = false, showIssues = false, customBg = '', customTitle = '', customText = '') {
  const safeWidth = Math.min(Math.max(width || 340, 200), 1000);
  const safeHeight = Math.min(Math.max(height || 112, 70), 400);
  const title = escapeXml(repo.full_name || 'GitHub repository');
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${safeWidth}" height="${safeHeight}" viewBox="0 0 ${safeWidth} ${safeHeight}" role="img" aria-label="${title}">
  ${generateCard(repo, border, theme, showStats, safeWidth, safeHeight, rx, showSize, showLicense, showIssues, customBg, customTitle, customText)}
</svg>`;
}

export function generateGridSVG(repos, cols = 2, border = false, theme = 'light', showStats = true, width = 340, height = 112, rx = 6, showSize = false, showLicense = false, showIssues = false, customBg = '', customTitle = '', customText = '') {
  const safeWidth = Math.min(Math.max(width || 340, 200), 1000);
  const safeHeight = Math.min(Math.max(height || 112, 70), 400);

  if (repos.length === 0) {
    return generateErrorSVG('No repositories to display.');
  }
  if (repos.length === 1) {
    return generateSingleSVG(repos[0], border, theme, showStats, safeWidth, safeHeight, rx, showSize, showLicense, showIssues, customBg, customTitle, customText);
  }

  cols = Math.min(Math.max(cols, 1), repos.length, 6);
  const rows = Math.ceil(repos.length / cols);
  const totalWidth = cols * safeWidth + (cols - 1) * CARD_GAP;
  const totalHeight = rows * safeHeight + (rows - 1) * CARD_GAP;

  const cards = repos.map((repo, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col * (safeWidth + CARD_GAP);
    const y = row * (safeHeight + CARD_GAP);
    return `<g transform="translate(${x}, ${y})">
  ${generateCard(repo, border, theme, showStats, safeWidth, safeHeight, rx, showSize, showLicense, showIssues, customBg, customTitle, customText)}
</g>`;
  }).join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}" role="img" aria-label="GitHub pinned repositories">
  ${cards}
</svg>`;
}

export function generateErrorSVG(message) {
  const cleanMessage = stripEmojis(message || '');
  const lines = wrapDescription(cleanMessage, 50);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="80" viewBox="0 0 400 80" role="img" aria-label="PinMe error">
  <rect width="400" height="80" rx="6" fill="#fff" stroke="#cf222e" stroke-width="1"/>
  <rect width="4" height="80" fill="#cf222e"/>
  <text x="20" y="30" fill="#cf222e" font-size="14" font-weight="600" font-family="${escapeXml(FONT_FAMILY)}">Error</text>
  ${lines.map((line, i) =>
    `<text x="20" y="${52 + i * 16}" fill="#656d76" font-size="12" font-family="${escapeXml(FONT_FAMILY)}">${escapeXml(line)}</text>`
  ).join('')}
</svg>`;
}
