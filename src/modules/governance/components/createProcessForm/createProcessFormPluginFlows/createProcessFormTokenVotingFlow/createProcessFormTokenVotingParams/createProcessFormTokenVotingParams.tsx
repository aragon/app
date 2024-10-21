import type { ICreateProcessFormBodyNameProps } from '@/modules/governance/components/createProcessForm/createProcessFormDefinitions';
import { useBodyFields } from '@/modules/governance/components/createProcessForm/hooks/useBodyFields';
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

export interface ICreateProcessFormTokenVotingParamsProps extends ICreateProcessFormBodyNameProps {}

export const CreateProcessFormTokenVotingParams: React.FC<ICreateProcessFormTokenVotingParamsProps> = (props) => {
    const { stageFieldName, bodyIndex } = props;
    const [currentTotalTokenAmount, setCurrentTotalTokenAmount] = useState(0);
    const [formattedTotalTokenAmount, setFormattedTotalTokenAmount] = useState<string | null>();
    const { watch, setValue } = useFormContext();

    const { supportThresholdField, minimumParticipationField, voteChangeField } = useBodyFields(
        stageFieldName,
        bodyIndex,
    );

    const members = watch(`${stageFieldName}.bodies.${bodyIndex}.members`);
    const tokenSymbolField = watch(`${stageFieldName}.bodies.${bodyIndex}.tokenSymbolField`);

    useEffect(() => {
        const totalTokenAmount = members?.reduce(
            (acc: number, member: { tokenAmount: string }) => acc + Number(member.tokenAmount),
            0,
        );
        const formattedTotal = formatterUtils.formatNumber(totalTokenAmount, {
            format: NumberFormat.TOKEN_AMOUNT_SHORT,
        });
        setCurrentTotalTokenAmount(totalTokenAmount);
        setFormattedTotalTokenAmount(formattedTotal);
    }, [members]);

    const formattedParticipation = formatterUtils.formatNumber(
        currentTotalTokenAmount * minimumParticipationField.value * 0.01,
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
                {...supportThresholdField}
            >
                <Card className="flex flex-col gap-y-6 border border-neutral-100 p-6">
                    <div className="flex items-center justify-between gap-x-6">
                        <InputNumber
                            prefix={supportThresholdField.value == 100 ? undefined : '>'}
                            suffix="%"
                            min={1}
                            max={100}
                            placeholder=">1%"
                            {...supportThresholdField}
                            label={undefined}
                        />
                        <div className="flex w-5/6 grow items-center gap-x-1">
                            <Tag label="Yes" variant="primary" />
                            <Progress value={supportThresholdField.value} />
                            <Tag label="No" variant="neutral" />
                        </div>
                    </div>
                    {supportThresholdField.value >= 50 ? (
                        <AlertInline variant="success" message="Proposal will be approved by majority" />
                    ) : (
                        <AlertInline variant="warning" message="Proposal will be approved by minority" />
                    )}
                </Card>
            </InputContainer>
            <InputContainer
                id="participation"
                label="Minimum participation"
                helpText="The percentage of tokens that participate in a proposal, out of the total supply, must be greater than or equal to this value for the proposal to pass."
                useCustomWrapper={true}
                {...minimumParticipationField}
            >
                <Card className="flex flex-col border border-neutral-100 p-6">
                    <div className="flex items-center justify-between gap-x-6">
                        <InputNumber
                            prefix={minimumParticipationField.value == 100 ? undefined : '≥'}
                            suffix="%"
                            min={1}
                            max={100}
                            placeholder=">1%"
                            className="max-w-fit shrink"
                            {...minimumParticipationField}
                            label={undefined}
                        />
                        <div className="h-full w-5/6 grow flex-col gap-y-3">
                            <p className="text-primary-400">
                                {formattedParticipation} {tokenSymbolField}
                            </p>
                            <Progress value={minimumParticipationField.value} />
                            <p className="text-right">
                                of {formattedTotalTokenAmount} {tokenSymbolField}
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
