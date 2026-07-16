'use client';

import { useEffect, useState } from 'react';
import { SUPPORT_PORTAL_URL } from '../footer/footerLinks';
import { AssistantChatLazy } from './assistantChatLazy';
import type { ISupportChatProps } from './supportChat.api';
import { supportChatMonitoring } from './supportChatMonitoring';
import { useSupportAppContext } from './useSupportAppContext';

const assistantUrl = process.env.NEXT_PUBLIC_ASSISTANT_URL ?? '';

// The help click opens the chat whenever the feature flag is on — no availability gate in
// front of the drawer. Service failures surface inside the widget, where the support portal
// stays one click away (header link + error escape hatches).
export const SupportChat: React.FC<ISupportChatProps> = (props) => {
    const { isOpen, onClose } = props;

    const appContext = useSupportAppContext();

    // Mount the widget on first open and keep it mounted so the conversation survives closing
    // and reopening the drawer.
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
            onClose={onClose}
            supportPortalUrl={SUPPORT_PORTAL_URL}
        />
    );
};
