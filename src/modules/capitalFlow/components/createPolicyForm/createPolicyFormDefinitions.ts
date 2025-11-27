import type { IResourcesInputResource } from '@/shared/components/forms/resourcesInput';
import type { ISetupStrategyForm } from '../../dialogs/setupStrategyDialog';

export enum PolicyDispatchIntervalType {
    CONTINUOUS = 'CONTINUOUS',
    COOLDOWN = 'COOLDOWN',
}

export interface IDispatchInterval {
    /**
     * Dispatch interval type, defines the frequency at which dispatch could be executed.
     */
    type: PolicyDispatchIntervalType;
    /**
     * Cooldown duration in seconds (only applicable when type is COOLDOWN).
     */
    cooldownDuration?: number;
}

export interface ICreatePolicyFormData {
    /**
     * Name of the policy.
     */
    name: string;
    /**
     * Key of the policy.
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
     * Policy strategy: router, distributor, DeFi adapter.
     * Only router available for now.
     */
    strategy: ISetupStrategyForm;
    /**
     * Dispatch interval configuration.
     */
    dispatchInterval: IDispatchInterval;
}
