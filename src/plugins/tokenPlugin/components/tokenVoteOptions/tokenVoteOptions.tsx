import { GovernanceDialogs } from '@/modules/governance/constants/moduleDialogs';
import type { IVoteDialogParams } from '@/modules/governance/dialogs/voteDialog';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, Card, RadioCard, RadioGroup } from '@aragon/ods';
import { useState } from 'react';
import { VoteOption } from '../../types';

export interface ITokenVoteOptionsProps {
    /**
     * ID of the DAO to create the proposal for.
     */
    daoId: string;
    /**
     * ID of proposal
     */
    proposalId: string;
    /**
     * The title of the proposal
     */
    title: string;
    /**
     * Summary of the proposal
     */
    summary: string;
}

export const TokenVoteOptions: React.FC<ITokenVoteOptionsProps> = (props) => {
    const { t } = useTranslations();
    const { daoId, title, summary, proposalId } = props;
    const [showOptions, setShowOptions] = useState(false);
    const [selectedOption, setSelectedOption] = useState('');

    const { open } = useDialogContext();

    const onCancel = () => {
        setSelectedOption('');
        setShowOptions(false);
    };

    const openTransactionDialog = () => {
        const params: IVoteDialogParams = {
            daoId,
            values: { voteOption: selectedOption, title, summary, proposalId },
        };
        open(GovernanceDialogs.VOTE, { params });
    };

    return (
        <div className="flex flex-col gap-4 pt-4">
            {!showOptions && (
                <Button className="w-fit" onClick={() => setShowOptions(true)}>
                    {t('app.plugins.token.tokenVoteOptions.buttons.default')}
                </Button>
            )}
            {showOptions && (
                <Card className="border border-neutral-100 p-6 shadow-neutral-sm">
                    <RadioGroup
                        label={t('app.plugins.token.tokenVoteOptions.options.label')}
                        value={selectedOption}
                        onValueChange={setSelectedOption}
                    >
                        <RadioCard
                            label={t('app.plugins.token.tokenVoteOptions.options.yes')}
                            description=""
                            value={VoteOption.YES.toString()}
                        />
                        <RadioCard
                            label={t('app.plugins.token.tokenVoteOptions.options.abstain')}
                            description=""
                            value={VoteOption.ABSTAIN.toString()}
                        />
                        <RadioCard
                            label={t('app.plugins.token.tokenVoteOptions.options.no')}
                            description=""
                            value={VoteOption.NO.toString()}
                        />
                    </RadioGroup>
                </Card>
            )}
            {showOptions && (
                <div className="flex gap-4">
                    <Button onClick={openTransactionDialog} disabled={!selectedOption} size="md" variant="primary">
                        {t('app.plugins.token.tokenVoteOptions.options.buttons.submit')}
                    </Button>
                    <Button size="md" variant="tertiary" onClick={onCancel}>
                        {t('app.plugins.token.tokenVoteOptions.options.buttons.cancel')}
                    </Button>
                </div>
            )}
        </div>
    );
};
