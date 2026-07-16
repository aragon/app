'use client';

import { useEffect, useState } from 'react';
import { AssistantChatLazy } from './assistantChatLazy';
import { useSupportChatContext } from './supportChatContext';
import { supportChatMonitoring } from './supportChatMonitoring';
import { useSupportAppContext } from './useSupportAppContext';

const assistantUrl = process.env.NEXT_PUBLIC_ASSISTANT_URL ?? '';

// The trigger opens the chat whenever the feature flag is on — no availability gate in front of
// the panel. Service failures surface inside the widget, where mailing the support team stays
// one click away (header link + error escape hatches).
export const SupportChat: React.FC = () => {
    const { isOpen, close } = useSupportChatContext();

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
            isOpen={isOpen}
            monitoring={supportChatMonitoring}
            onClose={close}
        />
    );
};
