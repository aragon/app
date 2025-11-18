import type { IResourcesInputResource } from '@/shared/components/forms/resourcesInput';
import { PolicyDispatchIntervalType } from '../../types';

export interface ICreatePolicyFormData {
    /**
     * Name of the policy.
     */
    name: string;
    /**
     * Key of the policy. TODO: probably not needed?
     */
    policyKey: string;
    /**
     * Description of the policy.
     */
    description: string;
    /**
     * Resources of the policy.
     */
    resources: IResourcesInputResource[];
    /**
     * Dispatch interval type, defines the frequency at which dispatch could be executed.
     */
    dispatchIntervalType: PolicyDispatchIntervalType;
    /**
     * Policy strategy: router, distributor, DeFi adapter.
     * Only router available for now.
     */
    strategy: IPolicyStrategyFormData;
}

export interface IPolicyStrategyFormData {}
