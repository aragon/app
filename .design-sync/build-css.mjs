// Compiles the design-system CSS from source, mirroring the app's own Tailwind
// wiring (layoutRoot.css). Used as cfg.buildCmd — runs before every converter
// build. See NOTES.md: the kit's shipped build.css is corrupted by its
// minifier, and the app never consumes it anyway (it compiles from source).
import { execFileSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cli = join(root, '.ds-sync/node_modules/@tailwindcss/cli/dist/index.mjs');
const entry = join(root, '.design-sync/tailwind-entry.css');
const tmp = join(root, '.design-sync/.cache/kit-styles.css');
// cfg.cssEntry is security-bounded to the package dir, so the compiled file
// must live inside it. node_modules is disposable — this runs (via
// cfg.buildCmd) before every converter build, so the file is always fresh.
const out = join(root, 'apps/app/node_modules/@aragon/gov-ui-kit/.design-sync-kit-styles.css');

// slice 3: app components import via the '@/' alias; esbuild resolves it
// through a node_modules/@ junction to apps/app/src (the converter's tsconfig
// paths plugin mis-resolves directory imports). Recreate it — node_modules is
// disposable and this runs (via cfg.buildCmd) before every converter build.
const junction = join(root, 'apps/app/node_modules/@');
if (!existsSync(junction)) {
    symlinkSync(join(root, 'apps/app/src'), junction, 'junction');
    console.log('node_modules/@ junction recreated');
}

// Shim next/* for the standalone bundle: src/node_modules wins resolution over
// the real `next` package for files under src/. next/dynamic only lazy-loads
// hookform devtools here (never in previews); next/image degrades to <img>.
// Gitignored (node_modules rule) and regenerated on every build.
const shimDir = join(root, 'apps/app/src/node_modules/next');
mkdirSync(shimDir, { recursive: true });
writeFileSync(join(shimDir, 'package.json'), '{"name":"next","version":"0.0.0-design-sync-shim"}');
writeFileSync(
    join(shimDir, 'dynamic.js'),
    "export default function dynamic() { return function DynamicShim() { return null; }; }\n",
);
writeFileSync(
    join(shimDir, 'image.js'),
    "import { createElement } from 'react';\nexport default function Image({ src, alt, width, height, fill, ...rest }) {\n    const style = fill ? { position: 'absolute', inset: 0, objectFit: 'cover', width: '100%', height: '100%' } : undefined;\n    return createElement('img', { src: typeof src === 'string' ? src : (src && src.src), alt, width, height, style, ...rest });\n}\n",
);
writeFileSync(
    join(shimDir, 'link.js'),
    "import { createElement, forwardRef } from 'react';\nexport default forwardRef(function Link({ href, children, ...rest }, ref) {\n    return createElement('a', { href: typeof href === 'string' ? href : '#', ref, ...rest }, children);\n});\n",
);

execFileSync('node', [cli, '-i', entry, '-o', tmp], { stdio: 'inherit' });

// Tailwind rebases @font-face urls to paths that don't resolve from the output
// location; point them at the kit's font directory relative to the package
// root (where the converter reads this file from).
const css = readFileSync(tmp, 'utf8').replaceAll('url("../../fonts/', 'url("./src/theme/fonts/');
writeFileSync(out, css);
console.log(`kit css compiled → ${out} (${Math.round(css.length / 1024)} KB), font urls repointed`);
