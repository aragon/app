import { serve } from '@hono/node-server';
import { createApp } from './app';
import { env } from './lib/env';

const port = env.port();

serve({ fetch: createApp().fetch, port }, () => {
    // biome-ignore lint/suspicious/noConsole: local dev server startup message
    console.log(
        `Assistant dev server running on http://localhost:${String(port)}`,
    );
});
