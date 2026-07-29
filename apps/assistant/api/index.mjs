// Vercel deployment adapter: the catch-all rewrite in vercel.json routes every request here.
// The bundled Hono app is an object with a .fetch(request) method, which @vercel/node accepts
// as a fetch web standard handler. dist/index.mjs is produced by `pnpm build` (tsup), which
// vercel.json runs as buildCommand before the /api functions are built.
export { default } from '../dist/index.mjs';
