import {
    type IDaoPolicy,
    PolicyInterfaceType,
    PolicyStrategyType,
} from '@/shared/api/daoService';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { capitalFlowAddresses } from '../constants/capitalFlowAddresses';

class PolicyPluginRegistryUtils {
    isPolicy = (plugin: unknown): plugin is IDaoPolicy =>
        plugin != null &&
        typeof plugin === 'object' &&
        'strategy' in plugin &&
        'interfaceType' in plugin;

    initialiseRegistry = () => {
        pluginRegistryUtils
            .registerPluginRepositoryAddressResolver({
                pluginId: PolicyInterfaceType.ROUTER,
                resolve: ({ network, plugin }) => {
                    const repositoryKey =
                        this.resolveRouterPolicyRepositoryAddress(plugin);
                    if (repositoryKey == null) {
                        return;
                    }

                    return capitalFlowAddresses[network][repositoryKey];
                },
            })
            .registerPluginRepositoryAddressResolver({
                pluginId: PolicyInterfaceType.CLAIMER,
                resolve: ({ network }) =>
                    capitalFlowAddresses[network].claimerPluginRepo,
            });
    };

    private resolveRouterPolicyRepositoryAddress = (plugin: unknown) => {
        if (!this.isPolicy(plugin)) {
            return;
        }

        const strategyType = plugin.strategy?.type;

        switch (strategyType) {
            case PolicyStrategyType.BURN_ROUTER:
                return 'burnRouterPluginRepo' as const;
            case PolicyStrategyType.UNISWAP_ROUTER:
                return 'uniswapRouterPluginRepo' as const;
            case PolicyStrategyType.MULTI_DISPATCH:
                return 'multiDispatchRouterPluginRepo' as const;
            case PolicyStrategyType.COW_SWAP_ROUTER:
                return 'cowSwapRouterPluginRepo' as const;
            case PolicyStrategyType.CLAIMER:
                return 'claimerPluginRepo' as const;
            default:
                return 'routerPluginRepo' as const;
        }
    };
}

export const policyPluginRegistryUtils = new PolicyPluginRegistryUtils();

export const initialisePolicyPluginRegistry = () => {
    policyPluginRegistryUtils.initialiseRegistry();
};
