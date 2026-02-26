'use client';

import dynamic from 'next/dynamic';

export const DebugPanelLazy = dynamic(
    () =>
        import('./debugPanel').then((mod) => ({
            default: mod.DebugPanel,
        })),
    { ssr: false },
);
