/* eslint-disable @typescript-eslint/no-explicit-any */
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

export interface ICreateProcessFormBodyValues {
    /**
     * The name of the body.
     */
    name: string;
    /**
     * The governance type of the body.
     */
    governanceType: string;
    /**
     * The name of the token.
     */
    tokenName: string;
    /**
     * The symbol of the token.
     */
    tokenSymbol: string;
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
    /**
     * The token name field.
     */
    tokenNameField: any;
    /**
     * The token symbol field
     */
    tokenSymbolField: any;
}

export const CreateProcessFormAddBodyDialog: React.FC<ICreateProcessFormAddBodyDialogProps> = (props) => {
    const { bodyNameField, handleSaveBodyValues, bodyGovernanceTypeField, tokenNameField, tokenSymbolField } = props;
    const [step, setStep] = useState(0);
    const { isBodyDialogOpen, setIsBodyDialogOpen } = props;

    const handleSave = () => {
        handleSaveBodyValues({
            name: bodyNameField.value,
            governanceType: bodyGovernanceTypeField.value,
            tokenName: tokenNameField.value,
            tokenSymbol: tokenSymbolField.value,
        });
        setStep(0);
        setIsBodyDialogOpen(false);
    };

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
                            <RadioCard
                                disabled={true}
                                className="w-full"
                                label="Import token"
                                description=""
                                value="importToken"
                            />
                            <RadioCard className="w-full" label="Create new token" description="" value="createToken" />
                        </RadioGroup>
                        <InputText
                            placeholder="Enter a name"
                            helpText="The full name of the token. For example:Uniswap"
                            {...tokenNameField}
                        />
                        <InputText
                            placeholder="Enter a symbol"
                            helpText="The abbreviation of the token. For example: UNI"
                            {...tokenSymbolField}
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
                                    className="grow"
                                    label="Address"
                                    placeholder="ENS or 0x…"
                                    chainId={1}
                                />
                                <InputNumber label="Tokens" defaultValue={0} />
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
