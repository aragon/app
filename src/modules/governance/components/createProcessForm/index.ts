import { CreateProcessFormMetadata } from './createProcessFormMetadata';
import { CreateProcessFormPermissions } from './createProcessFormPermissions';
import { CreateProcessFormStages } from './createProcessFormStages';

export const CreateProcessForm = {
    Metadata: CreateProcessFormMetadata,
    Stages: CreateProcessFormStages,
    Permissions: CreateProcessFormPermissions,
};

export type * from './createProcessFormDefinitions';
export * from './createProcessFormMetadata';
export * from './createProcessFormPermissions';
export * from './createProcessFormPluginFlows';
export * from './createProcessFormStages';
