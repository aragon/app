// App code reads process.env.* (Next.js injects it at build time). The
// standalone bundle runs in a plain browser, so provide a minimal stand-in.
// Must be the FIRST import of app-entry.ts so it runs before any app module.
const g = globalThis as {
    process?: { env: Record<string, string | undefined> };
};
g.process = g.process ?? { env: { NODE_ENV: 'production' } };
g.process.env = g.process.env ?? { NODE_ENV: 'production' };
