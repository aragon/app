import { GovernanceDialogs } from '@/modules/governance/constants/moduleDialogs';
import type { IVoteDialogParams } from '@/modules/governance/dialogs/voteDialog';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, Card, RadioCard, RadioGroup, type VoteIndicator } from '@aragon/ods';
import { useState } from 'react';
import { type ITokenProposal, VoteOption } from '../../types';

export interface ITokenSubmitVoteProps {
    /**
     * ID of the DAO to create the proposal for.
     */
    daoId: string;
    /**
     * Proposal to submit the vote for.
     */
    proposal: ITokenProposal;
    /**
     *  Is the vote to approve or veto
     */
    isVeto?: boolean;
}

export const TokenSubmitVote: React.FC<ITokenSubmitVoteProps> = (props) => {
    const { daoId, proposal, isVeto } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const [showOptions, setShowOptions] = useState(false);
    const [selectedOption, setSelectedOption] = useState('');

    const abstainLabel = t('app.plugins.token.tokenSubmitVote.options.abstain');
    const yesLabel = t('app.plugins.token.tokenSubmitVote.options.yes');
    const noLabel = t('app.plugins.token.tokenSubmitVote.options.no');

    const voteOptionToIndicator: Record<string, VoteIndicator> = {
        [VoteOption.YES.toString()]: 'yes',
        [VoteOption.ABSTAIN.toString()]: 'abstain',
        [VoteOption.NO.toString()]: 'no',
    };

    const openTransactionDialog = () => {
        const vote = { value: Number(selectedOption), label: voteOptionToIndicator[selectedOption] };
        const params: IVoteDialogParams = { daoId, proposal, vote, isVeto };
        open(GovernanceDialogs.VOTE, { params });
    };

    const onCancel = () => {
        setSelectedOption('');
        setShowOptions(false);
    };

    return (
        <div className="flex flex-col gap-4 pt-4">
            {!showOptions && (
                <Button className="w-fit" size="md" onClick={() => setShowOptions(true)}>
                    {t('app.plugins.token.tokenSubmitVote.buttons.default')}
                </Button>
            )}
            {showOptions && (
                <Card className="border border-neutral-100 p-6 shadow-neutral-sm">
                    <RadioGroup
                        label={t('app.plugins.token.tokenSubmitVote.options.label', {
                            label: isVeto ? 'veto' : 'approve',
                        })}
                        value={selectedOption}
                        onValueChange={setSelectedOption}
                    >
                        <RadioCard label={yesLabel} description="" value={VoteOption.YES.toString()} />
                        <RadioCard label={abstainLabel} description="" value={VoteOption.ABSTAIN.toString()} />
                        <RadioCard label={noLabel} description="" value={VoteOption.NO.toString()} />
                    </RadioGroup>
                </Card>
            )}
            {showOptions && (
                <div className="flex gap-4">
                    <Button onClick={openTransactionDialog} disabled={!selectedOption} size="md" variant="primary">
                        {t('app.plugins.token.tokenSubmitVote.buttons.submit')}
                    </Button>
                    <Button size="md" variant="tertiary" onClick={onCancel}>
                        {t('app.plugins.token.tokenSubmitVote.buttons.cancel')}
                    </Button>
                </div>
            )}
        </div>
    );
};
