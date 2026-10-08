import { createMDX } from 'fumadocs-mdx/next';
import type { NextConfig } from 'next';
import { basePath } from './src/lib/site';

// A static site served by the Aragon app's rewrite of /help, so every page is exported as HTML
// under the base path and nothing runs at request time.
const config: NextConfig = {
    output: 'export',
    basePath,
    reactStrictMode: true,
    // next/image has no optimizer in a static export.
    images: { unoptimized: true },
    // `next dev` would otherwise drop an AGENTS.md into the workspace; the repo root has its own.
    agentRules: false,
};

export default createMDX()(config);
