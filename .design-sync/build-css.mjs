// Compiles the design-system CSS from source, mirroring the app's own Tailwind
// wiring (layoutRoot.css). Used as cfg.buildCmd — runs before every converter
// build. See NOTES.md: the kit's shipped build.css is corrupted by its
// minifier, and the app never consumes it anyway (it compiles from source).
import { execFileSync } from 'node:child_process';
import {
    existsSync,
    mkdirSync,
    readFileSync,
    rmSync,
    symlinkSync,
    writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const appSrcNodeModules = join(root, 'apps/app/src/node_modules');
const appNodeModulesAlias = join(root, 'apps/app/node_modules/@');
const legacyDsSyncDir = join(root, '.ds-sync');
const kitCssOut = join(
    root,
    'apps/app/node_modules/@aragon/gov-ui-kit/.design-sync-kit-styles.css',
);
const cacheDir = join(root, '.design-sync/.cache');
const cacheCss = join(cacheDir, 'kit-styles.css');

// `--clean` removes the sync-time artifacts this script drops into the app
// workspace and exits. Run it at the end of a sync session so nothing
// design-sync-related lingers in the working tree.
if (process.argv.includes('--clean')) {
    const cleanTargets = [
        { label: 'apps/app/src/node_modules', path: appSrcNodeModules },
        { label: 'apps/app/node_modules/@', path: appNodeModulesAlias },
        {
            label: 'apps/app/node_modules/@aragon/gov-ui-kit/.design-sync-kit-styles.css',
            path: kitCssOut,
        },
        { label: '.design-sync/.cache', path: cacheDir },
        { label: '.ds-sync', path: legacyDsSyncDir },
    ];

    for (const target of cleanTargets) {
        rmSync(target.path, { recursive: true, force: true });
    }
    console.log(
        `design-sync artifacts removed (${cleanTargets.map((target) => target.label).join(', ')})`,
    );
    process.exit(0);
}
const cli = join(root, 'apps/app/node_modules/@tailwindcss/cli/dist/index.mjs');
const cliPackageJson = join(
    root,
    'apps/app/node_modules/@tailwindcss/cli/package.json',
);
const entry = join(root, '.design-sync/tailwind-entry.css');
const tmp = cacheCss;
// cfg.cssEntry is security-bounded to the package dir, so the compiled file
// must live inside it. node_modules is disposable — this runs (via
// cfg.buildCmd) before every converter build, so the file is always fresh.
const out = kitCssOut;

// The Tailwind CLI is a regular app devDependency so the repo's single pnpm
// lockfile owns the entire toolchain. Keep it aligned with the app's installed
// Tailwind engine; a mismatch means the catalog/package entries need to be
// refreshed in the same PR as the Tailwind bump.
if (!existsSync(cli) || !existsSync(cliPackageJson)) {
    throw new Error(
        '@tailwindcss/cli is missing. Run `pnpm install` from the repo root before design-sync.',
    );
}
const tailwindVersion = JSON.parse(
    readFileSync(
        join(root, 'apps/app/node_modules/tailwindcss/package.json'),
        'utf8',
    ),
).version;
const cliVersion = JSON.parse(readFileSync(cliPackageJson, 'utf8')).version;
if (cliVersion !== tailwindVersion) {
    throw new Error(
        `@tailwindcss/cli is ${cliVersion}, but apps/app has tailwindcss ${tailwindVersion}. Update the shared catalog and apps/app devDependencies together.`,
    );
}

// slice 3: app components import via the '@/' alias; esbuild resolves it
// through a node_modules/@ junction to apps/app/src (the converter's tsconfig
// paths plugin mis-resolves directory imports). Recreate it — node_modules is
// disposable and this runs (via cfg.buildCmd) before every converter build.
const junction = appNodeModulesAlias;
if (!existsSync(junction)) {
    symlinkSync(join(root, 'apps/app/src'), junction, 'junction');
    console.log('node_modules/@ junction recreated');
}

// Shim next/* for the standalone bundle: src/node_modules wins resolution over
// the real `next` package for files under src/. next/dynamic only lazy-loads
// hookform devtools here (never in previews); next/image degrades to <img>.
// Gitignored (node_modules rule) and regenerated on every build.
// App tooling is immune to the shims by construction: `next dev`/`next build`
// alias next/* internally, tsc and biome don't resolve through src/node_modules
// in a breaking way, and jest pins next/* to the real package (moduleNameMapper
// in apps/app/jest.config.js). Still, run `--clean` after a sync session so the
// working tree stays free of sync artifacts.
const shimDir = join(appSrcNodeModules, 'next');
mkdirSync(shimDir, { recursive: true });
writeFileSync(
    join(shimDir, 'package.json'),
    '{"name":"next","version":"0.0.0-design-sync-shim"}',
);
writeFileSync(
    join(shimDir, 'dynamic.js'),
    'export default function dynamic() { return function DynamicShim() { return null; }; }\n',
);
writeFileSync(
    join(shimDir, 'image.js'),
    "import { createElement } from 'react';\nexport default function Image({ src, alt, width, height, fill, ...rest }) {\n    const style = fill ? { position: 'absolute', inset: 0, objectFit: 'cover', width: '100%', height: '100%' } : undefined;\n    return createElement('img', { src: typeof src === 'string' ? src : (src && src.src), alt, width, height, style, ...rest });\n}\n",
);
writeFileSync(
    join(shimDir, 'link.js'),
    "import { createElement, forwardRef } from 'react';\nexport default forwardRef(function Link({ href, children, ...rest }, ref) {\n    return createElement('a', { href: typeof href === 'string' ? href : '#', ref, ...rest }, children);\n});\n",
);

// Pin cwd: Tailwind v4's automatic source detection scans from the working
// directory, so the emitted utilities (and the verified preview renders)
// change with the caller's cwd unless it is fixed to the repo root.
mkdirSync(cacheDir, { recursive: true });
execFileSync('node', [cli, '-i', entry, '-o', tmp], {
    cwd: root,
    stdio: 'inherit',
});

// Tailwind rebases @font-face urls to paths that don't resolve from the output
// location; point them at the kit's font directory relative to the package
// root (where the converter reads this file from).
const css = readFileSync(tmp, 'utf8').replaceAll(
    'url("../../fonts/',
    'url("./src/theme/fonts/',
);
writeFileSync(out, css);
console.log(
    `kit css compiled → ${out} (${Math.round(css.length / 1024)} KB), font urls repointed`,
);
