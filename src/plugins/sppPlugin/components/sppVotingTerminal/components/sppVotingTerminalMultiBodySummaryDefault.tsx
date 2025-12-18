import { addressUtils, ProposalStatus } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { Hex } from 'viem';
import { mainnet } from 'viem/chains';
import { useEnsName } from 'wagmi';
import type { ISppProposal, ISppStage } from '@/plugins/sppPlugin/types';
import { sppProposalUtils } from '@/plugins/sppPlugin/utils/sppProposalUtils';
import { sppStageUtils } from '@/plugins/sppPlugin/utils/sppStageUtils';
import { useTranslations } from '@/shared/components/translationsProvider';

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

export const SppVotingTerminalMultiBodySummaryDefault: React.FC<ISppVotingTerminalMultiBodySummaryDefaultProps> = (props) => {
    const { proposal, body, stage, canVote } = props;

    const { t } = useTranslations();
    const { data: ensName } = useEnsName({ address: body as Hex, chainId: mainnet.id });

    const stageStatus = sppStageUtils.getStageStatus(proposal, stage);
    const displayName = ensName ?? addressUtils.truncateAddress(body);
    const showStatus = stageStatus !== ProposalStatus.PENDING;
    const { label, style } = sppProposalUtils.getBodyResultStatus({ proposal, body, stage, canVote });

    return (
        <p className="font-normal text-base text-neutral-800 leading-tight md:text-lg">
            {displayName}
            {showStatus && <span className={classNames(style, 'lowercase')}> {t(label)}</span>}
        </p>
    );
};
