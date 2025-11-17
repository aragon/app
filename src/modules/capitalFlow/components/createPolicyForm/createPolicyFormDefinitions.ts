import type { IResourcesInputResource } from '@/shared/components/forms/resourcesInput';

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
}
