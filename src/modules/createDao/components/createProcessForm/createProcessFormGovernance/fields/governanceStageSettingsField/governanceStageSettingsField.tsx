import { CreateDaoDialogId } from '@/modules/createDao/constants/createDaoDialogId';
import type { ISetupStageSettingsDialogParams } from '@/modules/createDao/dialogs/setupStageSettingsDialog/setupStageSettingsDialog';
import { useDialogContext } from '@/shared/components/dialogProvider/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import type { IDateDuration } from '@/shared/utils/dateUtils';
import { Button, DefinitionList, InputContainer, Tag } from '@aragon/gov-ui-kit';
import { Duration } from 'luxon';
import { useFormContext } from 'react-hook-form';
import { ProcessStageType } from '../../../createProcessFormDefinitions';
import type { ISetupStageSettingsForm } from '@/modules/createDao/dialogs/setupStageSettingsDialog';

export interface IGovernanceStageSettingsFieldProps {
    /**
     * Prefix to be prepended to the form field.
     */
    fieldPrefix: string;
    /**
     * Number of bodies of the stage.
     */
    bodyCount: number;
}

const requiredApprovalsDefaultValue = 1;

const formatDuration = (duration: IDateDuration): string => {
    const parsedDuration = Object.fromEntries(Object.entries(duration).filter(([, value]) => value !== 0));

    if (Object.keys(parsedDuration).length === 0) {
        parsedDuration.minutes = 0;
    }

    return Duration.fromObject(parsedDuration).toHuman();
};

export const GovernanceStageSettingsField: React.FC<IGovernanceStageSettingsFieldProps> = (props) => {
    const { fieldPrefix, bodyCount } = props;

    const { t } = useTranslations();
    const { setValue } = useFormContext();
    const { open } = useDialogContext();

    const { value: stageType } = useFormField<ISetupStageSettingsForm, 'type'>('type', {
        label: t('app.createDao.createProcessForm.governance.stageTypeField.label'),
        defaultValue: ProcessStageType.TIMELOCK,
        fieldPrefix,
    });

    const isOptimisticStage = stageType === ProcessStageType.OPTIMISTIC;
    const isTimelockStage = stageType === ProcessStageType.TIMELOCK;

    const { value: votingPeriod } = useFormField<ISetupStageSettingsForm, 'votingPeriod'>('votingPeriod', {
        fieldPrefix,
    });

    const { value: earlyStageAdvance } = useFormField<ISetupStageSettingsForm, 'earlyStageAdvance'>(
        'earlyStageAdvance',
        {
            fieldPrefix,
        },
    );

    const { value: stageExpiration } = useFormField<ISetupStageSettingsForm, 'stageExpiration'>('stageExpiration', {
        fieldPrefix,
    });

    const { value: requiredApprovals } = useFormField<ISetupStageSettingsForm, 'requiredApprovals'>(
        'requiredApprovals',
        {
            fieldPrefix,
            defaultValue: requiredApprovalsDefaultValue,
        },
    );

    const earlyStageTagValue = earlyStageAdvance ? 'yes' : 'no';
    const earlyStageTagLabel = t(`app.createDao.createProcessForm.governance.stageSettingsField.${earlyStageTagValue}`);

    const expirationTagValue = stageExpiration != null ? 'yes' : 'no';
    const expirationTagLabel = t(`app.createDao.createProcessForm.governance.stageSettingsField.${expirationTagValue}`);

    const handleDialogSubmit = (values: ISetupStageSettingsForm) => {
        const { votingPeriod, earlyStageAdvance, stageExpiration, requiredApprovals, type } = values;
        setValue(`${fieldPrefix}.votingPeriod`, votingPeriod);
        setValue(`${fieldPrefix}.earlyStageAdvance`, earlyStageAdvance);
        setValue(`${fieldPrefix}.stageExpiration`, stageExpiration);
        setValue(`${fieldPrefix}.requiredApprovals`, requiredApprovals);
        setValue(`${fieldPrefix}.type`, type);
    };

    const handleSettingsDialogOpen = () => {
        const params: ISetupStageSettingsDialogParams = {
            onSubmit: handleDialogSubmit,
            defaultValues: { type: stageType, votingPeriod, earlyStageAdvance, stageExpiration, requiredApprovals },
            bodyCount,
        };
        open(CreateDaoDialogId.SETUP_STAGE_SETTINGS, { params });
    };

    return (
        <InputContainer
            useCustomWrapper={true}
            id="stageSettings"
            label={t('app.createDao.createProcessForm.governance.stageSettingsField.label')}
            className="flex flex-col items-start gap-3"
        >
            <DefinitionList.Container className="rounded-xl border border-neutral-100 px-6 py-4">
                {!isTimelockStage && (
                    <DefinitionList.Item
                        term={t('app.createDao.createProcessForm.governance.stageSettingsField.governanceType')}
                    >
                        <p>{stageType}</p>
                    </DefinitionList.Item>
                )}
                {!isTimelockStage && (
                    <DefinitionList.Item
                        term={t('app.createDao.createProcessForm.governance.stageSettingsField.approvalThreshold')}
                    >
                        <p>{requiredApprovals}</p>
                    </DefinitionList.Item>
                )}
                <DefinitionList.Item
                    term={t('app.createDao.createProcessForm.governance.stageSettingsField.votingPeriod')}
                >
                    {formatDuration(votingPeriod)}
                </DefinitionList.Item>
                {!isOptimisticStage && !isTimelockStage && (
                    <DefinitionList.Item
                        term={t('app.createDao.createProcessForm.governance.stageSettingsField.earlyAdvance')}
                    >
                        <Tag
                            className="w-fit"
                            label={earlyStageTagLabel}
                            variant={earlyStageAdvance ? 'primary' : 'neutral'}
                        />
                    </DefinitionList.Item>
                )}
                {!isTimelockStage && (
                    <DefinitionList.Item
                        term={t('app.createDao.createProcessForm.governance.stageSettingsField.expiration')}
                    >
                        <Tag
                            className="w-fit"
                            label={expirationTagLabel}
                            variant={stageExpiration != null ? 'primary' : 'neutral'}
                        />
                    </DefinitionList.Item>
                )}
                {stageExpiration != null && (
                    <DefinitionList.Item
                        term={t('app.createDao.createProcessForm.governance.stageSettingsField.expirationPeriod')}
                    >
                        {formatDuration(stageExpiration)}
                    </DefinitionList.Item>
                )}
            </DefinitionList.Container>
            <Button onClick={handleSettingsDialogOpen} variant="tertiary" size="md">
                {t('app.createDao.createProcessForm.governance.stageSettingsField.edit')}
            </Button>
        </InputContainer>
    );
};
