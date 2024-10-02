/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
    ICreateProcessFormBody,
    ITokenVotingMember,
} from '@/modules/governance/components/createProcessForm/createProcessFormDefinitions';
import { CreateProcessFormMultisigDetails } from '@/modules/governance/components/createProcessForm/createProcessFormPluginFlows/createProcessFormMultisigFlow/createProcessFormMultisigDetails/createProcessFormMultisigDetails';
import { CreateProcessFormMultisigParams } from '@/modules/governance/components/createProcessForm/createProcessFormPluginFlows/createProcessFormMultisigFlow/createProcessFormMultsigParams/createProcessFormMultisigParams';
import { CreateProcessFormTokenVotingDetails } from '@/modules/governance/components/createProcessForm/createProcessFormPluginFlows/createProcessFormTokenVotingFlow/createProcessFormTokenVotingDetails/createProcessFormTokenVotingDetails';
import { CreateProcessFormTokenVotingParams } from '@/modules/governance/components/createProcessForm/createProcessFormPluginFlows/createProcessFormTokenVotingFlow/createProcessFormTokenVotingParams/createProcessFormTokenVotingParams';
import { Button, Dialog, formatterUtils, InputText, NumberFormat, RadioCard, RadioGroup } from '@aragon/ods';
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
    multisigThresholdField: any;
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
        multisigThresholdField,
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
            multisigThreshold: multisigThresholdField.value,
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
            return;
        }

        if (step === 1) {
            if (bodyGovernanceTypeField.value === 'tokenVoting') {
                const complete = await trigger([tokenNameField.name, tokenSymbolField.name]);
                const membersComplete = members.every((member) => member.address && member.tokenAmount);
                if (complete && membersComplete) {
                    setStep(step + 1);
                }
            } else if (bodyGovernanceTypeField.value === 'multisig') {
                const membersComplete = members.every((member) => member.address);
                if (membersComplete) {
                    setStep(step + 1);
                }
            }
            return;
        }

        if (step === 2) {
            if (bodyGovernanceTypeField.value === 'tokenVoting') {
                const complete = await trigger([
                    supportThresholdPercentageField.name,
                    minimumParticipationPercentageField.name,
                    voteChangeField.name,
                ]);
                if (complete) {
                    handleSave();
                }
            } else if (bodyGovernanceTypeField.value === 'multisig') {
                const complete = await trigger([multisigThresholdField.name]);
                if (complete) {
                    handleSave();
                }
            }
            return;
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
                            onValueChange={(value) => setValue(bodyGovernanceTypeField.name, value)}
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
                        </RadioGroup>
                    </>
                );
            case 1:
                if (bodyGovernanceTypeField.value === 'tokenVoting') {
                    return (
                        <CreateProcessFormTokenVotingDetails
                            tokenNameField={tokenNameField}
                            tokenSymbolField={tokenSymbolField}
                            members={members}
                            setMembers={setMembers}
                            memberAddressInputValues={memberAddressInputValues}
                            setMemberAddressInputValues={setMemberAddressInputValues}
                            handleAddMember={handleAddMember}
                            handleRemoveMember={handleRemoveMember}
                        />
                    );
                } else if (bodyGovernanceTypeField.value === 'multisig') {
                    return (
                        <CreateProcessFormMultisigDetails
                            members={members}
                            setMembers={setMembers}
                            memberAddressInputValues={memberAddressInputValues}
                            setMemberAddressInputValues={setMemberAddressInputValues}
                            handleAddMember={handleAddMember}
                            handleRemoveMember={handleRemoveMember}
                        />
                    );
                }
                break;
            case 2:
                if (bodyGovernanceTypeField.value === 'tokenVoting') {
                    return (
                        <CreateProcessFormTokenVotingParams
                            supportThresholdPercentageField={supportThresholdPercentageField}
                            minimumParticipationPercentageField={minimumParticipationPercentageField}
                            voteChangeField={voteChangeField}
                            members={members}
                            tokenSymbolField={tokenSymbolField}
                            setValue={setValue}
                        />
                    );
                } else if (bodyGovernanceTypeField.value === 'multisig') {
                    return (
                        <CreateProcessFormMultisigParams
                            multisigThresholdField={multisigThresholdField}
                            members={members}
                            setValue={setValue}
                        />
                    );
                }
                break;
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
