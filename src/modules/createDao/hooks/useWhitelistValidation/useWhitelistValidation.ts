import { useWhitelistedAddresses } from '@/modules/explore/api/cmsService/queries/useWhitelistedAddresses';
import { useDebugContext } from '@/shared/components/debugProvider';
import { addressUtils } from '@aragon/gov-ui-kit';
import { useAccount } from 'wagmi';
import type { IWhitelistValidationParams, IWhitelistValidationResult } from './useWhiteListValidation.api';

export interface IWhitelistValidationStatus extends IWhitelistValidationResult {
    isValidating: boolean;
}

export const useWhitelistValidation = (params: IWhitelistValidationParams): IWhitelistValidationStatus => {
    const { plugins } = params;

    const { address: connectedAddress, isConnected } = useAccount();
    const { data, isLoading: isDataLoading } = useWhitelistedAddresses();
    const { values } = useDebugContext<{ enableAllPlugins: boolean }>();
    const { enableAllPlugins } = values;

    if (enableAllPlugins) {
        return {
            enabledPlugins: plugins,
            disabledPlugins: [],
            isValidating: false,
        };
    }

    const accountPending = !isConnected;
    const dataPending = isDataLoading || data === undefined;

    if (accountPending || dataPending) {
        return {
            enabledPlugins: [],
            disabledPlugins: plugins,
            isValidating: true,
        };
    }

    const enabledPlugins: typeof plugins = [];
    const disabledPlugins: typeof plugins = [];

    for (const plugin of plugins) {
        const key = plugin.id;
        const list = data[key];

        const approved =
            !list ||
            (connectedAddress != null &&
                list.some((whitelistAddress) => addressUtils.isAddressEqual(whitelistAddress, connectedAddress)));

        if (approved) {
            enabledPlugins.push(plugin);
        } else {
            disabledPlugins.push(plugin);
        }
    }

    return {
        enabledPlugins,
        disabledPlugins,
        isValidating: false,
    };
};
