import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import type { IDateDuration } from '@/shared/utils/dateUtils';
import { Button, DefinitionList, InputContainer, Tag } from '@aragon/gov-ui-kit';
import { Duration } from 'luxon';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { type ICreateProcessFormStageTiming, ProcessStageType } from '../../../createProcessFormDefinitions';
import { GovernanceStageTimingFieldDialog } from './governanceStageTimingFieldDialog';

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

    const [isTimingDialogOpen, setIsTimingDialogOpen] = useState(false);

    const isOptimisticStage = stageType === ProcessStageType.OPTIMISTIC;
    const isTimelockStage = stageType === ProcessStageType.TIMELOCK;

    const { value: votingPeriod } = useFormField<ICreateProcessFormStageTiming, 'votingPeriod'>('votingPeriod', {
        fieldPrefix,
    });

    const { value: earlyStageAdvance } = useFormField<ICreateProcessFormStageTiming, 'earlyStageAdvance'>(
        'earlyStageAdvance',
        { fieldPrefix },
    );

    const { value: stageExpiration } = useFormField<ICreateProcessFormStageTiming, 'stageExpiration'>(
        'stageExpiration',
        { fieldPrefix },
    );

    const handleDialogSubmit = (values: ICreateProcessFormStageTiming) => {
        const { votingPeriod, earlyStageAdvance, stageExpiration } = values;
        setValue(`${fieldPrefix}.votingPeriod`, votingPeriod);
        setValue(`${fieldPrefix}.earlyStageAdvance`, earlyStageAdvance);
        setValue(`${fieldPrefix}.stageExpiration`, stageExpiration);
        setIsTimingDialogOpen(false);
    };

    const formatDuration = (duration: IDateDuration): string => {
        const parsedDuration = Object.fromEntries(Object.entries(duration).filter(([, value]) => value !== 0));

        if (Object.keys(parsedDuration).length === 0) {
            parsedDuration.minutes = 0;
        }

        return Duration.fromObject(parsedDuration).toHuman();
    };

    const votingPeriodLabel = isTimelockStage
        ? t('app.createDao.createProcessForm.governanceStageTimingField.timelockPeriod')
        : t('app.createDao.createProcessForm.governanceStageTimingField.votingPeriod');

    const earlyStageTagValue = earlyStageAdvance ? 'yes' : 'no';
    const earlyStageTagLabel = t(`app.createDao.createProcessForm.governanceStageTimingField.${earlyStageTagValue}`);

    const expirationTagValue = stageExpiration != null ? 'yes' : 'no';
    const expirationTagLabel = t(`app.createDao.createProcessForm.governanceStageTimingField.${expirationTagValue}`);

    return (
        <InputContainer
            id="stageTiming"
            useCustomWrapper={true}
            label={t('app.createDao.createProcessForm.governanceStageTimingField.label')}
            className="flex flex-col items-start gap-3"
        >
            <DefinitionList.Container className="rounded-xl border border-neutral-100 px-6 py-4">
                <DefinitionList.Item term={votingPeriodLabel}>{formatDuration(votingPeriod)}</DefinitionList.Item>
                {!isOptimisticStage && !isTimelockStage && (
                    <DefinitionList.Item
                        term={t('app.createDao.createProcessForm.governanceStageTimingField.earlyAdvance')}
                    >
                        <Tag
                            className="w-fit"
                            label={earlyStageTagLabel}
                            variant={earlyStageAdvance ? 'primary' : 'neutral'}
                        />
                    </DefinitionList.Item>
                )}
                <DefinitionList.Item term={t('app.createDao.createProcessForm.governanceStageTimingField.expiration')}>
                    <Tag
                        className="w-fit"
                        label={expirationTagLabel}
                        variant={stageExpiration != null ? 'primary' : 'neutral'}
                    />
                </DefinitionList.Item>
                {stageExpiration != null && (
                    <DefinitionList.Item
                        term={t('app.createDao.createProcessForm.governanceStageTimingField.expirationPeriod')}
                    >
                        {formatDuration(stageExpiration)}
                    </DefinitionList.Item>
                )}
            </DefinitionList.Container>
            <Button onClick={() => setIsTimingDialogOpen(true)} variant="tertiary" size="md">
                {t('app.createDao.createProcessForm.governanceStageTimingField.edit')}
            </Button>
            {isTimingDialogOpen && (
                <GovernanceStageTimingFieldDialog
                    onClose={() => setIsTimingDialogOpen(false)}
                    onSubmit={handleDialogSubmit}
                    stageType={stageType}
                    defaultValues={{ votingPeriod, earlyStageAdvance, stageExpiration }}
                />
            )}
        </InputContainer>
    );
};
