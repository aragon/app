'use client';

import dynamic from 'next/dynamic';

const DebugPanelLazy = dynamic(
    () =>
        import('./debugPanel').then((mod) => ({
            default: mod.DebugPanel,
        })),
    { ssr: false },
);

export const LazyDebugPanel: React.FC = () => <DebugPanelLazy />;
