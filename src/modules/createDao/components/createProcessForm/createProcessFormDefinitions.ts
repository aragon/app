import type { IResourcesInputResource } from '@/shared/components/forms/resourcesInput';

export interface ICreateProcessFormData {
    /**
     * Name of the process.
     */
    name: string;
    /**
     * Key of the process used as prefix for proposals.
     */
    processKey: string;
    /**
     * Description of the process.
     */
    description: string;
    /**
     * Resources of the process.
     */
    resources: IResourcesInputResource[];
}
