import { type ProposalActionType } from '@/modules/governance/api/governanceService/domain/enum';
import { type IProposalActionTokenMint as OdsIProposalActionTokenMint } from '@aragon/ods';

export interface IProposalActionTokenMint extends Omit<OdsIProposalActionTokenMint, 'type'> {
    type: ProposalActionType.MINT;
}
