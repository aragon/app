import type { Hex } from 'viem';
import type { IDao } from '@/shared/api/daoService';
import type { IPluginInstallationSetupData } from '../../../../shared/utils/pluginTransactionUtils';
import type { ICreatePolicyFormData } from '../../components/createPolicyForm';

export interface IPreparePolicyMetadata {
    /**
     * Metadata CID for the policy plugin.
     */
    plugin: string;
}

export interface IPrepareSourceAndModelContracts {
    /**
     * Model contract address.
     */
    model: Hex;
    /**
     * Source contract address.
     */
    source: Hex;
}

export interface IBuildTransactionParams {
    /**
     * DAO to deploy the policy to.
     */
    dao: IDao;
    /**
     * Values of the create-policy form.
     */
    values: ICreatePolicyFormData;
    /**
     * Metadata structure for the policy.
     */
    policyMetadata?: IPreparePolicyMetadata;
    /**
     * Deployed source and model contract addresses.
     */
    sourceAndModelContracts?: IPrepareSourceAndModelContracts;
}

export interface IBuildPolicyProposalActionsParams {
    /**
     * Create-policy form values.
     */
    values: ICreatePolicyFormData;
    /**
     * DAO to deploy the policy for.
     */
    dao: IDao;
    /**
     * Address list of the plugins to be installed.
     */
    setupData: IPluginInstallationSetupData[];
}
