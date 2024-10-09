import { useStageFields } from '@/modules/governance/components/createProcessForm/hooks/useStagesFields';
import { useTranslations } from '@/shared/components/translationsProvider';
import { type IDateDuration } from '@/shared/utils/dateUtils';
import { Button, DefinitionList, Tag } from '@aragon/ods';

export interface ICreateProcessFormTimingSummaryProps {
    stageName: string;
    stageIndex: number;
    onEditTimingClick: () => void;
}

export const CreateProcessFormTimingSummary: React.FC<ICreateProcessFormTimingSummaryProps> = ({
    stageName,
    stageIndex,
    onEditTimingClick,
}) => {
    const { t } = useTranslations();
    const { votingPeriodField, earlyStageField, stageExpirationField, stageExpirationPeriodField, stageTypeField } =
        useStageFields(stageName, stageIndex);

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

        return units.map((unit) => `${unit.value} ${unit.label}`).join(', ');
    };

    return (
        <>
            <DefinitionList.Container className="rounded-xl border border-neutral-100 px-6 py-4">
                <DefinitionList.Item term={t('app.governance.createProcessForm.stage.timing.summary.votingPeriod')}>
                    {formatDuration(votingPeriodField.value as IDateDuration)}
                </DefinitionList.Item>
                {stageTypeField.value === 'normal' && (
                    <DefinitionList.Item term={t('app.governance.createProcessForm.stage.timing.summary.earlyAdvance')}>
                        <Tag
                            className="w-fit"
                            label={earlyStageField.value === true ? 'Yes' : 'No'}
                            variant={earlyStageField.value === true ? 'primary' : 'neutral'}
                        />
                    </DefinitionList.Item>
                )}
                <DefinitionList.Item term={t('app.governance.createProcessForm.stage.timing.summary.expiration')}>
                    <Tag
                        className="w-fit"
                        label={stageExpirationField.value === true ? 'Yes' : 'No'}
                        variant={stageExpirationField.value === true ? 'primary' : 'neutral'}
                    />
                </DefinitionList.Item>
                {stageExpirationField.value && (
                    <DefinitionList.Item term="Expiration period">
                        {formatDuration(stageExpirationPeriodField.value as IDateDuration)}
                    </DefinitionList.Item>
                )}
            </DefinitionList.Container>
            <Button onClick={onEditTimingClick} variant="tertiary" size="md" className="w-fit">
                {t('app.governance.createProcessForm.stage.timing.summary.edit')}
            </Button>
        </>
    );
};
