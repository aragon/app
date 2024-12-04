'use client';

import { type ReactNode, createContext, useContext, useMemo, useState } from 'react';

export interface IBlockNavigationContext {
    /**
     * Defines if navigation is blocked or not.
     */
    isBlocked: boolean;
    /**
     * Callback used to block / unblock navigation.
     */
    setIsBlocked: (blocked: boolean) => void;
}

export interface IBlockNavigationContextProviderProps {
    /**
     * Children of the provider.
     */
    children: ReactNode;
}

const blockNavigationContext = createContext<IBlockNavigationContext>({ isBlocked: false, setIsBlocked: () => null });

export const BlockNavigationContextProvider: React.FC<IBlockNavigationContextProviderProps> = (props) => {
    const { children } = props;

    const [isBlocked, setIsBlocked] = useState(false);

    const contextValue = useMemo(() => ({ isBlocked, setIsBlocked }), [isBlocked]);

    return <blockNavigationContext.Provider value={contextValue}>{children}</blockNavigationContext.Provider>;
};

export const useBlockNavigationContext = (): IBlockNavigationContext => {
    const values = useContext(blockNavigationContext);

    return values;
};
