import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, IconType } from '@aragon/gov-ui-kit';
import { useFieldArray } from 'react-hook-form';
import type { ICreateProcessFormData } from '../../../createProcessFormDefinitions';
import { createProcessFormUtils } from '../../../createProcessFormUtils';
import { GovernanceStagesFieldItem } from './governanceStagesFieldItem';

export interface IGovernanceStagesFieldProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export const GovernanceStagesField: React.FC<IGovernanceStagesFieldProps> = (props) => {
    const { daoId } = props;

    const { t } = useTranslations();

    const {
        fields: stages,
        append: appendStage,
        remove: removeStage,
    } = useFieldArray<ICreateProcessFormData, 'stages'>({ name: 'stages' });

    const handleAddStage = () => appendStage(createProcessFormUtils.buildDefaultStage());

    return (
        <div className="flex flex-col gap-2 md:gap-3">
            <div className="flex flex-col gap-3 md:gap-2">
                {stages.map((stage, index) => (
                    <GovernanceStagesFieldItem
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
    );
};
