import { useCallback, useState } from 'react';

export interface IUseChatSessionResult {
    /**
     * Identifier of the current chat session, generated client-side.
     */
    sessionId: string;
    /**
     * Starts a fresh session (e.g. after an issue has been created).
     */
    rotate: () => void;
}

export const useChatSession = (): IUseChatSessionResult => {
    const [sessionId, setSessionId] = useState(() => crypto.randomUUID());

    const rotate = useCallback(() => setSessionId(crypto.randomUUID()), []);

    return { sessionId, rotate };
};
