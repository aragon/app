import { CreatePolicyFormConfigure } from './createPolicyFormConfigure';
import { CreatePolicyFormMetadata } from './createPolicyFormMetadata';

export const CreatePolicyForm = {
    Metadata: CreatePolicyFormMetadata,
    Configure: CreatePolicyFormConfigure,
    Strategy: CreatePolicyFormMetadata,
};

export * from './createPolicyFormConfigure';
export * from './createPolicyFormDefinitions';
export * from './createPolicyFormMetadata';
