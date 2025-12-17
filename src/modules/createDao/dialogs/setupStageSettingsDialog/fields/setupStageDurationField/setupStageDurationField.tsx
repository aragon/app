import { Card, InputContainer } from '@aragon/gov-ui-kit';
import { AdvancedDateInputDuration } from '@/shared/components/forms/advancedDateInput/advancedDateInputDuration';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface ISetupStageDurationFieldProps {
    /**
     * Number of bodies of the stage.
     */
    bodyCount: number;
}

const minVotingPeriod = { days: 0, hours: 1, minutes: 0 };

export const SetupStageDurationField: React.FC<ISetupStageDurationFieldProps> = (props) => {
    const { bodyCount } = props;

    const { t } = useTranslations();

    const votingPeriodInfoText = bodyCount > 0 ? t('app.createDao.setupStageSettingsDialog.fields.stageDurationField.infoText') : undefined;

    return (
        <InputContainer
            className="flex flex-col"
            helpText={t('app.createDao.setupStageSettingsDialog.fields.stageDurationField.helpText')}
            id="minDuration"
            label={t('app.createDao.setupStageSettingsDialog.fields.stageDurationField.label')}
            useCustomWrapper={true}
        >
            <Card className="border border-neutral-100">
                <AdvancedDateInputDuration
                    field="votingPeriod"
                    infoDisplay="inline"
                    infoText={votingPeriodInfoText}
                    label={t('app.createDao.setupStageSettingsDialog.fields.stageDurationField.label')}
                    minDuration={minVotingPeriod}
                    validateMinDuration={true}
                />
            </Card>
        </InputContainer>
    );
};
