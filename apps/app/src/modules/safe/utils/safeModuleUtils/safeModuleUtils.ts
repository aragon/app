import {
    type Deployment,
    getAllowanceModuleDeployment,
    getSafe4337ModuleDeployment,
    getSocialRecoveryModuleDeployment,
} from '@safe-global/safe-modules-deployments';
import type { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';

/**
 * Safe modules the app can name, keyed by the copy their name lives under.
 */
export type SafeModuleName = 'allowance' | 'safe4337' | 'socialRecovery';

export interface ISafeModuleInfo {
    /**
     * Key of the module's name under `app.safe.safeSettings.moduleNames`.
     */
    name: SafeModuleName;
    /**
     * Version of the deployment the address belongs to.
     */
    version: string;
}

interface IKnownSafeModule {
    name: SafeModuleName;
    getDeployment: (filter: {
        version: string;
        network: string;
    }) => Deployment | undefined;
    /**
     * Each getter returns a single deployment per filter, so every version has to be asked for by
     * name. An address from a version missing here reads as an unrecognised module, never as a
     * wrong one; the tests fail if a listed version stops resolving.
     */
    versions: string[];
}

export const knownSafeModules: IKnownSafeModule[] = [
    {
        name: 'allowance',
        getDeployment: getAllowanceModuleDeployment,
        versions: ['0.1.1', '0.1.0'],
    },
    {
        name: 'safe4337',
        getDeployment: getSafe4337ModuleDeployment,
        versions: ['0.3.0', '0.2.0'],
    },
    {
        name: 'socialRecovery',
        getDeployment: getSocialRecoveryModuleDeployment,
        versions: ['0.1.0'],
    },
];

class SafeModuleUtils {
    /**
     * Names an enabled module by matching its address against Safe's official module deployments
     * on the Safe's chain. Returns undefined for anything else: a module the app cannot name is
     * still enabled and can still move funds, so callers list it rather than drop it.
     */
    getModuleInfo = (
        network: Network,
        address: string,
    ): ISafeModuleInfo | undefined => {
        const chainId = networkDefinitions[network].id.toString();
        const target = address.toLowerCase();

        for (const { name, getDeployment, versions } of knownSafeModules) {
            for (const version of versions) {
                const deployment = getDeployment({ version, network: chainId });
                const deployed = deployment?.networkAddresses[chainId];

                if (deployed?.toLowerCase() === target) {
                    return { name, version };
                }
            }
        }

        return undefined;
    };
}

export const safeModuleUtils = new SafeModuleUtils();
