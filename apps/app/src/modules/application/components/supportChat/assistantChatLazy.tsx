'use client';

import dynamic from 'next/dynamic';

// Loaded on demand so the widget chunk is only fetched when the support chat is actually opened.
export const AssistantChatLazy = dynamic(
    () =>
        import('@aragon/assistant-chat').then((mod) => ({
            default: mod.AssistantChat,
        })),
    { ssr: false },
);
