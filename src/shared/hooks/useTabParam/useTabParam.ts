import { usePathname, useRouter, useSearchParams } from 'next/navigation-original';
import { useCallback, useState } from 'react';

export interface IUseTabParamParams {
    /**
     * @default tab
     */
    name?: string;
    /**
     *
     */
    initialValue?: string;
}

export type IUseTabParamResult = [string | undefined, (tab: string) => void];

export const defaultParamName = 'tab';

export const useTabParam = (params: IUseTabParamParams): IUseTabParamResult => {
    const { name = defaultParamName, initialValue } = params;

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState(searchParams.get(name) ?? initialValue);

    const updateActiveTab = useCallback(
        (tabId: string) => {
            const newParams = new URLSearchParams(searchParams);
            newParams.set(name, tabId);
            router.replace(`${pathname}?${newParams.toString()}`);
            setActiveTab(tabId);
        },
        [searchParams, name, router, pathname],
    );

    return [activeTab, updateActiveTab];
};
