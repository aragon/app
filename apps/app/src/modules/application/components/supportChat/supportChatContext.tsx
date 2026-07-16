'use client';

import {
    createContext,
    type ReactNode,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';

export interface ISupportChatContext {
    /**
     * Whether the support chat panel is open.
     */
    isOpen: boolean;
    /**
     * Opens the support chat panel.
     */
    open: () => void;
    /**
     * Closes the support chat panel.
     */
    close: () => void;
    /**
     * Toggles the support chat panel.
     */
    toggle: () => void;
}

export interface ISupportChatContextProviderProps {
    /**
     * Children of the provider.
     */
    children: ReactNode;
}

const supportChatContext = createContext<ISupportChatContext>({
    isOpen: false,
    open: () => null,
    close: () => null,
    toggle: () => null,
});

// Single owner of the open / close state of the support chat panel: the header triggers and the
// panel itself (both rendered in distant parts of the root layout) stay in sync through it.
export const SupportChatContextProvider: React.FC<
    ISupportChatContextProviderProps
> = (props) => {
    const { children } = props;

    const [isOpen, setIsOpen] = useState(false);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen((current) => !current), []);

    const contextValue = useMemo(
        () => ({ isOpen, open, close, toggle }),
        [isOpen, open, close, toggle],
    );

    return (
        <supportChatContext.Provider value={contextValue}>
            {children}
        </supportChatContext.Provider>
    );
};

export const useSupportChatContext = (): ISupportChatContext =>
    useContext(supportChatContext);
