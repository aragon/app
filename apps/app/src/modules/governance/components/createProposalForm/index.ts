import { CreateProposalFormActions } from './createProposalFormActions';
import { CreateProposalFormMetadata } from './createProposalFormMetadata';
import { CreateProposalFormProvider } from './createProposalFormProvider';
import { CreateProposalFormSettings } from './createProposalFormSettings';

export const CreateProposalForm = {
    Actions: CreateProposalFormActions,
    Metadata: CreateProposalFormMetadata,
    Settings: CreateProposalFormSettings,
    Provider: CreateProposalFormProvider,
};

export * from './createProposalFormActions';
export type * from './createProposalFormDefinitions';
export * from './createProposalFormMetadata';
export * from './createProposalFormProvider';
export * from './createProposalFormSettings';
