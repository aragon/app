import type { IResourcesInputResource } from '@/shared/components/forms/resourcesInput';

export interface IUpdateMetadataFormData {
    /**
     * Name of the process.
     */
    name: string;
    /**
     * Key identifier for the process.
     */
    key?: string;
    /**
     * Summary of the process.
     */
    summary?: string;
    /**
     * Resources of the process.
     */
    resources: IResourcesInputResource[];
}
