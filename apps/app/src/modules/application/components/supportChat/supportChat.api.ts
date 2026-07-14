export interface ISupportChatProps {
    /**
     * Whether the support chat is open.
     */
    isOpen: boolean;
    /**
     * Callback called when the chat requests to close.
     */
    onClose: () => void;
}
