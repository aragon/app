import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Provenance belongs in frontmatter and investigation records, not product prose.
export function codeLinks(text) {
  const body = text.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, '');
  return [...body.matchAll(/https?:\/\/(?:github\.com|raw\.githubusercontent\.com)\/[^\s)<>]+/g)]
    .map(match => match[0])
    .filter(link => {
      const url = new URL(link);
      const sourcePath = url.hostname === 'raw.githubusercontent.com' || /\/(blob|tree)\//.test(url.pathname);
      if (!sourcePath || /\/audits(?:\/|$)/.test(url.pathname)) return false;
      return /^\/aragon\/(app|app-backend|gov-ui-kit|app-cms)\//.test(url.pathname)
        || /\.(?:[cm]?[jt]sx?|sol|json|ya?ml|lock|css|scss)$/.test(url.pathname);
    });
}

function main() {
  const root = fileURLToPath(new URL('../../../../', import.meta.url));
  const entries = JSON.parse(execFileSync('wiki', ['--root', root, 'list', '--format', 'json'], { encoding: 'utf8' }));
  let pages = 0;
  let failures = 0;
  for (const entry of entries) {
    const path = entry._path.slice(1);
    if (/^(protocol-doc|internal\/maintenance)\//.test(path)
      || path === 'internal/index.md'
      || path === 'internal/product-opportunities/backlog.md') continue;
    pages++;
    for (const link of codeLinks(readFileSync(resolve(root, path), 'utf8'))) {
      console.error(`${path}: move source evidence out of product prose: ${link}`);
      failures++;
    }
  }
  console.log(`Checked ${pages} product and opportunity pages: ${failures} source-code links in prose.`);
  process.exitCode = failures ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main();
