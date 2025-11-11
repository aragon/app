import { useTranslations } from '@/shared/components/translationsProvider';
import { AlertCard } from '@aragon/gov-ui-kit';

export const GaugeRegistrarActiveVotingAlert = () => {
    const { t } = useTranslations();

    return (
        <AlertCard message={t('app.actions.gaugeRegistrar.gaugeRegistrarActiveVotingAlert.title')} variant="info">
            {t('app.actions.gaugeRegistrar.gaugeRegistrarActiveVotingAlert.message')}
        </AlertCard>
    );
};
