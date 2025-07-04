import { AdvancedDateInputDuration } from '@/shared/components/forms/advancedDateInput/advancedDateInputDuration';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Card, InputContainer } from '@aragon/gov-ui-kit';

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

    const votingPeriodInfoText =
        bodyCount > 0 ? t('app.createDao.setupStageSettingsDialog.fields.stageDurationField.infoText') : undefined;

    return (
        <InputContainer
            className="flex flex-col"
            id="minDuration"
            useCustomWrapper={true}
            helpText={t(`app.createDao.setupStageSettingsDialog.fields.stageDurationField.helpText`)}
            label={t(`app.createDao.setupStageSettingsDialog.fields.stageDurationField.label`)}
        >
            <Card className="border border-neutral-100">
                <AdvancedDateInputDuration
                    field="votingPeriod"
                    label={t(`app.createDao.setupStageSettingsDialog.fields.stageDurationField.label`)}
                    infoDisplay="inline"
                    infoText={votingPeriodInfoText}
                    validateMinDuration={true}
                    minDuration={minVotingPeriod}
                />
            </Card>
        </InputContainer>
    );
};
