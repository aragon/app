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
            <div className="flex flex-col gap-6 rounded-xl border border-neutral-100 bg-neutral-0 p-6 shadow-neutral-sm md:p-12">
                <div className="flex items-start justify-between gap-6">
                    <div className="flex flex-col gap-2">
                        <p className="text-lg text-neutral-800 leading-tight md:text-2xl">
                            {t(
                                'app.createDao.createProcessForm.governance.advancedEmptyState.gated.heading',
                                { daoName: dao?.name ?? daoId },
                            )}
                        </p>
                        <p className="text-neutral-500 text-sm leading-normal md:text-base">
                            {t(
                                'app.createDao.createProcessForm.governance.advancedEmptyState.gated.description',
                            )}
                        </p>
                    </div>
                    <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-neutral-50 md:size-28">
                        <IllustrationObject
                            className="size-14 md:size-24"
                            object="SECURITY"
                        />
                    </div>
                </div>
                <ol className="flex flex-col gap-3 text-neutral-500 text-sm leading-normal md:text-base">
                    {gatedFeatureKeys.map((key) => (
                        <li className="flex items-center gap-3" key={key}>
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-400 text-sm">
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
                    className="self-start"
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
                className="border border-neutral-100"
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
