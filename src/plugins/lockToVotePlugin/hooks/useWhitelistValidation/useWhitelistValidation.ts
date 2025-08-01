import { useWhitelistedAddresses } from '@/modules/explore/api/cmsService/queries/useWhitelistedAddresses';
import { useDebugContext } from '@/shared/components/debugProvider';
import { addressUtils } from '@aragon/gov-ui-kit';
import { useAccount } from 'wagmi';
import type { IWhitelistValidationParams, IWhitelistValidationResult } from './useWhiteListValidation.api';

export const useWhitelistValidation = (params: IWhitelistValidationParams): IWhitelistValidationResult => {
    const { plugins } = params;

    const { address: connectedAddress } = useAccount();
    const { data } = useWhitelistedAddresses();

    const { values } = useDebugContext<{ enableAllPlugins: boolean }>();
    const { enableAllPlugins } = values;

    if (enableAllPlugins || !data) {
        return {
            enabledPlugins: plugins,
            disabledPlugins: [],
        };
    }

    const enabledPlugins = [];
    const disabledPlugins = [];

    for (const plugin of plugins) {
        const key = plugin.id;

        const list = data[key];

        const approved =
            !list || list.some((whitelistAddress) => addressUtils.isAddressEqual(whitelistAddress, connectedAddress));

        if (approved) {
            enabledPlugins.push(plugin);
        } else {
            disabledPlugins.push(plugin);
        }
    }

    return { enabledPlugins, disabledPlugins };
};
