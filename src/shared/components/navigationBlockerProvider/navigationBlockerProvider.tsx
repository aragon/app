'use client';

import { type Dispatch, type SetStateAction, createContext, useContext, useState } from 'react';

const NavigationBlockerContext = createContext<[isBlocked: boolean, setBlocked: Dispatch<SetStateAction<boolean>>]>([
    false,
    () => {},
]);

export function NavigationBlockerProvider({ children }: { children: React.ReactNode }) {
    const [isBlocked, setIsBlocked] = useState(false);
    return (
        <NavigationBlockerContext.Provider value={[isBlocked, setIsBlocked]}>
            {children}
        </NavigationBlockerContext.Provider>
    );
}

export function useIsBlocked() {
    const [isBlocked] = useContext(NavigationBlockerContext);
    return isBlocked;
}

export function useSetIsBlocked() {
    const [, setIsBlocked] = useContext(NavigationBlockerContext);
    return setIsBlocked;
}
