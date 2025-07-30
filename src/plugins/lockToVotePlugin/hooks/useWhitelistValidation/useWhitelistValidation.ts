import { useWhitelistedAddresses } from '@/modules/explore/api/cmsService/queries/useWhitelistedAddresses';
import { PluginInterfaceType } from '@/shared/api/daoService';
import type { IPluginInfo } from '@/shared/types';
import { useMemo } from 'react';

const isDevEnv = ['development', 'local'].includes(process.env.NEXT_PUBLIC_ENV ?? '');

export const useWhitelistValidation = (
    plugins: IPluginInfo[],
    address?: string,
): { approvals: Record<string, boolean> } => {
    const { data } = useWhitelistedAddresses();

    const approvals = useMemo(() => {
        const result: Record<string, boolean> = {};

        if (isDevEnv) {
            for (const plugin of plugins) {
                result[plugin.id] = true;
            }
            return result;
        }

        const isPluginInterfaceType = (key: string): key is PluginInterfaceType => {
            return Object.values(PluginInterfaceType).includes(key as PluginInterfaceType);
        };

        for (const plugin of plugins) {
            const key = plugin.id;

            if (!isPluginInterfaceType(key)) {
                result[key] = true;
                continue;
            }

            const list = data?.[key];

            result[key] =
                !address || !data ? true : !list || list.some((addr) => addr.toLowerCase() === address.toLowerCase());
        }

        return result;
    }, [plugins, address, data]);

    return { approvals };
};
