import type { IDaoPluginMetadataObject } from '@/modules/governance/api/governanceService/domain/proposalActionUpdatePluginMetadata';
import type { IResourcesInputResource } from '@/shared/components/forms/resourcesInput';

export interface IUpdatePluginMetadataFormData extends Omit<IDaoPluginMetadataObject, 'resources'> {
    resources?: IResourcesInputResource[];
}
