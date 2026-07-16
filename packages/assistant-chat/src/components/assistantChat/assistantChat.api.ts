import type { IAppContext } from '@aragon/assistant-contracts';
import type { IChatMonitoring } from '../../monitoring';

export interface IAssistantChatProps {
    /**
     * Whether the chat is currently visible in the host layout. The widget stays mounted while
     * hidden (so the conversation survives); this flag drives visibility-dependent behavior such
     * as focusing the composer when the chat opens.
     */
    isOpen: boolean;
    /**
     * Called when the close button in the chat header is pressed.
     */
    onClose: () => void;
    /**
     * Base URL of the assistant service (no trailing slash).
     */
    assistantUrl: string;
    /**
     * Context of the app captured at open time, sent alongside every request.
     */
    appContext: IAppContext;
    /**
     * Fallback support-portal URL offered as an escape hatch when the chat hard-fails (e.g. rate
     * limited or the service is unreachable), so the user can always file a request the old way.
     */
    supportPortalUrl?: string;
    /**
     * Monitoring implementation injected by the host app.
     * @default noopMonitoring
     */
    monitoring?: IChatMonitoring;
}
