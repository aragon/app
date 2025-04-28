import { useTranslations } from '@/shared/components/translationsProvider';
import { addressUtils } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { Hex } from 'viem';
import { mainnet } from 'viem/chains';
import { useEnsName } from 'wagmi';
import { type ISppProposal, type ISppStage } from '../../types';
import { sppProposalUtils } from '../../utils/sppProposalUtils';

export interface ISppVotingTerminalMultiBodySummaryDefaultProps {
    /**
     * Proposal to be used to display the breakdown.
     */
    proposal: ISppProposal;
    /**
     * External body address.
     */
    externalAddress: string;
    /**
     * Stage on which external body is located.
     */
    stage: ISppStage;
    /**
     * Defines if the voting is optimistic or not.
     */
    isOptimistic: boolean;
    /**
     * Flag indicating if the user can vote (proposal is in the Active state).
     */
    canVote: boolean;
}

export const SppVotingTerminalMultiBodySummaryDefault: React.FC<ISppVotingTerminalMultiBodySummaryDefaultProps> = (
    props,
) => {
    const { proposal, externalAddress, stage, canVote } = props;
    const { t } = useTranslations();
    const { data: ensName } = useEnsName({ address: externalAddress as Hex, chainId: mainnet.id });

    const { statusStyle, statusLabel } = sppProposalUtils.getBodyStatusLabelData({
        proposal,
        externalAddress,
        stage,
        canVote,
        t,
    });

    return (
        <p>
            {ensName ?? addressUtils.truncateAddress(externalAddress)}{' '}
            <span className={classNames(statusStyle.label, 'lowercase')}>{statusLabel}</span>
        </p>
    );
};
