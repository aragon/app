import { CreatePolicyFormConfigure } from './createPolicyFormConfigure';
import { CreatePolicyFormInterval } from './createPolicyFormInterval';
import { CreatePolicyFormMetadata } from './createPolicyFormMetadata';

export const CreatePolicyForm = {
    Metadata: CreatePolicyFormMetadata,
    Configure: CreatePolicyFormConfigure,
    Interval: CreatePolicyFormInterval,
};

export * from './createPolicyFormConfigure';
export * from './createPolicyFormDefinitions';
export * from './createPolicyFormInterval';
export * from './createPolicyFormMetadata';
