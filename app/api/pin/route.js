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
      const data = await getRepoData(fullRepoName);
      const svg = generateSingleSVG(data, border, theme, showStats);
      return new Response(svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
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

      const { repos: data } = await getMultipleRepos(repoList);
      const svg = generateGridSVG(data.slice(0, 6), cols, border, theme, showStats);
      return new Response(svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
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
