import { type ProposalActionType } from '@/modules/governance/api/governanceService/domain/enum';
import { type IProposalActionTokenMint as OdsIProposalActionTokenMint } from '@aragon/ods';

export interface IProposalActionTokenMint extends Omit<OdsIProposalActionTokenMint, 'type' | 'receivers'> {
    type: ProposalActionType.MINT;
    receivers: {
        address: string;
        currentBalance: number;
        newBalance: number;
    };
}
