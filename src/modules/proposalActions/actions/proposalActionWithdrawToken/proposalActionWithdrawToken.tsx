import { type IProposalActionWithdrawToken } from '@/modules/proposalActions/proposalActionTypes/proposalActionTokenWithdraw';
import { AssetTransfer } from '@aragon/ods';

interface ProposalActionWithdrawTokenProps {
    action: IProposalActionWithdrawToken;
}

export const ProposalActionWithdrawToken: React.FC<ProposalActionWithdrawTokenProps> = ({ action }) => {
    return (
        <AssetTransfer
            sender={action.sender}
            recipient={action.receiver}
            assetName={action.token.name}
            assetAmount={action.amount}
            assetSymbol={action.token.symbol}
            hash={''}
        />
    );
};
