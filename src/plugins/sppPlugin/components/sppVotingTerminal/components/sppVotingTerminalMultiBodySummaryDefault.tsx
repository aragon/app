import { type ISppProposal, type ISppStage } from '@/plugins/sppPlugin/types';
import { sppProposalUtils } from '@/plugins/sppPlugin/utils/sppProposalUtils';
import { sppStageUtils } from '@/plugins/sppPlugin/utils/sppStageUtils';
import { useTranslations } from '@/shared/components/translationsProvider';
import { addressUtils, ProposalStatus } from '@aragon/gov-ui-kit';
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

    const subProposal = sppStageUtils.getBodySubProposal(proposal, body, stage.stageIndex);

    const stageStatus = sppStageUtils.getStageStatus(proposal, stage);
    const { label, style } = sppProposalUtils.getBodyResultStatus({ proposal, body, stage, canVote });

    if (stageStatus === ProposalStatus.PENDING) {
        return (
            <p className="text-base leading-tight font-normal text-neutral-800 md:text-lg">
                {ensName ?? addressUtils.truncateAddress(body)}
            </p>
        );
    }

    return (
        <p className="text-base leading-tight font-normal text-neutral-800 md:text-lg">
            {ensName ?? addressUtils.truncateAddress(body)}{' '}
            <span className={classNames(style, 'lowercase')}>{t(label)}</span>
        </p>
    );
};
