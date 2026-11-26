import type { Hex } from 'viem';
import type { Network } from '@/shared/api/daoService';
import type { IPluginSetupVersionTag } from '@/shared/utils/pluginTransactionUtils';

export interface IBuildCreateDaoPluginSettingsParams {
    /**
     * The network the DAO is deployed to.
     */
    network: Network;
    /**
     * Addresses that can approve the transactions of the new DAO.
     */
    signers: Hex[];
    /**
     * Number of signers that must approve a transaction.
     */
    minApprovals: number;
}

export interface ICreateDaoPluginSettings {
    /**
     * The plugin setup repository and version to install.
     */
    pluginSetupRef: {
        pluginSetupRepo: Hex;
        versionTag: IPluginSetupVersionTag;
    };
    /**
     * The encoded plugin settings.
     */
    data: Hex;
}
