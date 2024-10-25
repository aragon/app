import { useTranslations } from '@/shared/components/translationsProvider';
import type { IDateDuration } from '@/shared/utils/dateUtils';
import { Button, DefinitionList, InputContainer, Tag } from '@aragon/gov-ui-kit';
import { useId, useState } from 'react';
import { useWatch } from 'react-hook-form';
import type { ICreateProcessFormStage } from '../../../createProcessFormDefinitions';
import { StageTimingFieldDialog } from './stageTimingFieldDialog';

export interface IStageTimingFieldProps {
    /**
     * Name of the current stage field.
     */
    stageFieldName: string;
    /**
     * Defines if current stage is optimistic or not.
     */
    isOptimisticStage: boolean;
}

export const StageTimingField: React.FC<IStageTimingFieldProps> = (props) => {
    const { stageFieldName, isOptimisticStage } = props;

    const { t } = useTranslations();
    const inputId = useId();

    const [isTimingDialogOpen, setIsTimingDialogOpen] = useState(false);

    const votingPeriod = useWatch<Record<string, ICreateProcessFormStage['votingPeriod']>>({
        name: `${stageFieldName}.votingPeriod`,
    });

    const earlyStageAdvance = useWatch<Record<string, ICreateProcessFormStage['earlyStageAdvance']>>({
        name: `${stageFieldName}.earlyStageAdvance`,
    });

    const stageExpiration = useWatch<Record<string, ICreateProcessFormStage['stageExpiration']>>({
        name: `${stageFieldName}.stageExpiration`,
    });

    const formatDuration = (duration: IDateDuration): string => {
        const units = [
            { value: duration.days, label: 'days' },
            { value: duration.hours, label: 'hours' },
            { value: duration.minutes, label: 'minutes' },
        ];

        while (units.length > 0 && units[0].value === 0) {
            units.shift();
        }

        while (units.length > 0 && units[units.length - 1].value === 0) {
            units.pop();
        }

        if (units.length === 0) {
            return '0 minutes';
        }

        return units.map((unit) => `${unit.value.toString()} ${unit.label}`).join(', ');
    };

    return (
        <InputContainer
            id={inputId}
            useCustomWrapper={true}
            label={t('app.governance.createProcessForm.stage.timing.label')}
            className="flex w-full flex-col items-start gap-y-3"
            helpText={t('app.governance.createProcessForm.stage.timing.helpText')}
        >
            <DefinitionList.Container className="rounded-xl border border-neutral-100 px-6 py-4">
                <DefinitionList.Item term={t('app.governance.createProcessForm.stage.timing.summary.votingPeriod')}>
                    {formatDuration(votingPeriod)}
                </DefinitionList.Item>
                {!isOptimisticStage && (
                    <DefinitionList.Item term={t('app.governance.createProcessForm.stage.timing.summary.earlyAdvance')}>
                        <Tag
                            className="w-fit"
                            label={earlyStageAdvance ? 'Yes' : 'No'}
                            variant={earlyStageAdvance ? 'primary' : 'neutral'}
                        />
                    </DefinitionList.Item>
                )}
                <DefinitionList.Item term={t('app.governance.createProcessForm.stage.timing.summary.expiration')}>
                    <Tag
                        className="w-fit"
                        label={stageExpiration != null ? 'Yes' : 'No'}
                        variant={stageExpiration != null ? 'primary' : 'neutral'}
                    />
                </DefinitionList.Item>
                {stageExpiration && (
                    <DefinitionList.Item term="Expiration period">
                        {formatDuration(stageExpiration)}
                    </DefinitionList.Item>
                )}
            </DefinitionList.Container>
            <Button onClick={() => setIsTimingDialogOpen(true)} variant="tertiary" size="md" className="w-fit">
                {t('app.governance.createProcessForm.stage.timing.summary.edit')}
            </Button>
            <StageTimingFieldDialog
                stageFieldName={stageFieldName}
                isTimingDialogOpen={isTimingDialogOpen}
                setIsTimingDialogOpen={setIsTimingDialogOpen}
                isOptimisticStage={isOptimisticStage}
            />
        </InputContainer>
    );
};
