import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { Button, IconType, RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import { useFieldArray } from 'react-hook-form';
import { GovernanceType, type ICreateProcessFormData } from '../createProcessFormDefinitions';
import { createProcessFormUtils } from '../createProcessFormUtils';
import { GovernanceBodiesField } from './fields/governanceBodiesField';
import { GovernanceStageField } from './fields/governanceStageField';

export interface ICreateProcessFormGovernanceProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export const CreateProcessFormGovernance: React.FC<ICreateProcessFormGovernanceProps> = (props) => {
    const { daoId } = props;
    const { t } = useTranslations();

    const {
        value: governanceType,
        onChange: onGovernanceTypeChange,
        ...governanceTypeField
    } = useFormField<ICreateProcessFormData, 'governanceType'>('governanceType', {
        label: t('app.createDao.createProcessForm.governance.type.label'),
        defaultValue: GovernanceType.BASIC,
        rules: { required: true },
    });

    const {
        fields: stages,
        append: appendStage,
        remove: removeStage,
    } = useFieldArray<ICreateProcessFormData, 'stages'>({ name: 'stages' });

    const isAdvancedGovernance = governanceType === GovernanceType.ADVANCED;

    const handleAddStage = () => appendStage(createProcessFormUtils.buildDefaultStage());

    return (
        <div className="flex w-full flex-col gap-10">
            <RadioGroup
                helpText={t('app.createDao.createProcessForm.governance.type.helpText')}
                onValueChange={onGovernanceTypeChange}
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
            {!isAdvancedGovernance && <GovernanceBodiesField daoId={daoId} fieldName="bodies" />}
            {isAdvancedGovernance && (
                <div className="flex flex-col gap-2 md:gap-3">
                    <div className="flex flex-col gap-3 md:gap-2">
                        {stages.map((stage, index) => (
                            <GovernanceStageField
                                key={stage.id}
                                formPrefix={`stages.${index.toString()}`}
                                stagesCount={stages.length}
                                onDelete={() => removeStage(index)}
                                daoId={daoId}
                            />
                        ))}
                    </div>
                    <Button
                        size="md"
                        variant="tertiary"
                        className="self-start"
                        iconLeft={IconType.PLUS}
                        onClick={handleAddStage}
                    >
                        {t('app.createDao.createProcessForm.governance.stageField.action.add')}
                    </Button>
                </div>
            )}
        </div>
    );
};
