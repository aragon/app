import type { IProposalCreate } from '../../dialogs/publishProposalDialog';
import { generateCreateProposalFormData } from './createProposalFormData';

export const generateProposalCreate = (proposal?: Partial<IProposalCreate>): IProposalCreate => ({
    ...generateCreateProposalFormData(),
    actions: [],
    ...proposal,
});
