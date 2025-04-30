import type { ISetupBodyForm } from '@/modules/createDao/dialogs/setupBodyDialog';
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
     * Defines if current stage is optimistic or not.
     */
    isOptimisticStage: boolean;
}

const requiredApprovalsDefaultValue = 1;

export const GovernanceStageApprovalsField: React.FC<IGovernanceStageApprovalsFieldProps> = (props) => {
    const { fieldPrefix, isOptimisticStage } = props;

    const { t } = useTranslations();

    const bodies = useWatch<Record<string, ISetupBodyForm[]>>({ name: `${fieldPrefix}.bodies` });

    const fieldName = `${fieldPrefix}.requiredApprovals`;
    const value = useWatch<Record<string, ICreateProcessFormStage['requiredApprovals']>>({
        name: fieldName,
        defaultValue: requiredApprovalsDefaultValue,
    });

    const labelContext = isOptimisticStage ? 'veto' : 'approve';

    if (bodies.length === 0) {
        return null;
    }

    return (
        <NumberProgressInput
            label={t(`app.createDao.createProcessForm.governance.stageApprovalsField.${labelContext}.label`)}
            helpText={t(`app.createDao.createProcessForm.governance.stageApprovalsField.${labelContext}.helpText`)}
            min={0}
            fieldName={fieldName}
            valueLabel={value.toString()}
            defaultValue={requiredApprovalsDefaultValue}
            total={bodies.length}
            totalLabel={t('app.createDao.createProcessForm.governance.stageApprovalsField.summary', {
                count: bodies.length,
            })}
        />
    );
};
