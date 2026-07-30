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

const WATCHER_ICON = `<path d="M8 2c3.236 0 6.204 1.841 8 4.719-.345.553-.74 1.07-1.18 1.545a.75.75 0 0 1-1.11-1.012 11.233 11.233 0 0 0 1.03-1.166C13.435 4.095 10.972 3.5 8 3.5s-5.435.595-6.74 2.586c.315.476.67 1.023 1.03 1.56a.75.75 0 1 1-1.255.82C.674 7.913.284 7.33.003 6.904a.75.75 0 0 1-.003-.385C1.796 3.841 4.764 2 8 2Zm0 2.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM7 7a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z"/>`;

const CLOCK_ICON = `<path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm7.25-4.75a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 .324.618l2.5 1.75a.75.75 0 1 0 .852-1.236L9 6.582V3.25Z"/>`;

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

function generateCard(repo, border = false, theme = 'light', showStats = true, width = 340, height = 112, rx = 6, showSize = false, showLicense = false, showIssues = false, customBg = '', customTitle = '', customText = '', showTopics = false, showWatchers = false, showUpdated = false, showBadges = false, showLangs = false, langsPercentage = false, index = 0) {
  const safeWidth = Math.min(Math.max(width || 340, 200), 1000);
  const safeHeight = Math.min(Math.max(height || 112, 70), 500);
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
    watchers_count,
    updated_at,
    topics,
    archived,
    fork,
    is_template,
    languages,
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

  // Dynamic Badges (Archived, Fork, Template) next to Title
  let badgeElements = '';
  let badgeWidthTotal = 0;
  if (showBadges) {
    const badgesToRender = [];
    if (archived) badgesToRender.push({ text: 'Archived', fill: '#fff8ec', textFill: '#9a6700', border: '#ffe1b5', darkFill: 'rgba(154,103,0,0.15)', darkTextFill: '#f1e05a' });
    if (is_template) badgesToRender.push({ text: 'Template', fill: '#ddf4ff', textFill: '#0969da', border: '#b4e0ff', darkFill: 'rgba(56,139,253,0.15)', darkTextFill: '#58a6ff' });
    else if (fork) badgesToRender.push({ text: 'Fork', fill: '#f6f8fa', textFill: '#57606a', border: '#d0d7de', darkFill: 'rgba(110,118,129,0.15)', darkTextFill: '#8b949e' });

    badgesToRender.forEach((b) => {
      const isDark = theme === 'dark' || theme === 'black' || theme === 'transparent';
      const bg = isDark ? b.darkFill : b.fill;
      const fg = isDark ? b.darkTextFill : b.textFill;
      const bColor = isDark ? 'rgba(255,255,255,0.15)' : b.border;
      const textLen = b.text.length * 6 + 12;
      badgeElements += `
        <g transform="translate(${safeWidth - PADDING - badgeWidthTotal - textLen}, 18)">
          <rect width="${textLen}" height="18" rx="9" fill="${bg}" stroke="${bColor}" stroke-width="1"/>
          <text x="${textLen / 2}" y="13" fill="${fg}" font-size="9" font-weight="600" text-anchor="middle" font-family="${escapeXml(FONT_FAMILY)}">${b.text}</text>
        </g>
      `;
      badgeWidthTotal += textLen + 6;
    });
  }

  // Calculate remaining space for title
  const titleAvailableWidth = safeWidth - PADDING * 2 - 22 - badgeWidthTotal;
  const titleMaxLen = Math.max(10, Math.floor(titleAvailableWidth / 7.5));
  const name = truncateText(cleanFullName, titleMaxLen);

  const href = escapeXml(html_url || '#');
  const title = escapeXml(cleanFullName || 'GitHub repository');
  const cardContent = escapeXml(`${cleanFullName}${cleanDescription ? `: ${cleanDescription}` : ''}`);

  // Dynamic height layouts. Compute metadata height at bottom.
  // 1 row of metadata at the bottom. But we can have a flow wrap if it's too cramped.
  // Let's layout the bottom elements nicely.
  const items = [];
  // If showLangs is enabled, we display languages bar instead of single language dot at bottom left.
  if (language && !showLangs) {
    items.push({ type: 'lang', label: language, color: langColor });
  }
  if (showStats) {
    items.push({ type: 'icon', icon: STAR_ICON, label: stargazers_count });
    items.push({ type: 'icon', icon: FORK_ICON, label: forks_count });
  }
  if (showWatchers && watchers_count) {
    items.push({ type: 'icon', icon: WATCHER_ICON, label: watchers_count });
  }
  if (showSize && size) {
    items.push({ type: 'icon', icon: SIZE_ICON, label: size });
  }
  if (showLicense && license) {
    items.push({ type: 'icon', icon: LICENSE_ICON, label: license });
  }
  if (showIssues && open_issues_count) {
    items.push({ type: 'icon', icon: ISSUE_ICON, label: open_issues_count });
  }
  if (showUpdated && updated_at) {
    items.push({ type: 'icon', icon: CLOCK_ICON, label: `Updated ${updated_at}` });
  }

  // Measure and partition metadata items into rows of bottom metadata
  let currentY = safeHeight - 16;
  const metadataRows = [];
  let currentRow = [];
  let currentWidth = PADDING;

  items.forEach((item) => {
    const itemWidth = item.type === 'lang'
      ? 18 + estimateTextWidth(item.label)
      : 18 + estimateTextWidth(item.label);
    if (currentRow.length > 0 && currentWidth + itemWidth + 16 > safeWidth - PADDING) {
      metadataRows.unshift(currentRow);
      currentRow = [];
      currentWidth = PADDING;
    }
    currentRow.push({ ...item, width: itemWidth });
    currentWidth += itemWidth + 16;
  });
  if (currentRow.length > 0) {
    metadataRows.unshift(currentRow);
  }

  // Draw metadata rows starting from bottom up
  let metadataPart = '';
  let metaRowY = safeHeight - 16;
  metadataRows.forEach((row) => {
    let cursor = PADDING;
    row.forEach((item) => {
      if (item.type === 'lang') {
        metadataPart += `
          <circle cx="${cursor + 6}" cy="${metaRowY - 4}" r="5" fill="${item.color}"/>
          <text x="${cursor + 18}" y="${metaRowY}" fill="${themeColors.text}" font-size="12" font-family="${escapeXml(FONT_FAMILY)}">${escapeXml(item.label)}</text>
        `;
      } else {
        metadataPart += `
          <g transform="translate(${cursor}, ${metaRowY - 12})" fill="${themeColors.icon}">
            ${item.icon}
          </g>
          <text x="${cursor + 18}" y="${metaRowY}" fill="${themeColors.text}" font-size="12" font-family="${escapeXml(FONT_FAMILY)}">${escapeXml(item.label)}</text>
        `;
      }
      cursor += item.width + 16;
    });
    metaRowY -= 20;
  });

  // Calculate space occupied by Languages track
  let langsTrackPart = '';
  let langsTrackHeight = 0;

  if (showLangs && languages && Object.keys(languages).length > 0) {
    // Process languages and calculate percentages
    const totalBytes = Object.values(languages).reduce((sum, val) => sum + val, 0);
    const sortedLangs = Object.entries(languages)
      .map(([name, bytes]) => ({
        name,
        bytes,
        percentage: totalBytes > 0 ? (bytes / totalBytes) * 100 : 0,
        color: getLanguageColor(name)
      }))
      .sort((a, b) => b.bytes - a.bytes);

    // Filter top 5 languages, group other as 'Other'
    let topLangs = sortedLangs.slice(0, 5);
    const otherBytes = sortedLangs.slice(5).reduce((sum, item) => sum + item.bytes, 0);
    if (otherBytes > 0 && sortedLangs.length > 5) {
      topLangs.push({
        name: 'Other',
        bytes: otherBytes,
        percentage: (otherBytes / totalBytes) * 100,
        color: '#8b949e' // Neutral grey
      });
    }

    // Build the horizontal bar using clip path for perfectly rounded corners without overlaps
    const clipId = `bar-clip-${index}`;
    const barWidth = safeWidth - PADDING * 2;
    const barHeight = 8;
    const barY = metaRowY - 22; // Draw just above metadata rows

    let currentOffset = PADDING; // Start aligning perfectly with clipPath start boundary
    let barSegments = '';
    topLangs.forEach((lang) => {
      const segmentWidth = (lang.percentage / 100) * barWidth;
      if (segmentWidth > 0.1) {
        barSegments += `<rect x="${currentOffset}" y="${barY}" width="${segmentWidth}" height="${barHeight}" fill="${lang.color}"/>`;
        currentOffset += segmentWidth;
      }
    });

    const langsBarSvg = `
      <defs>
        <clipPath id="${clipId}">
          <rect x="${PADDING}" y="${barY}" width="${barWidth}" height="${barHeight}" rx="4"/>
        </clipPath>
      </defs>
      <g clip-path="url(#${clipId})">
        ${barSegments}
      </g>
    `;

    // Render language labels below the bar (with dot and optional percentages)
    // Label wrapping to fit multiple rows if needed
    let labelRows = [];
    let currentLabelRow = [];
    let currentLabelWidth = PADDING;
    const labelYOffset = barY + 22; // 22px below the bar start

    topLangs.forEach((lang) => {
      const displayPercentage = langsPercentage ? ` ${lang.percentage.toFixed(2)}%` : '';
      const textLabel = `${lang.name}${displayPercentage}`;
      const itemWidth = 12 + estimateTextWidth(textLabel, 11) + 14; // Dot, spacing, margin

      if (currentLabelRow.length > 0 && currentLabelWidth + itemWidth > safeWidth - PADDING) {
        labelRows.push(currentLabelRow);
        currentLabelRow = [];
        currentLabelWidth = PADDING;
      }
      currentLabelRow.push({ lang, label: textLabel, width: itemWidth });
      currentLabelWidth += itemWidth;
    });
    if (currentLabelRow.length > 0) {
      labelRows.push(currentLabelRow);
    }

    let labelsSvg = '';
    let currentLabelY = labelYOffset;
    labelRows.forEach((row) => {
      let cursorX = PADDING;
      row.forEach((item) => {
        labelsSvg += `
          <circle cx="${cursorX + 5}" cy="${currentLabelY - 4}" r="4" fill="${item.lang.color}"/>
          <text x="${cursorX + 14}" y="${currentLabelY}" fill="${themeColors.text}" font-size="11" font-family="${escapeXml(FONT_FAMILY)}">${escapeXml(item.label)}</text>
        `;
        cursorX += item.width;
      });
      currentLabelY += 16;
    });

    langsTrackPart = `
      ${langsBarSvg}
      ${labelsSvg}
    `;

    // Dynamic height calculation bottom-up
    const totalLabelHeight = labelRows.length * 16;
    langsTrackHeight = 8 + 8 + totalLabelHeight; // bar height + spacing + rows height
    metaRowY -= langsTrackHeight;
  }

  // Calculate space for description & topics
  const contentTop = 52;
  const contentBottom = metaRowY + 4;
  const availableContentHeight = contentBottom - contentTop;

  // Render optional Topics / Tags
  let topicsPart = '';
  if (showTopics && topics && topics.length > 0) {
    const isDark = theme === 'dark' || theme === 'black' || theme === 'transparent';
    const tagBg = isDark ? 'rgba(56,139,253,0.15)' : '#ddf4ff';
    const tagFg = isDark ? '#58a6ff' : '#0969da';

    let topicX = PADDING;
    let topicY = contentBottom - 16;
    let topicsRenderedCount = 0;

    topics.forEach((topic) => {
      const label = escapeXml(topic);
      const textWidth = estimateTextWidth(label, 10);
      const tagWidth = textWidth + 12;

      if (topicX + tagWidth <= safeWidth - PADDING) {
        topicsPart += `
          <g transform="translate(${topicX}, ${topicY - 10})">
            <rect width="${tagWidth}" height="16" rx="8" fill="${tagBg}"/>
            <text x="${tagWidth / 2}" y="11" fill="${tagFg}" font-size="10" font-weight="500" text-anchor="middle" font-family="${escapeXml(FONT_FAMILY)}">${label}</text>
          </g>
        `;
        topicX += tagWidth + 6;
        topicsRenderedCount++;
      }
    });

    if (topicsRenderedCount > 0) {
      // Shift content bottom up slightly since topics took 22px
      metaRowY -= 22;
    }
  }

  // Now calculate description lines in the remaining space
  const descMaxLen = Math.max(15, Math.floor((safeWidth - PADDING * 2) / 7.2));
  const descSpaceHeight = (showTopics && topics && topics.length > 0) ? (availableContentHeight - 24) : availableContentHeight;
  const maxLines = Math.max(0, Math.floor(descSpaceHeight / 16));
  const descLines = wrapDescription(cleanDescription, descMaxLen, maxLines);

  const descPart = descLines.length > 0
    ? descLines.map((line, i) =>
        `<text x="${PADDING}" y="${57 + i * 16}" fill="${themeColors.text}" font-size="12" font-family="${escapeXml(FONT_FAMILY)}">${escapeXml(line)}</text>`
      ).join('')
    : '';

  const borderBar = border
    ? `<rect x="1" y="1" width="5" height="${safeHeight - 2}" rx="2" fill="${langColor || themeColors.stroke}"/>`
    : '';

  // Gradient support check
  let gradientDef = '';
  let finalBg = themeColors.bg;
  if (customBg && (customBg.startsWith('linear-gradient') || customBg.startsWith('gradient'))) {
    const stopsMatch = customBg.match(/#[0-9a-fA-F]{3,8}/g);
    if (stopsMatch && stopsMatch.length >= 2) {
      const stopsDef = stopsMatch.map((stop, sIndex) => `<stop offset="${(sIndex / (stopsMatch.length - 1)) * 100}%" stop-color="${stop}" />`).join('\n');
      gradientDef = `
      <defs>
        <linearGradient id="customGrad-${index}" x1="0%" y1="0%" x2="100%" y2="100%">
          ${stopsDef}
        </linearGradient>
      </defs>`;
      finalBg = `url(#customGrad-${index})`;
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
      ${badgeElements}
      ${descPart}
      ${topicsPart}
      ${langsTrackPart}
      ${metadataPart}
    </a>
  </g>
`;
}

export function generateSingleSVG(repo, border = false, theme = 'light', showStats = true, width = 340, height = 112, rx = 6, showSize = false, showLicense = false, showIssues = false, customBg = '', customTitle = '', customText = '', showTopics = false, showWatchers = false, showUpdated = false, showBadges = false, showLangs = false, langsPercentage = false) {
  const safeWidth = Math.min(Math.max(width || 340, 200), 1000);
  const safeHeight = Math.min(Math.max(height || 112, 70), 500);
  const title = escapeXml(repo.full_name || 'GitHub repository');
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${safeWidth}" height="${safeHeight}" viewBox="0 0 ${safeWidth} ${safeHeight}" role="img" aria-label="${title}">
  ${generateCard(repo, border, theme, showStats, safeWidth, safeHeight, rx, showSize, showLicense, showIssues, customBg, customTitle, customText, showTopics, showWatchers, showUpdated, showBadges, showLangs, langsPercentage, 0)}
</svg>`;
}

export function generateGridSVG(repos, cols = 2, border = false, theme = 'light', showStats = true, width = 340, height = 112, rx = 6, showSize = false, showLicense = false, showIssues = false, customBg = '', customTitle = '', customText = '', showTopics = false, showWatchers = false, showUpdated = false, showBadges = false, showLangs = false, langsPercentage = false) {
  const safeWidth = Math.min(Math.max(width || 340, 200), 1000);
  const safeHeight = Math.min(Math.max(height || 112, 70), 500);

  if (repos.length === 0) {
    return generateErrorSVG('No repositories to display.');
  }
  if (repos.length === 1) {
    return generateSingleSVG(repos[0], border, theme, showStats, safeWidth, safeHeight, rx, showSize, showLicense, showIssues, customBg, customTitle, customText, showTopics, showWatchers, showUpdated, showBadges, showLangs, langsPercentage);
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
  ${generateCard(repo, border, theme, showStats, safeWidth, safeHeight, rx, showSize, showLicense, showIssues, customBg, customTitle, customText, showTopics, showWatchers, showUpdated, showBadges, showLangs, langsPercentage, i)}
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
