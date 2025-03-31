import { NumberProgressInput } from '@/shared/components/forms/numberProgressInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useWatch } from 'react-hook-form';
import type { ICreateProcessFormStage } from '../../../createProcessFormDefinitions';

export interface IGovernanceStageApprovalsFieldProps {
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

const requiredApprovalsDefaultValue = 1;

export const GovernanceStageApprovalsField: React.FC<IGovernanceStageApprovalsFieldProps> = (props) => {
    const { fieldPrefix, stageBodiesCount, isOptimisticStage } = props;

    const { t } = useTranslations();

    const fieldName = `${fieldPrefix}.requiredApprovals`;
    const value = useWatch<Record<string, ICreateProcessFormStage['requiredApprovals']>>({
        name: fieldName,
        defaultValue: requiredApprovalsDefaultValue,
    });

    const labelContext = isOptimisticStage ? 'veto' : 'approve';

    return (
        <NumberProgressInput
            label={t(`app.createDao.createProcessForm.governanceStageApprovalsField.${labelContext}.label`)}
            helpText={t(`app.createDao.createProcessForm.governanceStageApprovalsField.${labelContext}.helpText`)}
            min={0}
            fieldName={fieldName}
            valueLabel={value.toString()}
            defaultValue={requiredApprovalsDefaultValue}
            total={stageBodiesCount}
            totalLabel={t('app.createDao.createProcessForm.governanceStageApprovalsField.summary', {
                count: stageBodiesCount,
            })}
        />
    );
};
