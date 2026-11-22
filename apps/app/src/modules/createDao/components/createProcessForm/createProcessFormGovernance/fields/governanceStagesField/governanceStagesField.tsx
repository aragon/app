import {
    Button,
    CardEmptyState,
    IconType,
    IllustrationObject,
} from '@aragon/gov-ui-kit';
import { useFieldArray } from 'react-hook-form';
import { GOVERNANCE_ASSISTANCE_URL } from '@/modules/createDao/constants/governanceDesigner';
import { useDao } from '@/shared/api/daoService';
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

const gatedFeatureKeys = ['1', '2', '3', '4', '5'] as const;

export const GovernanceStagesField: React.FC<IGovernanceStagesFieldProps> = (
    props,
) => {
    const { daoId, isAdvancedAvailable = true, readOnly = false } = props;

    const { t } = useTranslations();

    const { data: dao } = useDao(
        { urlParams: { id: daoId } },
        { enabled: !isAdvancedAvailable },
    );

    const {
        fields: stages,
        append: appendStage,
        remove: removeStage,
    } = useFieldArray<ICreateProcessFormData, 'stages'>({ name: 'stages' });

    const handleAddStage = () =>
        appendStage(createProcessFormUtils.buildDefaultStage());

    if (!isAdvancedAvailable) {
        return (
            <div className="flex flex-col gap-section rounded-xl border border-surface-secondary bg-surface-primary p-4 shadow-surface-sm md:p-12">
                <div className="flex items-start justify-between gap-section">
                    <div className="flex flex-col gap-related--fixed-8">
                        <p className="type-title-group--wizard-intro text-surface-primary">
                            {t(
                                'app.createDao.createProcessForm.governance.advancedEmptyState.gated.heading',
                                { daoName: dao?.name ?? daoId },
                            )}
                        </p>
                        <p className="type-body-compact text-surface-secondary">
                            {t(
                                'app.createDao.createProcessForm.governance.advancedEmptyState.gated.description',
                            )}
                        </p>
                    </div>
                    <div className="flex size-24 shrink-0 items-center justify-center rounded-full bg-surface-secondary">
                        <IllustrationObject
                            className="size-[5.25rem]"
                            object="SECURITY"
                        />
                    </div>
                </div>
                <ol className="flex flex-col gap-related type-body-compact text-surface-secondary">
                    {gatedFeatureKeys.map((key) => (
                        <li
                            className="flex items-baseline gap-related"
                            key={key}
                        >
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-secondary type-caption--compact-label text-surface-secondary">
                                {key}
                            </span>
                            <span>
                                {t(
                                    `app.createDao.createProcessForm.governance.advancedEmptyState.gated.features.${key}`,
                                )}
                            </span>
                        </li>
                    ))}
                </ol>
                <Button
                    className="w-full md:w-auto md:self-start"
                    href={GOVERNANCE_ASSISTANCE_URL}
                    iconRight={IconType.LINK_EXTERNAL}
                    rel="noopener noreferrer"
                    size="lg"
                    target="_blank"
                    variant="primary"
                >
                    {t(
                        'app.createDao.createProcessForm.governance.advancedEmptyState.gated.cta',
                    )}
                </Button>
            </div>
        );
    }

    if (stages.length === 0 && !readOnly) {
        return (
            <CardEmptyState
                className="border border-surface-secondary"
                description={t(
                    'app.createDao.createProcessForm.governance.advancedEmptyState.available.description',
                )}
                heading={t(
                    'app.createDao.createProcessForm.governance.advancedEmptyState.available.heading',
                )}
                objectIllustration={{ object: 'BUILD' }}
                primaryButton={{
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
        <div className="flex flex-col gap-related--8-12">
            <div className="flex flex-col gap-related--12-8">
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
