import { NumberProgressInput } from '@/shared/components/forms/numberProgressInput';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface ISupportThresholdFieldProps {
    /**
     * The field name for the supportThreshold field.
     */
    supportThresholdFieldName: string;
    /**
     * The support threshold value.
     */
    supportThreshold: number;
    /**
     * current support threshold from settings
     */
    currentSupportThreshold: number;
}

export const SupportThresholdField: React.FC<ISupportThresholdFieldProps> = (props) => {
    const { supportThreshold, supportThresholdFieldName, currentSupportThreshold } = props;

    const { t } = useTranslations();

    const isSupportThresholdMajority = supportThreshold > 50;

    const supportThresholdContext = isSupportThresholdMajority ? 'majority' : 'minority';
    const supportThresholdAlert = {
        message: t(`app.plugins.token.tokenUpdateSettingsAction.supportThreshold.alert.${supportThresholdContext}`),
        variant: isSupportThresholdMajority ? 'success' : 'warning',
    } as const;

    return (
        <NumberProgressInput
            fieldName={supportThresholdFieldName}
            label={t('app.plugins.token.tokenUpdateSettingsAction.supportThreshold.label')}
            helpText={t('app.plugins.token.tokenUpdateSettingsAction.supportThreshold.helpText')}
            valueLabel={`> ${supportThreshold.toString()} %`}
            total={100}
            prefix=">"
            suffix="%"
            alert={supportThresholdAlert}
            thresholdIndicator={currentSupportThreshold}
            tags={[
                { label: 'Yes', variant: 'primary' },
                { label: 'No', variant: 'neutral' },
            ]}
        />
    );
};
