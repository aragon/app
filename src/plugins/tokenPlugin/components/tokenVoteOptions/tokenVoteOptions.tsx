import { Button, Card, RadioCard, RadioGroup } from '@aragon/ods';
import { useState } from 'react';

export interface ITokenVoteOptionsProps {}

export const TokenVoteOptions: React.FC<ITokenVoteOptionsProps> = () => {
    const [showOptions, setShowOptions] = useState(false);
    const [selectedOption, setSelectedOption] = useState('');

    const onCancel = () => {
        setSelectedOption('');
        setShowOptions(false);
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
                    <Button disabled={!selectedOption} size="md" variant="primary">
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
