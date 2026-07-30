import { getRepoData, getMultipleRepos } from '../../../lib/github';
import { generateSingleSVG, generateGridSVG, generateErrorSVG } from '../../../lib/svg';

export const runtime = 'edge';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const user = searchParams.get('user');
  const repo = searchParams.get('repo');
  const repos = searchParams.get('repos');
  const border = searchParams.get('border') === 'true';
  const theme = searchParams.get('theme') || 'light';
  const showStats = searchParams.get('stats') !== 'false';
  const requestedCols = parseInt(searchParams.get('cols') || '2', 10);
  const cols = Number.isNaN(requestedCols) ? 2 : requestedCols;

  const widthVal = parseInt(searchParams.get('width') || '340', 10);
  const width = Number.isNaN(widthVal) ? 340 : widthVal;

  const showLangs = searchParams.get('show_langs') === 'true';
  const langsPercentage = searchParams.get('langs_percentage') === 'true';

  // Automatically increase height if languages track is shown and height is not explicitly custom.
  const defaultHeight = showLangs ? 140 : 112;
  const heightVal = parseInt(searchParams.get('height') || String(defaultHeight), 10);
  const height = Number.isNaN(heightVal) ? defaultHeight : heightVal;

  const rxVal = parseInt(searchParams.get('rx') || '6', 10);
  const rx = Number.isNaN(rxVal) ? 6 : rxVal;

  const showSize = searchParams.get('show_size') === 'true';
  const showLicense = searchParams.get('show_license') === 'true';
  const showIssues = searchParams.get('show_issues') === 'true';
  const showTopics = searchParams.get('show_topics') === 'true';
  const showWatchers = searchParams.get('show_watchers') === 'true';
  const showUpdated = searchParams.get('show_updated') === 'true';
  const showBadges = searchParams.get('show_badges') === 'true';

  const customBg = searchParams.get('custom_bg') || '';
  const customTitle = searchParams.get('custom_title') || '';
  const customText = searchParams.get('custom_text') || '';

  if (!user) {
    return new Response(generateErrorSVG('Missing "user" parameter. Usage: ?user=owner&repo=name'), {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=60, s-maxage=60',
      },
    });
  }

  try {
    if (repo) {
      const fullRepoName = repo.includes('/') ? repo : `${user}/${repo}`;
      const data = await getRepoData(fullRepoName, showLangs);
      const svg = generateSingleSVG(data, border, theme, showStats, width, height, rx, showSize, showLicense, showIssues, customBg, customTitle, customText, showTopics, showWatchers, showUpdated, showBadges, showLangs, langsPercentage);
      return new Response(svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=1800, s-maxage=1800, stale-while-revalidate=86400',
        },
      });
    }

    if (repos) {
      const repoList = repos
        .split(',')
        .map(r => r.trim())
        .filter(Boolean)
        .map(r => r.includes('/') ? r : `${user}/${r}`);
      if (repoList.length === 0) {
        return new Response(generateErrorSVG('No repos provided. Usage: ?user=owner&repos=repo1,repo2'), {
          headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=60, s-maxage=60',
          },
        });
      }
      if (repoList.length > 6) {
        return new Response(generateErrorSVG('Maximum 6 repos allowed.'), {
          headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=60, s-maxage=60',
          },
        });
      }

      const { repos: data } = await getMultipleRepos(repoList, showLangs);
      const svg = generateGridSVG(data.slice(0, 6), cols, border, theme, showStats, width, height, rx, showSize, showLicense, showIssues, customBg, customTitle, customText, showTopics, showWatchers, showUpdated, showBadges, showLangs, langsPercentage);
      return new Response(svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=1800, s-maxage=1800, stale-while-revalidate=86400',
        },
      });
    }

    return new Response(generateErrorSVG('Provide "repo" or "repos" parameter.'), {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=60, s-maxage=60',
      },
    });
  } catch (error) {
    return new Response(generateErrorSVG(error.message), {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=60, s-maxage=60',
      },
    });
  }
}
