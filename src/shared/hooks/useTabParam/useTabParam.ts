import { usePathname, useRouter, useSearchParams } from 'next/navigation-original';
import { useCallback, useRef, useState } from 'react';

export interface IUseTabParamParams {
    /**
     * Name of the parameter to be used on the URL.
     * @default tab
     */
    name?: string;
    /**
     * Fallback value of the parameter used when URL has no initial parameter set.
     */
    fallbackValue?: string;
}

export type IUseTabParamResult = [string | undefined, (tab: string) => void];

export const defaultParamName = 'tab';

export const useTabParam = (params: IUseTabParamParams): IUseTabParamResult => {
    const { name = defaultParamName, fallbackValue } = params;

    const searchParams = useSearchParams();
    const searchParamsRef = useRef(searchParams);

    const pathname = usePathname();
    const pathnameRef = useRef(pathname);

    const router = useRouter();
    const routerRef = useRef(router);

    const initialValue = searchParams.get(name) ?? fallbackValue;
    const [activeTab, setActiveTab] = useState(initialValue);

    const updateActiveTab = useCallback(
        (tabId: string) => {
            const newParams = new URLSearchParams(searchParamsRef.current);
            newParams.set(name, tabId);
            routerRef.current.replace(`${pathnameRef.current}?${newParams.toString()}`);
            setActiveTab(tabId);
        },
        [name],
    );

    return [activeTab, updateActiveTab];
};
