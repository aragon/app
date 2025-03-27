import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { InputContainer, InputNumber, Progress } from '@aragon/gov-ui-kit';
import type { ICreateProcessFormStage } from '../../../createProcessFormDefinitions';

export interface IStageRequiredApprovalsFieldProps {
    /**
     * Field prefix to be used.
     */
    fieldPrefix: string;
    /**
     * Current number of bodies.
     */
    stageBodiesCount: number;
    /**
     * Defines if current stage is optimistic or not.
     */
    isOptimisticStage: boolean;
}

export const StageRequiredApprovalsField: React.FC<IStageRequiredApprovalsFieldProps> = (props) => {
    const { fieldPrefix, stageBodiesCount, isOptimisticStage } = props;

    const { t } = useTranslations();

    const requiredApprovalsField = useFormField<ICreateProcessFormStage, 'requiredApprovals'>('requiredApprovals', {
        rules: { min: 0, max: stageBodiesCount },
        defaultValue: 1,
        fieldPrefix,
    });

    const progressValue = (requiredApprovalsField.value / stageBodiesCount) * 100;

    const labelContext = isOptimisticStage ? 'veto' : 'approve';

    return (
        <InputContainer
            id="requiredApprovals"
            label={t(`app.createDao.createProcessForm.stages.requiredApprovals.${labelContext}.label`)}
            useCustomWrapper={true}
            helpText={t(`app.createDao.createProcessForm.stages.requiredApprovals.${labelContext}.helpText`)}
        >
            <div className="flex w-full items-center gap-x-4 rounded-xl border border-neutral-100 p-6">
                <InputNumber min={0} max={stageBodiesCount} {...requiredApprovalsField} />
                <div className="my-auto flex size-full flex-col justify-center gap-y-2">
                    <Progress value={progressValue} />
                    <p className="text-right">
                        {t('app.createDao.createProcessForm.stages.requiredApprovals.summary', {
                            value: requiredApprovalsField.value,
                            count: stageBodiesCount,
                        })}
                    </p>
                </div>
            </div>
        </InputContainer>
    );
};
