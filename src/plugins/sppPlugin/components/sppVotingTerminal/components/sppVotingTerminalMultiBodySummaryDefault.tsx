import { type ISppProposal, type ISppStage } from '@/plugins/sppPlugin/types';
import { sppProposalUtils } from '@/plugins/sppPlugin/utils/sppProposalUtils';
import { useTranslations } from '@/shared/components/translationsProvider';
import { addressUtils } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { Hex } from 'viem';
import { mainnet } from 'viem/chains';
import { useEnsName } from 'wagmi';

export interface ISppVotingTerminalMultiBodySummaryDefaultProps {
    /**
     * Proposal to be used to display the breakdown.
     */
    proposal: ISppProposal;
    /**
     * Address of the body.
     */
    body: string;
    /**
     * Stage on which external body is located.
     */
    stage: ISppStage;
    /**
     * Flag indicating if the user can vote (proposal is in the Active state).
     */
    canVote: boolean;
}

export const SppVotingTerminalMultiBodySummaryDefault: React.FC<ISppVotingTerminalMultiBodySummaryDefaultProps> = (
    props,
) => {
    const { proposal, body, stage, canVote } = props;

    const { t } = useTranslations();
    const { data: ensName } = useEnsName({ address: body as Hex, chainId: mainnet.id });

    const { label, style } = sppProposalUtils.getBodyResultStatus({ proposal, body, stage, canVote });

    return (
        <p>
            {ensName ?? addressUtils.truncateAddress(body)}{' '}
            <span className={classNames(style, 'lowercase')}>{t(label)}</span>
        </p>
    );
};
