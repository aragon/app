import { CreateProcessFormMetadata } from './createProcessFormMetadata';
import { CreateProcessFormPermissions } from './createProcessFormPermissions';
import { CreateProcessFormGovernance } from './createProcessFormGovernance';

export const CreateProcessForm = {
    Metadata: CreateProcessFormMetadata,
    Stages: CreateProcessFormGovernance,
    Permissions: CreateProcessFormPermissions,
};

export * from './createProcessFormDefinitions';
export * from './createProcessFormMetadata';
export * from './createProcessFormPermissions';
export * from './createProcessFormGovernance';
export { createProcessFormUtils } from './createProcessFormUtils';
