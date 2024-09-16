import { GovernanceDialogs } from '@/modules/governance/constants/moduleDialogs';
import { type ISubmitVoteParams } from '@/modules/governance/dialogs/submitVoteDialog';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Button, Card, RadioCard, RadioGroup } from '@aragon/ods';
import { useState } from 'react';

export interface ITokenVoteOptionsProps {
    /**
     * ID of the DAO to create the proposal for.
     */
    daoId: string;
}

export const TokenVoteOptions: React.FC<ITokenVoteOptionsProps> = (props) => {
    const { daoId } = props;
    const [showOptions, setShowOptions] = useState(false);
    const [selectedOption, setSelectedOption] = useState('');

    const { open } = useDialogContext();

    const onCancel = () => {
        setSelectedOption('');
        setShowOptions(false);
    };

    const handleOpenDialog = () => {
        const params: ISubmitVoteParams = { daoId };
        open(GovernanceDialogs.VOTE_ON_PROPOSAL, { params });
    };

    return (
        <div className="flex flex-col gap-4 pt-4">
            {showOptions && (
                <Card className="border border-neutral-100 p-6 shadow-neutral-sm">
                    <RadioGroup label="Choose your option" value={selectedOption} onValueChange={setSelectedOption}>
                        <RadioCard label="Yes" description="" value="yes" />
                        <RadioCard label="Abstain" description="" value="abstain" />
                        <RadioCard label="No" description="" value="no" />
                    </RadioGroup>
                </Card>
            )}
            {!showOptions && (
                <Button className="w-fit" onClick={() => setShowOptions(true)}>
                    Vote on proposal
                </Button>
            )}

            {showOptions && (
                <div className="flex gap-4">
                    <Button onClick={handleOpenDialog} disabled={!selectedOption} size="md" variant="primary">
                        Submit vote
                    </Button>
                    <Button size="md" variant="tertiary" onClick={onCancel}>
                        Cancel
                    </Button>
                </div>
            )}
        </div>
    );
};
