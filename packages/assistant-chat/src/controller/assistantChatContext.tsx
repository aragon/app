import { createContext, useContext } from 'react';
import type { IAssistantChatController } from './useAssistantChatController';

const assistantChatContext = createContext<IAssistantChatController | null>(
    null,
);

export interface IAssistantChatProviderProps {
    /**
     * Controller instance shared with all widget components.
     */
    value: IAssistantChatController;
    /**
     * Children of the provider.
     */
    children: React.ReactNode;
}

export const AssistantChatProvider: React.FC<IAssistantChatProviderProps> = (
    props,
) => {
    const { value, children } = props;

    return (
        <assistantChatContext.Provider value={value}>
            {children}
        </assistantChatContext.Provider>
    );
};

export const useAssistantChatContext = (): IAssistantChatController => {
    const value = useContext(assistantChatContext);

    if (value == null) {
        throw new Error(
            'useAssistantChatContext must be used inside an AssistantChatProvider',
        );
    }

    return value;
};
