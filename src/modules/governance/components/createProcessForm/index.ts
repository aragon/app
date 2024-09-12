import { CreateProcessFormMetadata } from './createProcessFormMetadata';
import { CreateProcessFormPermissions } from './createProcessFormPermissions/createProcessFormPermissions';
import { CreateProcessFormStages } from './createProcessFormStages';

export const CreateProcessForm = {
    Metadata: CreateProcessFormMetadata,
    Stages: CreateProcessFormStages,
    Permissions: CreateProcessFormPermissions,
};

export * from './createProcessFormDefinitions';
export * from './createProcessFormMetadata';
export * from './createProcessFormPermissions';
export * from './createProcessFormStages';
