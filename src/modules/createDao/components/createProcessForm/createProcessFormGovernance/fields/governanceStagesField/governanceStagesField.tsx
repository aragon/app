import { Button, IconType } from '@aragon/gov-ui-kit';
import { useFieldArray } from 'react-hook-form';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { ICreateProcessFormData } from '../../../createProcessFormDefinitions';
import { createProcessFormUtils } from '../../../createProcessFormUtils';
import { GovernanceStagesFieldItem } from './governanceStagesFieldItem';

export interface IGovernanceStagesFieldProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * If the component field is read-only.
     * @default false
     */
    readOnly?: boolean;
}

export const GovernanceStagesField: React.FC<IGovernanceStagesFieldProps> = (
    props,
) => {
    const { daoId, readOnly = false } = props;

    const { t } = useTranslations();

    const {
        fields: stages,
        append: appendStage,
        remove: removeStage,
    } = useFieldArray<ICreateProcessFormData, 'stages'>({ name: 'stages' });

    const handleAddStage = () =>
        appendStage(createProcessFormUtils.buildDefaultStage());

    return (
        <div className="flex flex-col gap-2 md:gap-3">
            <div className="flex flex-col gap-3 md:gap-2">
                {stages.map((stage, index) => (
                    <GovernanceStagesFieldItem
                        daoId={daoId}
                        formPrefix={`stages.${index.toString()}`}
                        index={index}
                        key={stage.id}
                        onDelete={() => removeStage(index)}
                        readOnly={readOnly}
                        stagesCount={stages.length}
                    />
                ))}
            </div>
            {!readOnly && (
                <Button
                    className="self-start"
                    iconLeft={IconType.PLUS}
                    onClick={handleAddStage}
                    size="md"
                    variant="tertiary"
                >
                    {t(
                        'app.createDao.createProcessForm.governance.stageField.action.add',
                    )}
                </Button>
            )}
        </div>
    );
};
