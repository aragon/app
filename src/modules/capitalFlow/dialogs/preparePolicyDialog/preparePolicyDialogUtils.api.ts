import type { IDao } from '@/shared/api/daoService';
import type { ICreatePolicyFormData } from '../../components/createPolicyForm';

export interface IPreparePolicyMetadata {
    /**
     * Metadata CID for the policy plugin.
     */
    plugin: string;
}

export interface IBuildTransactionParams {
    /**
     * Values of the create-policy form.
     */
    values: ICreatePolicyFormData;
    /**
     * Metadata structure for the policy.
     */
    policyMetadata: IPreparePolicyMetadata;
    /**
     * DAO to deploy the policy to.
     */
    dao: IDao;
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
     * Transaction receipt from the policy deployment.
     */
    deploymentData: any; // TODO: Define proper type based on deployment response
}
