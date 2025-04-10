import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import type { IDateDuration } from '@/shared/utils/dateUtils';
import { Button, DefinitionList, InputContainer, Tag } from '@aragon/gov-ui-kit';
import { Duration } from 'luxon';
import { useFormContext } from 'react-hook-form';
import type {
    ISetupStageTimingDialogParams,
    ISetupStageTimingForm,
} from '../../../../../dialogs/setupStageTimingDialog';
import { ProcessStageType } from '../../../createProcessFormDefinitions';

export interface IGovernanceStageTimingFieldProps {
    /**
     * Prefix to be prepended to the form field.
     */
    fieldPrefix: string;
    /**
     * Type of the stage.
     */
    stageType: ProcessStageType;
}

export const GovernanceStageTimingField: React.FC<IGovernanceStageTimingFieldProps> = (props) => {
    const { fieldPrefix, stageType } = props;

    const { t } = useTranslations();
    const { setValue } = useFormContext();
    const { open } = useDialogContext();

    const isOptimisticStage = stageType === ProcessStageType.OPTIMISTIC;
    const isTimelockStage = stageType === ProcessStageType.TIMELOCK;

    const { value: votingPeriod } = useFormField<ISetupStageTimingForm, 'votingPeriod'>('votingPeriod', {
        fieldPrefix,
    });

    const { value: earlyStageAdvance } = useFormField<ISetupStageTimingForm, 'earlyStageAdvance'>('earlyStageAdvance', {
        fieldPrefix,
    });

    const { value: stageExpiration } = useFormField<ISetupStageTimingForm, 'stageExpiration'>('stageExpiration', {
        fieldPrefix,
    });

    const handleDialogSubmit = (values: ISetupStageTimingForm) => {
        const { votingPeriod, earlyStageAdvance, stageExpiration } = values;
        setValue(`${fieldPrefix}.votingPeriod`, votingPeriod);
        setValue(`${fieldPrefix}.earlyStageAdvance`, earlyStageAdvance);
        setValue(`${fieldPrefix}.stageExpiration`, stageExpiration);
    };

    const formatDuration = (duration: IDateDuration): string => {
        const parsedDuration = Object.fromEntries(Object.entries(duration).filter(([, value]) => value !== 0));

        if (Object.keys(parsedDuration).length === 0) {
            parsedDuration.minutes = 0;
        }

        return Duration.fromObject(parsedDuration).toHuman();
    };

    const votingPeriodLabel = isTimelockStage
        ? t('app.createDao.createProcessForm.governance.stageTimingField.timelockPeriod')
        : t('app.createDao.createProcessForm.governance.stageTimingField.votingPeriod');

    const earlyStageTagValue = earlyStageAdvance ? 'yes' : 'no';
    const earlyStageTagLabel = t(`app.createDao.createProcessForm.governance.stageTimingField.${earlyStageTagValue}`);

    const expirationTagValue = stageExpiration != null ? 'yes' : 'no';
    const expirationTagLabel = t(`app.createDao.createProcessForm.governance.stageTimingField.${expirationTagValue}`);

    const handleTimingDialogOpen = () => {
        const params: ISetupStageTimingDialogParams = {
            onSubmit: handleDialogSubmit,
            stageType,
            defaultValues: { votingPeriod, earlyStageAdvance, stageExpiration },
        };
        open('SETUP_STAGE_TIMING', { params });
    };

    return (
        <InputContainer
            id="stageTiming"
            useCustomWrapper={true}
            label={t('app.createDao.createProcessForm.governance.stageTimingField.label')}
            className="flex flex-col items-start gap-3"
        >
            <DefinitionList.Container className="rounded-xl border border-neutral-100 px-6 py-4">
                <DefinitionList.Item term={votingPeriodLabel}>{formatDuration(votingPeriod)}</DefinitionList.Item>
                {!isOptimisticStage && !isTimelockStage && (
                    <DefinitionList.Item
                        term={t('app.createDao.createProcessForm.governance.stageTimingField.earlyAdvance')}
                    >
                        <Tag
                            className="w-fit"
                            label={earlyStageTagLabel}
                            variant={earlyStageAdvance ? 'primary' : 'neutral'}
                        />
                    </DefinitionList.Item>
                )}
                <DefinitionList.Item term={t('app.createDao.createProcessForm.governance.stageTimingField.expiration')}>
                    <Tag
                        className="w-fit"
                        label={expirationTagLabel}
                        variant={stageExpiration != null ? 'primary' : 'neutral'}
                    />
                </DefinitionList.Item>
                {stageExpiration != null && (
                    <DefinitionList.Item
                        term={t('app.createDao.createProcessForm.governance.stageTimingField.expirationPeriod')}
                    >
                        {formatDuration(stageExpiration)}
                    </DefinitionList.Item>
                )}
            </DefinitionList.Container>
            <Button onClick={handleTimingDialogOpen} variant="tertiary" size="md">
                {t('app.createDao.createProcessForm.governance.stageTimingField.edit')}
            </Button>
        </InputContainer>
    );
};
