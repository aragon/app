'use client';

import { createContext, useContext } from 'react';

export interface IPageContext {
    /**
     * Current content type.
     */
    contentType: 'main' | 'aside';
}

const pageContext = createContext<IPageContext | null>(null);

export const PageContextProvider = pageContext.Provider;

export const usePageContext = () => {
    const values = useContext(pageContext);

    if (values == null) {
        throw new Error('usePageContext: hook must be used inside a PageContextProvider to work properly');
    }

    return values;
};
