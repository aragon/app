import { defineConfig } from 'tsup';

// Bundles all first-party source into a single self-contained file so no extensionless relative
// import ever reaches the lambda (Node ESM requires exact file names at runtime). npm dependencies
// stay external bare imports: Vercel's file tracer resolves them from node_modules, which keeps
// native modules (@sentry/profiling-node) and the Sentry dependency tree as single instances.
export default defineConfig({
    entry: { index: 'src/index.ts' },
    format: ['esm'],
    // Explicit .mjs so the bundle is ESM regardless of which package.json files get traced
    // into the deployed function.
    outExtension: () => ({ js: '.mjs' }),
    sourcemap: true,
    clean: true,
});
