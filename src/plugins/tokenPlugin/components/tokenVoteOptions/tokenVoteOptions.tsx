import { GovernanceDialogs } from '@/modules/governance/constants/moduleDialogs';
import type { IVoteOnProposalDialogParams } from '@/modules/governance/dialogs/voteOnProposalDialog';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, Card, RadioCard, RadioGroup } from '@aragon/ods';
import { useState } from 'react';

export interface ITokenVoteOptionsProps {
    /**
     * ID of the DAO to create the proposal for.
     */
    daoId: string;
}

export const TokenVoteOptions: React.FC<ITokenVoteOptionsProps> = (props) => {
    const { t } = useTranslations();
    const { daoId } = props;
    const [showOptions, setShowOptions] = useState(false);
    const [selectedOption, setSelectedOption] = useState('');

    const { open } = useDialogContext();

    const onCancel = () => {
        setSelectedOption('');
        setShowOptions(false);
    };

    const handleOpenDialog = () => {
        const params: IVoteOnProposalDialogParams = { daoId };
        open(GovernanceDialogs.VOTE_ON_PROPOSAL, { params });
    };

    return (
        <div className="flex flex-col gap-4 pt-4">
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
                            value="yes"
                        />
                        <RadioCard
                            label={t('app.plugins.token.tokenVoteOptions.options.abstain')}
                            description=""
                            value="abstain"
                        />
                        <RadioCard
                            label={t('app.plugins.token.tokenVoteOptions.options.no')}
                            description=""
                            value="no"
                        />
                    </RadioGroup>
                </Card>
            )}
            {!showOptions && (
                <Button className="w-fit" onClick={() => setShowOptions(true)}>
                    {t('app.plugins.token.tokenVoteOptions.button')}
                </Button>
            )}

            {showOptions && (
                <div className="flex gap-4">
                    <Button onClick={handleOpenDialog} disabled={!selectedOption} size="md" variant="primary">
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
