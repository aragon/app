import { CreateProcessFormGovernance } from './createProcessFormGovernance';
import { CreateProcessFormMetadata } from './createProcessFormMetadata';
import { CreateProcessFormPermissions } from './createProcessFormPermissions';

export const CreateProcessForm = {
    Metadata: CreateProcessFormMetadata,
    Stages: CreateProcessFormGovernance,
    Permissions: CreateProcessFormPermissions,
};

export * from './createProcessFormDefinitions';
export * from './createProcessFormGovernance';
export * from './createProcessFormMetadata';
export * from './createProcessFormPermissions';
export { createProcessFormUtils } from './createProcessFormUtils';
