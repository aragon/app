import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
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
} from '@aragon/gov-ui-kit';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import {
    type ICreateProcessFormBody,
    type ITokenVotingMember,
} from '../../../../../components/createProcessForm/createProcessFormDefinitions';
import type { ICreateProcessFormBodyDialogStepsProps } from '../../../createProcessFormStages/fields/stageBodiesField/stageBodiesFieldDefinitions';

export interface ICreateProcessFormTokenVotingParamsProps extends ICreateProcessFormBodyDialogStepsProps {}

export const CreateProcessFormTokenVotingParams: React.FC<ICreateProcessFormTokenVotingParamsProps> = (props) => {
    const { fieldPrefix } = props;

    const { t } = useTranslations();

    const [currentTotalTokenAmount, setCurrentTotalTokenAmount] = useState(0);
    const [formattedTotalTokenAmount, setFormattedTotalTokenAmount] = useState<string | null>();

    const { watch, setValue } = useFormContext();

    const supportThresholdField = useFormField<ICreateProcessFormBody, 'supportThreshold'>('supportThreshold', {
        fieldPrefix,
        label: t('app.createDao.createProcessForm.tokenFlow.params.supportThreshold.label'),
    });

    const minimumParticipationField = useFormField<ICreateProcessFormBody, 'minimumParticipation'>(
        'minimumParticipation',
        { fieldPrefix, label: t('app.createDao.createProcessForm.tokenFlow.params.minParticipation.label') },
    );

    const voteChangeField = useFormField<ICreateProcessFormBody, 'voteChange'>('voteChange', {
        fieldPrefix,
        label: t('app.createDao.createProcessForm.tokenFlow.params.voteChange.label'),
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const members = watch(`${fieldPrefix}.members`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const tokenSymbolField = watch(`${fieldPrefix}.tokenSymbolField`);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const totalTokenAmount = members?.reduce(
            (acc: number, member: ITokenVotingMember) => acc + Number(member.tokenAmount),
            0,
        );
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const formattedTotal = formatterUtils.formatNumber(totalTokenAmount, {
            format: NumberFormat.TOKEN_AMOUNT_SHORT,
        });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        setCurrentTotalTokenAmount(totalTokenAmount);
        setFormattedTotalTokenAmount(formattedTotal);
    }, [members]);

    const formattedParticipation = formatterUtils.formatNumber(
        currentTotalTokenAmount * minimumParticipationField.value * 0.01,
        { format: NumberFormat.TOKEN_AMOUNT_SHORT },
    );

    return (
        <div className="flex flex-col gap-y-6">
            <InputContainer
                id="threshold"
                helpText={t('app.createDao.createProcessForm.tokenFlow.params.supportThreshold.helpText')}
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
                            placeholder="> 1 %"
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
                        <AlertInline
                            variant="success"
                            message={t('app.createDao.createProcessForm.tokenFlow.params.supportThreshold.success')}
                        />
                    ) : (
                        <AlertInline
                            variant="warning"
                            message={t('app.createDao.createProcessForm.tokenFlow.params.supportThreshold.warning')}
                        />
                    )}
                </Card>
            </InputContainer>
            <InputContainer
                id="participation"
                helpText={t('app.createDao.createProcessForm.tokenFlow.params.minParticipation.helpText')}
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
                                {t('app.createDao.createProcessForm.tokenFlow.params.minParticipation.of')}{' '}
                                {formattedTotalTokenAmount} {tokenSymbolField}
                            </p>
                        </div>
                    </div>
                </Card>
            </InputContainer>
            <Switch
                inlineLabel={
                    voteChangeField.value
                        ? t('app.createDao.createProcessForm.tokenFlow.params.voteChange.yes')
                        : t('app.createDao.createProcessForm.tokenFlow.params.voteChange.no')
                }
                onCheckedChanged={(checked) => setValue(voteChangeField.name, checked)}
                checked={voteChangeField.value}
                {...voteChangeField}
            />
        </div>
    );
};
