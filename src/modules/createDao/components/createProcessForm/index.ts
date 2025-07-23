import { CreateProcessFormGovernance } from './createProcessFormGovernance';
import { CreateProcessFormMetadata } from './createProcessFormMetadata';
import { CreateProcessFormPermissions } from './createProcessFormPermissions';
import { CreateProcessFormProposalCreation } from './createProcessFormProposalCreation';

export const CreateProcessForm = {
    Metadata: CreateProcessFormMetadata,
    Governance: CreateProcessFormGovernance,
    ProposalCreation: CreateProcessFormProposalCreation,
    Permissions: CreateProcessFormPermissions,
};

export * from './createProcessFormDefinitions';
export * from './createProcessFormGovernance';
export * from './createProcessFormMetadata';
export * from './createProcessFormPermissions';
export * from './createProcessFormProposalCreation';
export { createProcessFormUtils } from './createProcessFormUtils';
