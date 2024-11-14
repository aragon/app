import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { MultisigProposalActionType } from './enum';

export interface IMultisigProposalAction extends IProposalAction<MultisigProposalActionType> {}
