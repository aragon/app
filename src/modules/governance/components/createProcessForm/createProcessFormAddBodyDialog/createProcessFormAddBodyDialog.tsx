import {
    AddressInput,
    Button,
    Card,
    Dialog,
    InputContainer,
    InputNumber,
    InputText,
    RadioCard,
    RadioGroup,
} from '@aragon/ods';
import { useEffect, useState } from 'react';

export interface ICreateProcessFormBodyValues {
    /**
     * The name of the body.
     */
    name: string;
    /**
     * The governance type of the body.
     */
    governanceType: string;
}

export interface ICreateProcessFormAddBodyDialogProps {
    /**
     * Whether the dialog is open or not.
     */
    isBodyDialogOpen: boolean;
    /**
     * Callback to set the dialog open state.
     */
    setIsBodyDialogOpen: (value: boolean) => void;
    /**
     * Callback to save the body values.
     */
    handleSaveBodyValues: (value: ICreateProcessFormBodyValues) => void;
    /**
     * The body name field.
     */
    bodyNameField: any;
    /**
     * The body governance type field.
     */
    bodyGovernanceTypeField: any;
}

export const CreateProcessFormAddBodyDialog: React.FC<ICreateProcessFormAddBodyDialogProps> = (props) => {
    const { bodyNameField, handleSaveBodyValues, bodyGovernanceTypeField } = props;
    const [step, setStep] = useState(0);
    const { isBodyDialogOpen, setIsBodyDialogOpen } = props;
    const [bodyName, setBodyName] = useState('');
    const [bodyGovernanceType, setBodyGovernanceType] = useState('tokenVoting');

    useEffect(() => {
        if (isBodyDialogOpen) {
            setBodyName('');
            setBodyGovernanceType('tokenVoting');
        }
    }, [isBodyDialogOpen, bodyNameField.value, bodyGovernanceTypeField.value]);

    const handleSave = () => {
        handleSaveBodyValues({
            name: bodyName,
            governanceType: bodyGovernanceType,
        });
        setStep(0);
        setIsBodyDialogOpen(false);
    };

    const handleStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <>
                        <InputText
                            placeholder="Enter a name"
                            helpText="Give modules a name so members are able to recognise which body is participating."
                            value={bodyName}
                            onChange={(e) => setBodyName(e.target.value)}
                        />
                        <RadioGroup
                            className="flex gap-4"
                            helpText="What kind of governance would you like to add?"
                            value={bodyGovernanceType}
                            onValueChange={setBodyGovernanceType}
                        >
                            <RadioCard
                                className="w-full"
                                label="Token voting"
                                description="Create or import an ERC-20 token"
                                value="tokenVoting"
                            />
                            <RadioCard
                                className="w-full"
                                label="Multisig"
                                description="Define which addresses are members"
                                value="multisig"
                                disabled={true}
                            />
                            <RadioCard
                                className="w-full"
                                label="Admin"
                                description="Define a single address as member"
                                value="admin"
                                disabled={true}
                            />
                            <RadioCard
                                className="w-full"
                                label="External address"
                                description="Define any kind of external EVM address"
                                value="external"
                                disabled={true}
                            />
                        </RadioGroup>
                    </>
                );
            case 1:
                return (
                    <>
                        <RadioGroup
                            className="flex gap-4 md:!flex-row"
                            label="ERC20 token"
                            helpText="Import or create a new ERC-20 token, which is used for this Token Voting Plugin"
                            value="createToken"
                        >
                            <RadioCard className="w-full" label="Import token" description="" value="importToken" />
                            <RadioCard className="w-full" label="Create new token" description="" value="createToken" />
                        </RadioGroup>
                        <InputText
                            label="Name"
                            placeholder="Enter a name"
                            helpText="The full name of the token. For example:Uniswap"
                        />
                        <InputText
                            label="Symbol"
                            placeholder="Enter a symbol"
                            helpText="The abbreviation of the token. For example: UNI"
                        />
                        <InputContainer
                            id="distribute"
                            label="Distribute Tokens"
                            helpText="Add the wallets you’d like to distribute tokens to, If you need help distributing tokens, read our guide."
                            useCustomWrapper={true}
                        >
                            <div className="flex gap-4 rounded-xl border border-neutral-100 p-6">
                                <AddressInput
                                    className="flex-grow"
                                    label="Address"
                                    value="0x32c2FE388ABbB3e678D44DF6a0471086D705316a"
                                />
                                <InputNumber label="Tokens" value={5} />
                            </div>
                        </InputContainer>
                    </>
                );
            case 2:
                return <Card className="p-6">STEP 3</Card>;
            default:
                return <></>;
        }
    };

    return (
        <Dialog.Root
            containerClassName="!max-w-[640px]"
            open={isBodyDialogOpen}
            onOpenChange={() => setIsBodyDialogOpen(false)}
        >
            <Dialog.Header title="Add voting body" />
            <Dialog.Content className="flex flex-col gap-6">
                {handleStepContent(step)}
                <div className="flex w-full justify-between">
                    <Button
                        variant="tertiary"
                        onClick={step === 0 ? () => setIsBodyDialogOpen(false) : () => setStep(step - 1)}
                    >
                        {step === 0 ? 'Cancel' : 'Back'}
                    </Button>
                    <Button onClick={step === 2 ? handleSave : () => setStep(step + 1)}>
                        {step === 2 ? 'Save' : 'Next'}
                    </Button>
                </div>
            </Dialog.Content>
            <Dialog.Footer />
        </Dialog.Root>
    );
};
