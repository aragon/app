import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import { useFormContext } from 'react-hook-form';
import { GovernanceType, type ICreateProcessFormData } from '../createProcessFormDefinitions';
import { createProcessFormUtils } from '../createProcessFormUtils';
import { GovernanceBasicBodyField } from './fields/governanceBasicBodyField';
import { GovernanceStagesField } from './fields/governanceStagesField/governanceStagesField';

export interface ICreateProcessFormGovernanceProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export const CreateProcessFormGovernance: React.FC<ICreateProcessFormGovernanceProps> = (props) => {
    const { daoId } = props;

    const { t } = useTranslations();
    const { setValue } = useFormContext();

    const {
        value: governanceType,
        onChange: onGovernanceTypeChange,
        ...governanceTypeField
    } = useFormField<ICreateProcessFormData, 'governanceType'>('governanceType', {
        label: t('app.createDao.createProcessForm.governance.type.label'),
        defaultValue: GovernanceType.BASIC,
        rules: { required: true },
    });

    const handleGovernanceTypeChange = (value: string) => {
        if (value === GovernanceType.ADVANCED) {
            setValue('body', undefined);
        } else {
            setValue('stages', [createProcessFormUtils.buildDefaultStage()]);
        }

        onGovernanceTypeChange(value);
    };

    const isAdvancedGovernance = governanceType === GovernanceType.ADVANCED;

    return (
        <div className="flex w-full flex-col gap-10">
            <RadioGroup
                helpText={t('app.createDao.createProcessForm.governance.type.helpText')}
                onValueChange={handleGovernanceTypeChange}
                className="w-full gap-4 md:flex-row"
                value={governanceType}
                {...governanceTypeField}
            >
                {Object.values(GovernanceType).map((type) => (
                    <RadioCard
                        key={type}
                        label={t(`app.createDao.createProcessForm.governance.type.${type}.label`)}
                        description={t(`app.createDao.createProcessForm.governance.type.${type}.description`)}
                        value={type}
                    />
                ))}
            </RadioGroup>
            {!isAdvancedGovernance && <GovernanceBasicBodyField daoId={daoId} />}
            {isAdvancedGovernance && <GovernanceStagesField daoId={daoId} />}
        </div>
    );
};
