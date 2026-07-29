import type { ICreateProposalFormData } from '../createProposalForm';

/**
 * Form data for the direct-execute wizard. Reuses the proposal form's `actions`
 * shape so both flows share a single source of truth for the action array.
 */
export type IExecuteActionsFormData = Pick<ICreateProposalFormData, 'actions'>;
