import { Button, CardEmptyState, IconType } from '@aragon/gov-ui-kit';
import { useFieldArray } from 'react-hook-form';
import { GOVERNANCE_ASSISTANCE_URL } from '@/modules/createDao/constants/governanceDesigner';
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
     * Whether advanced governance is available for this DAO.
     * @default true
     */
    isAdvancedAvailable?: boolean;
    /**
     * If the component field is read-only.
     * @default false
     */
    readOnly?: boolean;
}

export const GovernanceStagesField: React.FC<IGovernanceStagesFieldProps> = (
    props,
) => {
    const { daoId, isAdvancedAvailable = true, readOnly = false } = props;

    const { t } = useTranslations();

    const {
        fields: stages,
        append: appendStage,
        remove: removeStage,
    } = useFieldArray<ICreateProcessFormData, 'stages'>({ name: 'stages' });

    const handleAddStage = () =>
        appendStage(createProcessFormUtils.buildDefaultStage());

    if (!isAdvancedAvailable) {
        return (
            <CardEmptyState
                className="border border-neutral-100"
                description={t(
                    'app.createDao.createProcessForm.governance.advancedEmptyState.gated.description',
                )}
                heading={t(
                    'app.createDao.createProcessForm.governance.advancedEmptyState.gated.heading',
                )}
                isStacked={false}
                objectIllustration={{ object: 'SECURITY' }}
                primaryButton={{
                    label: t(
                        'app.createDao.createProcessForm.governance.advancedEmptyState.gated.cta',
                    ),
                    href: GOVERNANCE_ASSISTANCE_URL,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                }}
            />
        );
    }

    if (stages.length === 0 && !readOnly) {
        return (
            <CardEmptyState
                className="border border-neutral-100"
                description={t(
                    'app.createDao.createProcessForm.governance.advancedEmptyState.available.description',
                )}
                heading={t(
                    'app.createDao.createProcessForm.governance.advancedEmptyState.available.heading',
                )}
                isStacked={false}
                objectIllustration={{ object: 'SECURITY' }}
                secondaryButton={{
                    label: t(
                        'app.createDao.createProcessForm.governance.advancedEmptyState.available.cta',
                    ),
                    onClick: handleAddStage,
                    iconLeft: IconType.PLUS,
                }}
            />
        );
    }

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
