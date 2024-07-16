'use client';

import type React from 'react';
import { createContext, useContext, useState, type ReactNode } from 'react';

interface ProposalActionsContextProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const ProposalActionsContext = createContext<ProposalActionsContextProps | undefined>(undefined);

export const useProposalActionsContext = () => {
    const context = useContext(ProposalActionsContext);
    if (!context) {
        throw new Error('useProposalActionsContext must be used within a ProposalActionsProvider');
    }
    return context;
};

interface ProposalActionsProviderProps {
    children: ReactNode;
}

export const ProposalActionsProvider: React.FC<ProposalActionsProviderProps> = ({ children }) => {
    const [activeTab, setActiveTab] = useState<string>('basic');

    return (
        <ProposalActionsContext.Provider value={{ activeTab, setActiveTab }}>
            {children}
        </ProposalActionsContext.Provider>
    );
};
