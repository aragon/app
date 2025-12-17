import { addressUtils } from '@aragon/gov-ui-kit';
import { useAccount } from 'wagmi';
import { useWhitelistedAddresses } from '@/modules/explore/api/cmsService/queries/useWhitelistedAddresses';
import { useDebugContext } from '@/shared/components/debugProvider';
import type { IWhitelistValidationParams, IWhitelistValidationResult } from './useWhiteListValidation.api';

export const useWhitelistValidation = (params: IWhitelistValidationParams): IWhitelistValidationResult => {
    const { plugins } = params;

    const { address } = useAccount();
    const { data } = useWhitelistedAddresses();
    const { values } = useDebugContext<{ enableAllPlugins: boolean }>();

    if (values.enableAllPlugins || data == null) {
        return { enabledPlugins: plugins, disabledPlugins: [] };
    }

    if (!address) {
        return { enabledPlugins: [], disabledPlugins: plugins };
    }

    const enabledPlugins: typeof plugins = [];
    const disabledPlugins: typeof plugins = [];

    for (const plugin of plugins) {
        const list = data[plugin.id];

        const approved = !list || list.some((whitelistAddress) => addressUtils.isAddressEqual(whitelistAddress, address));

        if (approved) {
            enabledPlugins.push(plugin);
        } else {
            disabledPlugins.push(plugin);
        }
    }

    return { enabledPlugins, disabledPlugins };
};
