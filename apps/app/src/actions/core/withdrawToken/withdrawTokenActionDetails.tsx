'use client';

import {
    AssetTransfer,
    type IProposalAction,
    type IProposalActionComponentProps,
} from '@aragon/gov-ui-kit';
import { formatUnits } from 'viem';
import type { IProposalActionWithdrawToken } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';

export interface IWithdrawTokenActionDetailsProps
    extends IProposalActionComponentProps<
        IProposalActionData<IProposalAction>
    > {}

export const WithdrawTokenActionDetails: React.FC<
    IWithdrawTokenActionDetailsProps
> = (props) => {
    // Only chainId is forwarded: the app never sets wagmiConfig on ProposalActions.Item, and AssetTransfer falls back
    // to the global wagmi config, which is the same one, to build block-explorer links.
    const { action, chainId } = props;

    const { sender, receiver, amount, token } =
        action as unknown as IProposalActionWithdrawToken;

    const parsedAmount = formatUnits(BigInt(amount), token.decimals);

    return (
        <AssetTransfer
            assetAddress={token.address}
            assetAmount={parsedAmount}
            assetFiatPrice={token.priceUsd}
            assetIconSrc={token.logo}
            assetName={token.name}
            assetSymbol={token.symbol}
            chainId={chainId}
            recipient={receiver}
            sender={sender}
        />
    );
};
