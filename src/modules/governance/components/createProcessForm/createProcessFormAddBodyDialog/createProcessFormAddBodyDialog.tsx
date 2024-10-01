/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
    ICreateProcessFormBody,
    ITokenVotingMember,
} from '@/modules/governance/components/createProcessForm/createProcessFormDefinitions';
import {
    AddressInput,
    AlertInline,
    Button,
    Card,
    Dialog,
    Dropdown,
    IconType,
    InputContainer,
    InputNumber,
    InputText,
    Progress,
    RadioCard,
    RadioGroup,
    Switch,
    Tag,
} from '@aragon/ods';
import type React from 'react';
import { useEffect, useState } from 'react';
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
    initialValues?: ICreateProcessFormBody | null;
}

export const CreateProcessFormAddBodyDialog: React.FC<ICreateProcessFormAddBodyDialogProps> = (props) => {
    const {
        bodyNameField,
        bodyIndex,
        handleSaveBodyValues,
        bodyGovernanceTypeField,
        tokenNameField,
        tokenSymbolField,
        initialValues,
    } = props;
    const [step, setStep] = useState(0);
    const { isBodyDialogOpen, setIsBodyDialogOpen } = props;
    const { resetField, setValue } = useFormContext();
    const [members, setMembers] = useState<ITokenVotingMember[]>([{ address: '', tokenAmount: 1 }]);

    useEffect(() => {
        if (isBodyDialogOpen && initialValues) {
            setStep(0);
            setValue(bodyNameField.name, initialValues.bodyName);
            setValue(bodyGovernanceTypeField.name, initialValues.governanceType);
            setValue(tokenNameField.name, initialValues.tokenName);
            setValue(tokenSymbolField.name, initialValues.tokenSymbol);
            if (initialValues.members) {
                setMembers(initialValues.members);
            }
        } else if (isBodyDialogOpen) {
            resetField(bodyNameField.name);
            resetField(bodyGovernanceTypeField.name);
            resetField(tokenNameField.name);
            resetField(tokenSymbolField.name);
            setMembers([{ address: '', tokenAmount: 1 }]);
        }
    }, [isBodyDialogOpen]);

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
                return (
                    <div className="flex flex-col gap-y-6">
                        <InputContainer
                            id="threshold"
                            label="Support threshold"
                            helpText={`The percentage of tokens that vote "Yes" in support of a proposal, out of all tokens that have voted, must be greater than this value for the proposal to pass.`}
                            useCustomWrapper={true}
                        >
                            <Card className="flex flex-col gap-y-6 border border-neutral-100 p-6">
                                <div className="flex items-center justify-between gap-x-6">
                                    <InputNumber prefix=">" suffix="%" min={1} max={100} placeholder=">1%" />{' '}
                                    <div className="flex w-5/6 grow items-center gap-x-1">
                                        <Tag label="Yes" variant="primary" />
                                        <Progress value={50} thresholdIndicator={50} />
                                        <Tag label="No" variant="neutral" />
                                    </div>
                                </div>
                                <AlertInline variant="success" message="Proposal will be approved by majority" />
                            </Card>
                        </InputContainer>
                        <InputContainer
                            id="participation"
                            label="Minimum participation"
                            helpText={`The percentage of tokens that participate in a proposal, out of the total test supply, must be greater than or equal to this value for the proposal to pass.`}
                            useCustomWrapper={true}
                        >
                            <Card className="flex flex-col border border-neutral-100 p-6">
                                <div className="flex items-center justify-between gap-x-6">
                                    <InputNumber
                                        prefix=">"
                                        suffix="%"
                                        min={1}
                                        max={100}
                                        placeholder=">1%"
                                        className="max-w-fit shrink"
                                    />
                                    <div className="h-full w-5/6 grow flex-col gap-y-3">
                                        <p className="text-primary-400">TOKEN</p>
                                        <Progress value={50} />
                                        <p className="text-right">of TOTAL</p>
                                    </div>
                                </div>
                            </Card>
                        </InputContainer>
                        <InputContainer
                            id="duration"
                            label="Minimum duration"
                            useCustomWrapper={true}
                            helpText="The shortest period of time a proposal is open for voting. Proposals can be created with a longer duration, but not shorter."
                        >
                            <div className="flex flex-col space-y-6 rounded-xl border border-neutral-100 p-6">
                                <div className="flex flex-col justify-between gap-4 md:flex-row">
                                    <InputNumber min={0} max={59} className="w-full md:w-1/3" placeholder="0 min" />
                                    <InputNumber min={0} max={23} className="w-full md:w-1/3" placeholder="0 h" />
                                    <InputNumber min={0} className="w-full md:w-1/3" placeholder="7 d" />
                                </div>
                            </div>
                        </InputContainer>
                        <InputContainer
                            id="votechange"
                            label="Vote change"
                            useCustomWrapper={true}
                            helpText={`Allows voters to change their vote during the voting period. This setting can’t be enabled if early execution is enabled.`}
                        >
                            <Switch inlineLabel={true == true ? 'Yes' : 'No'} />
                        </InputContainer>
                    </div>
                );
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
