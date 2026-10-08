'use client';

import { useEffect, useState } from 'react';
import { useFeatureFlags } from '@/shared/components/featureFlagsProvider';
import { AssistantChatLazy } from './assistantChatLazy';
import { useSupportChatContext } from './supportChatContext';
import { supportChatMonitoring } from './supportChatMonitoring';
import { useSupportAppContext } from './useSupportAppContext';

const assistantUrl = process.env.NEXT_PUBLIC_ASSISTANT_URL ?? '';

// The trigger opens the chat whenever the feature flag is on: no availability gate in front of
// the panel, service failures surface inside the widget with the support email one click away.
// What the chat may do is a flag too: supportChatDocs lets it answer from the documentation.
export const SupportChat: React.FC = () => {
    const { isOpen, close } = useSupportChatContext();
    const { isEnabled } = useFeatureFlags();

    const appContext = useSupportAppContext();

    // Mount the widget on first open and keep it mounted so the conversation survives closing
    // and reopening the panel.
    const [hasOpened, setHasOpened] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setHasOpened(true);
        }
    }, [isOpen]);

    if (!hasOpened) {
        return null;
    }

    return (
        <AssistantChatLazy
            appContext={appContext}
            assistantUrl={assistantUrl}
            features={{ docsSearch: isEnabled('supportChatDocs') }}
            isOpen={isOpen}
            monitoring={supportChatMonitoring}
            onClose={close}
        />
    );
};
