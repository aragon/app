import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { toRoute } from './buildContent';

// Post-build check (`pnpm check:output`, after `next build`): every page the content step wrote
// has its HTML in the export, and so do the site's fixed outputs. A page Next silently left out
// (a build error swallowed by the exporter, a route that stopped matching) fails the build here
// instead of returning 404 in production.

const workspaceDir = process.cwd();
const contentDir = path.resolve(workspaceDir, 'content/docs');
const outDir = path.resolve(workspaceDir, 'out');

// The non-page outputs: the 404 page, the sitemap and the static search index.
const fixedOutputs = ['404.html', 'sitemap.xml', 'api/search'];

const toOutputFile = (route: string): string =>
    route === '/' ? 'index.html' : `${route.slice(1)}.html`;

const run = async () => {
    const entries = await readdir(contentDir, {
        withFileTypes: true,
        recursive: true,
    });
    const pages = entries
        .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
        .map((entry) =>
            path
                .relative(contentDir, path.join(entry.parentPath, entry.name))
                .split(path.sep)
                .join('/'),
        )
        .map((corpusPath) => toOutputFile(toRoute(corpusPath)));
    const missing = [...pages, ...fixedOutputs].filter(
        (file) => !existsSync(path.join(outDir, file)),
    );

    if (missing.length > 0) {
        throw new Error(
            `${String(missing.length)} files missing from out/: ${missing.join(', ')}`,
        );
    }

    process.stdout.write(
        `[docs-output] ${String(pages.length)} pages exported to out/\n`,
    );
};

run().catch((error: unknown) => {
    process.stderr.write(
        `[docs-output] failed: ${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exit(1);
});
