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
import { useState } from 'react';

export interface ICreateProcessFormAddBodyDialogProps {
    isBodyDialogOpen: boolean;
    setIsBodyDialogOpen: (value: boolean) => void;
    handleSaveBodyValues: (value: any) => void;
    bodyNameField: any;
    bodyGovernanceTypeField: any;
}

export interface ICreateProcessFormBodyValues {
    name: string;
    governanceType: string;
}

export const CreateProcessFormAddBodyDialog: React.FC<ICreateProcessFormAddBodyDialogProps> = (props) => {
    const { bodyNameField, handleSaveBodyValues, bodyGovernanceTypeField } = props;
    const [step, setStep] = useState(0);
    const { isBodyDialogOpen, setIsBodyDialogOpen } = props;

    const [addressInput, setAddressInput] = useState<string | undefined>('');

    const handleStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <>
                        <InputText
                            placeholder="Enter a name"
                            helpText="Give modules a name so members are able to recognise which body is participating."
                            {...bodyNameField}
                        />
                        <RadioGroup
                            className="flex gap-4"
                            helpText="What kind of governance would you like to add?"
                            onValueChange={bodyGovernanceTypeField.onChange}
                            {...bodyGovernanceTypeField}
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
                                    value={addressInput}
                                    onChange={setAddressInput}
                                    className="flex-grow"
                                    label="Address"
                                    placeholder="Enter ENS or address"
                                    chainId={1}
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
                    <Button
                        onClick={
                            step === 2
                                ? () => {
                                      handleSaveBodyValues({
                                          name: bodyNameField.value,
                                          governanceType: bodyGovernanceTypeField.value,
                                      });
                                      setStep(0);
                                  }
                                : () => setStep(step + 1)
                        }
                    >
                        {step === 2 ? 'Save' : 'Next'}
                    </Button>
                </div>
            </Dialog.Content>
            <Dialog.Footer />
        </Dialog.Root>
    );
};
