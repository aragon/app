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

    const approvalsLabelNamespace = 'app.governance.createProcessForm.stage.bodies.threshold';
    const approvalsLabelContext = isOptimisticStage ? 'vetoing' : 'voting';
    const requiredApprovalsLabel = t(`${approvalsLabelNamespace}.label.${approvalsLabelContext}`);
    const requiredApprovalsHelpText = t(`${approvalsLabelNamespace}.helpText.${approvalsLabelContext}`);

    return (
        <InputContainer
            id="requiredApprovals"
            label={requiredApprovalsLabel}
            useCustomWrapper={true}
            helpText={requiredApprovalsHelpText}
        >
            <div className="flex w-full items-center gap-x-4 rounded-xl border border-neutral-100 p-6">
                <InputNumber min={0} max={stageBodiesCount} {...requiredApprovalsField} />
                <div className="my-auto flex size-full flex-col justify-center gap-y-2">
                    <Progress value={(requiredApprovalsField.value / stageBodiesCount) * 100} />
                    <p className="text-right">
                        {requiredApprovalsField.value} of {stageBodiesCount}{' '}
                        {t('app.governance.createProcessForm.stage.bodies.threshold.bodies')}
                    </p>
                </div>
            </div>
        </InputContainer>
    );
};
