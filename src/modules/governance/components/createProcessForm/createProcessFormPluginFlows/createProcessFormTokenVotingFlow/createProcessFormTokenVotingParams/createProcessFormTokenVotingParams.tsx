import { getAllBodyFields } from '@/modules/governance/components/createProcessForm/utils/getBodyFields';
import {
    AlertInline,
    Card,
    formatterUtils,
    InputContainer,
    InputNumber,
    NumberFormat,
    Progress,
    Switch,
    Tag,
} from '@aragon/ods';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

export interface ICreateProcessFormTokenVotingParamsProps {
    stageName: string;
    stageIndex: number;
    bodyIndex: number;
}

export const CreateProcessFormTokenVotingParams: React.FC<ICreateProcessFormTokenVotingParamsProps> = (props) => {
    const { stageIndex, stageName, bodyIndex } = props;
    const [currentTotalTokenAmount, setCurrentTotalTokenAmount] = useState(0);
    const [formattedTotalTokenAmount, setFormattedTotalTokenAmount] = useState<string | null>();
    const { watch, setValue, getValues } = useFormContext();

    const { supportThresholdPercentageField, minimumParticipationPercentageField, voteChangeField } = getAllBodyFields(
        stageName,
        stageIndex,
        bodyIndex,
    );

    const members = watch(`${stageName}.${stageIndex}.bodies.${bodyIndex}.members`);
    const tokenSymbol = watch(`${stageName}.${stageIndex}.bodies.${bodyIndex}.tokenSymbol`);

    console.log('members', members);

    useEffect(() => {
        const totalTokenAmount = members.reduce((acc: any, member: any) => acc + Number(member.tokenAmount), 0);
        const formattedTotal = formatterUtils.formatNumber(totalTokenAmount, {
            format: NumberFormat.TOKEN_AMOUNT_SHORT,
        });
        setCurrentTotalTokenAmount(totalTokenAmount);
        setFormattedTotalTokenAmount(formattedTotal);
    }, [members]);

    const formattedPercentageParticipation = formatterUtils.formatNumber(
        currentTotalTokenAmount * minimumParticipationPercentageField.value * 0.01,
        {
            format: NumberFormat.TOKEN_AMOUNT_SHORT,
        },
    );

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
                                value={supportThresholdPercentageField.value}
                                thresholdIndicator={supportThresholdPercentageField.value}
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
                helpText={`The percentage of tokens that participate in a proposal, out of the total supply, must be greater than or equal to this value for the proposal to pass.`}
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
                                {formattedPercentageParticipation} {tokenSymbol}
                            </p>
                            <Progress value={minimumParticipationPercentageField.value} />
                            <p className="text-right">
                                of {formattedTotalTokenAmount} {tokenSymbol}
                            </p>
                        </div>
                    </div>
                </Card>
            </InputContainer>
            <Switch
                helpText="Allows voters to change their vote during the voting period."
                inlineLabel={voteChangeField.value ? 'Yes' : 'No'}
                onCheckedChanged={(checked) => setValue(voteChangeField.name, checked)}
                checked={voteChangeField.value}
                {...voteChangeField}
            />
        </div>
    );
};
