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
    supportThreshold?: number;
}

export const SupportThresholdField: React.FC<ISupportThresholdFieldProps> = (props) => {
    const { supportThreshold, supportThresholdFieldName } = props;

    const { t } = useTranslations();

    const supportThresholdNumber = supportThreshold ?? undefined;

    const majorityThreshold = 50;
    const isSupportThresholdMajority = supportThresholdNumber != null && supportThresholdNumber > majorityThreshold;

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
            valueLabel={`> ${supportThresholdNumber} %`}
            total={100}
            prefix=">"
            suffix="%"
            alert={supportThresholdNumber != null ? supportThresholdAlert : undefined}
            thresholdIndicator={majorityThreshold}
        />
    );
};
