import type { IResourcesInputResource } from '@/shared/components/forms/resourcesInput';
import type { IDaoPluginMetadata } from '@/shared/types';

export interface IUpdateMetadataFormData extends Omit<IDaoPluginMetadata, 'resources'> {
    resources?: IResourcesInputResource[];
}
