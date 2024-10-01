/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
    ICreateProcessFormBody,
    ITokenVotingMember,
} from '@/modules/governance/components/createProcessForm/createProcessFormDefinitions';
import {
    AddressInput,
    Button,
    Card,
    Dialog,
    Dropdown,
    IconType,
    InputContainer,
    InputNumber,
    InputText,
    RadioCard,
    RadioGroup,
} from '@aragon/ods';
import type React from 'react';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

export interface ICreateProcessFormAddBodyDialogProps {
    isBodyDialogOpen: boolean;
    setIsBodyDialogOpen: (value: boolean) => void;
    handleSaveBodyValues: (value: ICreateProcessFormBody) => void;
    bodyNameField: any;
    bodyGovernanceTypeField: any;
    stageIndex: number;
    bodyIndex: number;
    tokenNameField: any;
    tokenSymbolField: any;
}

export const CreateProcessFormAddBodyDialog: React.FC<ICreateProcessFormAddBodyDialogProps> = (props) => {
    const {
        bodyNameField,
        bodyIndex,
        handleSaveBodyValues,
        bodyGovernanceTypeField,
        tokenNameField,
        tokenSymbolField,
    } = props;
    const [step, setStep] = useState(0);
    const { isBodyDialogOpen, setIsBodyDialogOpen } = props;
    const { resetField } = useFormContext();
    const [members, setMembers] = useState<ITokenVotingMember[]>([{ address: '', tokenAmount: 1 }]);

    const handleSave = () => {
        handleSaveBodyValues({
            bodyName: bodyNameField.value,
            governanceType: bodyGovernanceTypeField.value,
            tokenName: tokenNameField.value,
            tokenSymbol: tokenSymbolField.value,
            members,
        });

        resetField(`bodies.${bodyIndex}.members`);
        resetField(bodyNameField.name);
        resetField(bodyGovernanceTypeField.name);
        resetField(tokenNameField.name);
        resetField(tokenSymbolField.name);

        setMembers([{ address: '', tokenAmount: 1 }]);

        setStep(0);
        setIsBodyDialogOpen(false);
    };

    const handleCancel = () => {
        resetField(`bodies.${bodyIndex}.addresses`);
        resetField(bodyNameField.name);
        resetField(bodyGovernanceTypeField.name);
        resetField(tokenNameField.name);
        resetField(tokenSymbolField.name);

        setMembers([{ address: '', tokenAmount: 1 }]);

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
                            helpText="The full name of the token. For example: Uniswap"
                            {...tokenNameField}
                        />
                        <InputText
                            maxLength={10}
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
                            {members.map((member, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-4 rounded-xl border border-neutral-100 p-6"
                                >
                                    <AddressInput
                                        className="grow"
                                        label="Address"
                                        placeholder="ENS or 0x…"
                                        chainId={1}
                                        value={member.address}
                                        onChange={(value) => {
                                            const newMembers = [...members];
                                            newMembers[index].address = value ?? '';
                                            setMembers(newMembers);
                                        }}
                                    />
                                    <InputNumber
                                        label="Tokens"
                                        suffix={tokenSymbolField.value}
                                        min={1}
                                        value={member.tokenAmount}
                                        onChange={(value) => {
                                            const newMembers = [...members];
                                            newMembers[index].tokenAmount = value;
                                            setMembers(newMembers);
                                        }}
                                    />
                                    <Dropdown.Container
                                        customTrigger={
                                            <Button
                                                variant="tertiary"
                                                iconLeft={IconType.DOTS_VERTICAL}
                                                className="self-end"
                                            />
                                        }
                                    >
                                        <Dropdown.Item
                                            onClick={() => {
                                                const newMembers = members.filter((_, i) => i !== index);
                                                setMembers(newMembers);
                                            }}
                                        >
                                            Remove
                                        </Dropdown.Item>
                                    </Dropdown.Container>
                                </div>
                            ))}
                        </InputContainer>
                        <div className="flex w-full justify-between">
                            <Button
                                size="md"
                                variant="tertiary"
                                iconLeft={IconType.PLUS}
                                onClick={() => setMembers([...members, { address: '', tokenAmount: 1 }])}
                            >
                                Add
                            </Button>
                        </div>
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
            <Dialog.Content className="flex flex-col gap-6 pb-1.5">
                {handleStepContent(step)}
                <div className="flex w-full justify-between">
                    <Button variant="tertiary" onClick={step === 0 ? handleCancel : () => setStep(step - 1)}>
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
