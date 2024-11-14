import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { TokenProposalActionType } from './enum/tokenProposalActionType';

export interface ITokenProposalAction extends IProposalAction<TokenProposalActionType> {}
