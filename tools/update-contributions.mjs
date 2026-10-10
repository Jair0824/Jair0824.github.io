import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const toolsDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(toolsDirectory, '..');
const contentFile = path.join(projectRoot, 'content', 'site.json');
const outputFile = path.join(projectRoot, 'assets', 'github-contributions.svg');

const content = JSON.parse(await readFile(contentFile, 'utf8'));
if (content.githubContributions?.enabled === false) {
  console.log('GitHub contribution calendar is disabled');
  process.exit(0);
}

let username = String(content.githubContributions?.username || '').trim();

if (!username) {
  try {
    username = new URL(content.contact?.github || '').pathname.split('/').filter(Boolean)[0] || '';
  } catch {
    username = '';
  }
}

if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(username)) {
  throw new Error('A valid GitHub username is required to update the contribution calendar');
}

const to = new Date();
const from = new Date(to);
from.setUTCFullYear(from.getUTCFullYear() - 1);

const query = `
  query Contributions($login: String!, $from: DateTime!, $to: DateTime!) {
    viewer {
      login
    }
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              contributionLevel
              date
              weekday
            }
          }
        }
        hasAnyRestrictedContributions
        restrictedContributionsCount
      }
    }
  }
`;

const personalToken = String(process.env.PERSONAL_GITHUB_TOKEN || '').trim();
if (process.env.GITHUB_ACTIONS === 'true' && !personalToken) {
  throw new Error('PERSONAL_GITHUB_TOKEN is required in GitHub Actions to include private contributions');
}

const token = personalToken || String(process.env.GITHUB_TOKEN || '').trim();
if (!token) throw new Error('PERSONAL_GITHUB_TOKEN or GITHUB_TOKEN is required to update the contribution calendar');
const response = await fetch('https://api.github.com/graphql', {
  method: 'POST',
  headers: {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'User-Agent': 'garrylee-personal-website'
  },
  body: JSON.stringify({
    query,
    variables: { login: username, from: from.toISOString(), to: to.toISOString() }
  }),
  signal: AbortSignal.timeout(30_000)
});
const payload = await response.json().catch(() => null);
if (!response.ok) throw new Error(`GitHub API request failed with status ${response.status}`);

if (payload?.errors?.length) throw new Error(`GitHub API error: ${payload.errors.map((error) => error.message).join('; ')}`);

const collection = payload?.data?.user?.contributionsCollection;
const calendar = collection?.contributionCalendar;
if (!calendar || !Array.isArray(calendar.weeks)) throw new Error(`GitHub user ${username} was not found`);

const viewerLogin = String(payload?.data?.viewer?.login || '').trim();
if (personalToken && viewerLogin.toLowerCase() !== username.toLowerCase()) {
  throw new Error(`PERSONAL_GITHUB_TOKEN belongs to ${viewerLogin || 'an unknown account'}, not ${username}`);
}

const colors = {
  NONE: '#182429',
  FIRST_QUARTILE: '#164e42',
  SECOND_QUARTILE: '#1c735d',
  THIRD_QUARTILE: '#2e9e7c',
  FOURTH_QUARTILE: '#7ee2c0'
};
const cellSize = 11;
const gap = 3;
const pitch = cellSize + gap;
const left = 42;
const top = 24;
const weeks = calendar.weeks.slice(-53);
const width = left + weeks.length * pitch + 6;
const height = 143;
const monthFormatter = new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' });

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

const monthLabels = [];
let previousMonth = null;
let previousMonthX = -Infinity;
weeks.forEach((week, index) => {
  const date = new Date(`${week.contributionDays[0]?.date || ''}T00:00:00Z`);
  if (Number.isNaN(date.valueOf())) return;
  const month = date.getUTCMonth();
  const x = left + index * pitch;
  if (month !== previousMonth && x - previousMonthX >= 32) {
    monthLabels.push(`<text x="${x}" y="12">${monthFormatter.format(date)}</text>`);
    previousMonthX = x;
  }
  previousMonth = month;
});

const weekdayLabels = [
  { label: 'Mon', row: 1 },
  { label: 'Wed', row: 3 },
  { label: 'Fri', row: 5 }
].map(({ label, row }) => `<text x="0" y="${top + row * pitch + 9}">${label}</text>`);

const cells = weeks.flatMap((week, column) => week.contributionDays.map((day) => {
  const x = left + column * pitch;
  const y = top + Number(day.weekday) * pitch;
  const fill = colors[day.contributionLevel] || colors.NONE;
  const title = `${day.date}: ${day.contributionCount} contribution${day.contributionCount === 1 ? '' : 's'}`;
  return `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="2" fill="${fill}" stroke="#26383d" stroke-width="0.6"><title>${escapeXml(title)}</title></rect>`;
}));

const legendColors = Object.values(colors);
const legendStart = width - 112;
const legend = [
  `<text x="${legendStart - 29}" y="139">Less</text>`,
  ...legendColors.map((color, index) => `<rect x="${legendStart + index * pitch}" y="130" width="${cellSize}" height="${cellSize}" rx="2" fill="${color}" stroke="#26383d" stroke-width="0.6"/>`),
  `<text x="${legendStart + legendColors.length * pitch + 3}" y="139">More</text>`
];

const svg = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="contribution-title contribution-description">`,
  `<title id="contribution-title">${calendar.totalContributions} GitHub contributions in the last year</title>`,
  `<desc id="contribution-description">Contribution calendar for ${escapeXml(username)}</desc>`,
  '<style>text{fill:#9eb1b8;font-family:"Times New Roman",Georgia,serif;font-size:10px}</style>',
  ...monthLabels,
  ...weekdayLabels,
  ...cells,
  ...legend,
  '</svg>',
  ''
].join('\n');

await writeFile(outputFile, svg, 'utf8');
console.log(`Updated ${path.relative(projectRoot, outputFile)} for ${username}`);
