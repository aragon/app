import { CreateProcessFormMetadata } from './createProcessFormMetadata';
import { CreateProcessFormPermissions } from './createProcessFormPermissions/createProcessFormPermissions';
import { CreateProcessFormSettings } from './createProcessFormSettings';

export const CreateProcessForm = {
    Metadata: CreateProcessFormMetadata,
    Processes: CreateProcessFormSettings,
    Permissions: CreateProcessFormPermissions,
};

export * from './createProcessFormDefinitions';
export * from './createProcessFormMetadata';
export * from './createProcessFormPermissions';
export * from './createProcessFormSettings';
