'use client';

import {
    ChainEntityType,
    type IProposalAction,
    type IProposalActionComponentProps,
    MemberDataListItemStructure,
} from '@aragon/gov-ui-kit';
import { formatUnits } from 'viem';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import type { ITokenActionTokenMint } from '@/plugins/tokenPlugin/types';
import { useDaoChain } from '@/shared/hooks/useDaoChain';

export interface ITokenMintActionDetailsProps
    extends IProposalActionComponentProps<
        IProposalActionData<IProposalAction>
    > {}

export const TokenMintActionDetails: React.FC<ITokenMintActionDetailsProps> = (
    props,
) => {
    const { action, chainId } = props;

    const { token, receivers } = action as unknown as ITokenActionTokenMint;
    const { address, currentBalance, newBalance } = receivers;

    const { buildEntityUrl } = useDaoChain({ chainId, daoId: action.daoId });
    const receiverUrl = buildEntityUrl({
        type: ChainEntityType.ADDRESS,
        id: address,
    });

    // Subtract the raw balances before formatting, so large amounts keep their full precision.
    const mintedAmount = formatUnits(
        BigInt(newBalance) - BigInt(currentBalance),
        token.decimals,
    );

    return (
        <div className="flex w-full flex-col gap-8">
            <MemberDataListItemStructure
                address={address}
                className="w-full"
                hideLabelTokenVoting={true}
                href={receiverUrl}
                target="_blank"
                tokenAmount={mintedAmount}
                tokenSymbol={token.symbol}
            />
        </div>
    );
};
