import { mkdir, readdir, rename } from 'node:fs/promises';
import path from 'node:path';
import { basePath } from '../lib/site';

// Post-build step (`pnpm nest:output`, after `pnpm check:output`): moves the export under the base
// path, `out/accounts/account.html` → `out/help/accounts/account.html`. Next writes a static export
// at the root of `out/` whatever `basePath`, while Vercel's Next.js builder maps the base-path URLs
// (`/help/_next/static/*`, `/help/404`) onto the filesystem as they are: deployed bare, the export
// serves its pages only through a rewrite and answers every asset with 404. Nested, the files sit
// where the pages link to them and no rewrite is involved.

const outDir = path.resolve(process.cwd(), 'out');
const nestedDir = path.join(outDir, basePath.slice(1));

const run = async () => {
    const entries = await readdir(outDir);
    if (entries.includes(path.basename(nestedDir))) {
        throw new Error(
            `out/ already has an entry named ${path.basename(nestedDir)}`,
        );
    }
    await mkdir(nestedDir, { recursive: true });
    for (const entry of entries) {
        await rename(path.join(outDir, entry), path.join(nestedDir, entry));
    }

    process.stdout.write(
        `[docs-output] ${String(entries.length)} entries moved under out${basePath}/\n`,
    );
};

run().catch((error: unknown) => {
    process.stderr.write(
        `[docs-output] failed: ${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exit(1);
});
