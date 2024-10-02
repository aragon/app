/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
    ICreateProcessFormBody,
    ITokenVotingMember,
} from '@/modules/governance/components/createProcessForm/createProcessFormDefinitions';
import { MemberInputRow } from '@/modules/governance/components/createProcessForm/memberInputRow/memberInputRow';
import {
    AlertInline,
    Button,
    Card,
    Dialog,
    formatterUtils,
    IconType,
    InputContainer,
    InputNumber,
    InputText,
    NumberFormat,
    Progress,
    RadioCard,
    RadioGroup,
    Switch,
    Tag,
} from '@aragon/ods';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

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
    supportThresholdPercentageField: any;
    minimumParticipationPercentageField: any;
    voteChangeField: any;
    initialValues?: ICreateProcessFormBody | null;
}

export const CreateProcessFormAddBodyDialog: React.FC<ICreateProcessFormAddBodyDialogProps> = (props) => {
    const {
        bodyNameField,
        handleSaveBodyValues,
        bodyGovernanceTypeField,
        tokenNameField,
        tokenSymbolField,
        supportThresholdPercentageField,
        minimumParticipationPercentageField,
        voteChangeField,
        initialValues,
    } = props;
    const [step, setStep] = useState(0);
    const { isBodyDialogOpen, setIsBodyDialogOpen } = props;
    const { resetField, setValue, formState, trigger } = useFormContext();
    const [members, setMembers] = useState<ITokenVotingMember[]>([{ address: '', tokenAmount: 1 }]);
    const [memberAddressInputValues, setMemberAddressInputValues] = useState<string[]>(members.map(() => ''));
    const [currentTotalTokenAmount, setCurrentTotalTokenAmount] = useState(0);
    const [formattedTotalTokenAmount, setFormattedTotalTokenAmount] = useState<string | null>();

    useEffect(() => {
        if (isBodyDialogOpen && initialValues) {
            setValue(bodyNameField.name, initialValues.bodyName);
            setValue(bodyGovernanceTypeField.name, initialValues.governanceType);
            setValue(tokenNameField.name, initialValues.tokenName);
            setValue(tokenSymbolField.name, initialValues.tokenSymbol);
            setValue(supportThresholdPercentageField.name, initialValues.supportThresholdPercentage);
            setValue(minimumParticipationPercentageField.name, initialValues.minimumParticipationPercentage);
            setValue(voteChangeField.name, initialValues.voteChange);
            if (initialValues.members) {
                setMembers(initialValues.members);
                setMemberAddressInputValues(initialValues.members.map((member) => member.address));
            }
        }
    }, [isBodyDialogOpen, initialValues]);

    const handleSave = () => {
        handleSaveBodyValues({
            bodyName: bodyNameField.value,
            governanceType: bodyGovernanceTypeField.value,
            tokenName: tokenNameField.value,
            tokenSymbol: tokenSymbolField.value,
            supportThresholdPercentage: supportThresholdPercentageField.value,
            minimumParticipationPercentage: minimumParticipationPercentageField.value,
            voteChange: voteChangeField.value,
            members,
        });

        resetField(bodyNameField.name);
        resetField(bodyGovernanceTypeField.name);
        resetField(tokenNameField.name);
        resetField(tokenSymbolField.name);
        resetField(supportThresholdPercentageField.name);
        resetField(minimumParticipationPercentageField.name);
        resetField(voteChangeField.name);

        setMembers([{ address: '', tokenAmount: 1 }]);

        setStep(0);
        setIsBodyDialogOpen(false);
    };

    const handleCancel = () => {
        resetField(bodyNameField.name);
        resetField(bodyGovernanceTypeField.name);
        resetField(tokenNameField.name);
        resetField(tokenSymbolField.name);
        resetField(supportThresholdPercentageField.name);
        resetField(minimumParticipationPercentageField.name);
        resetField(voteChangeField.name);

        setMembers([{ address: '', tokenAmount: 1 }]);

        setStep(0);
        setIsBodyDialogOpen(false);
    };

    const handleAdvanceStep = async () => {
        if (step === 0) {
            const complete = await trigger([bodyNameField.name, bodyGovernanceTypeField.name]);
            if (complete) {
                setStep(step + 1);
            }
            return undefined;
        }
        {
            if (step === 1) {
                const complete = await trigger([tokenNameField.name, tokenSymbolField.name]);
                const membersComplete = members.every((member) => member.address && member.tokenAmount);
                if (complete && membersComplete) {
                    setStep(step + 1);
                }
                return undefined;
            }
        }
        if (step === 2) {
            const complete = await trigger([
                supportThresholdPercentageField.name,
                minimumParticipationPercentageField.name,
                voteChangeField.name,
            ]);
            if (complete) {
                return handleSave();
            }
            return undefined;
        } else {
            return undefined;
        }
    };

    const handleAddMember = () => {
        setMembers([...members, { address: '', tokenAmount: 1 }]);
        setMemberAddressInputValues([...memberAddressInputValues, '']);
    };

    const handleRemoveMember = (indexToRemove: number) => {
        const newMembers = members.filter((_, i) => i !== indexToRemove);
        setMembers(newMembers);

        const newInputValues = memberAddressInputValues.filter((_, i) => i !== indexToRemove);
        setMemberAddressInputValues(newInputValues);
    };

    const currentSupportThresholdPercentage = useWatch({ name: supportThresholdPercentageField.name });

    useEffect(() => {
        const currentTotalTokenAmount = members.reduce((acc, member) => acc + Number(member.tokenAmount), 0);
        const formattedTotalTokenAmount = formatterUtils.formatNumber(currentTotalTokenAmount, {
            format: NumberFormat.TOKEN_AMOUNT_SHORT,
        });
        setCurrentTotalTokenAmount(currentTotalTokenAmount);
        setFormattedTotalTokenAmount(formattedTotalTokenAmount);
    }, [members]);

    const formattedPercentageParticipation = formatterUtils.formatNumber(
        currentTotalTokenAmount * minimumParticipationPercentageField.value * 0.01,
        {
            format: NumberFormat.TOKEN_AMOUNT_SHORT,
        },
    );

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
                            alert={
                                members.length === 0 ||
                                (members.length >= 1 &&
                                    !members.every((member) => member.address && member.tokenAmount))
                                    ? { message: 'Please add a valid address or ENS', variant: 'critical' }
                                    : undefined
                            }
                        >
                            {members.map((member, index) => (
                                <MemberInputRow
                                    key={index}
                                    index={index}
                                    member={member}
                                    memberAddressInputValues={memberAddressInputValues}
                                    setMemberAddressInputValues={setMemberAddressInputValues}
                                    setMembers={setMembers}
                                    tokenSymbol={tokenSymbolField.value}
                                    handleRemoveMember={handleRemoveMember}
                                />
                            ))}
                        </InputContainer>
                        <div className="flex w-full justify-between">
                            <Button size="md" variant="tertiary" iconLeft={IconType.PLUS} onClick={handleAddMember}>
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
                            helpText={`The percentage of tokens that vote "Yes" in support of a proposal, out of all tokens that have voted, must be greater than this value for the proposal to pass.`}
                            useCustomWrapper={true}
                            {...supportThresholdPercentageField}
                        >
                            <Card className="flex flex-col gap-y-6 border border-neutral-100 p-6">
                                <div className="flex items-center justify-between gap-x-6">
                                    <InputNumber
                                        prefix={supportThresholdPercentageField.value == 100 ? undefined : '>'}
                                        suffix="%"
                                        min={1}
                                        max={100}
                                        placeholder=">1%"
                                        {...supportThresholdPercentageField}
                                        label={undefined}
                                    />
                                    <div className="flex w-5/6 grow items-center gap-x-1">
                                        <Tag label="Yes" variant="primary" />
                                        <Progress
                                            value={currentSupportThresholdPercentage}
                                            thresholdIndicator={currentSupportThresholdPercentage}
                                        />
                                        <Tag label="No" variant="neutral" />
                                    </div>
                                </div>
                                {supportThresholdPercentageField.value >= 50 && (
                                    <AlertInline variant="success" message="Proposal will be approved by majority" />
                                )}
                            </Card>
                        </InputContainer>
                        <InputContainer
                            id="participation"
                            label="Minimum participation"
                            helpText={`The percentage of tokens that participate in a proposal, out of the total test supply, must be greater than or equal to this value for the proposal to pass.`}
                            useCustomWrapper={true}
                            {...minimumParticipationPercentageField}
                        >
                            <Card className="flex flex-col border border-neutral-100 p-6">
                                <div className="flex items-center justify-between gap-x-6">
                                    <InputNumber
                                        prefix={minimumParticipationPercentageField.value == 100 ? undefined : '>'}
                                        suffix="%"
                                        min={1}
                                        max={100}
                                        placeholder=">1%"
                                        className="max-w-fit shrink"
                                        {...minimumParticipationPercentageField}
                                        label={undefined}
                                    />
                                    <div className="h-full w-5/6 grow flex-col gap-y-3">
                                        <p className="text-primary-400">
                                            {formattedPercentageParticipation} {tokenSymbolField.value}
                                        </p>
                                        <Progress value={minimumParticipationPercentageField.value} />
                                        <p className="text-right">
                                            of {formattedTotalTokenAmount} {tokenSymbolField.value}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </InputContainer>
                        <Switch
                            helpText="Allows voters to change their vote during the voting period. This setting can’t be enabled if early execution is enabled."
                            inlineLabel={voteChangeField.value ? 'Yes' : 'No'}
                            onCheckedChanged={(checked) => setValue(voteChangeField.name, checked)}
                            checked={voteChangeField.value}
                            {...voteChangeField}
                        />
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
            onPointerDownOutside={handleCancel}
        >
            <Dialog.Header title="Add voting body" onCloseClick={handleCancel} />
            <Dialog.Content className="flex flex-col gap-6 pb-1.5">
                {handleStepContent(step)}
                <div className="flex w-full justify-between">
                    <Button variant="tertiary" onClick={step === 0 ? handleCancel : () => setStep(step - 1)}>
                        {step === 0 ? 'Cancel' : 'Back'}
                    </Button>
                    <Button type="submit" onClick={handleAdvanceStep}>
                        {step === 2 ? 'Save' : 'Next'}
                    </Button>
                </div>
            </Dialog.Content>
            <Dialog.Footer />
        </Dialog.Root>
    );
};
