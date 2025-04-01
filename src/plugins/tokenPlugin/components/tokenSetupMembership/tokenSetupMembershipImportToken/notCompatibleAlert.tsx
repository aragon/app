import { Link } from '@/shared/components/link';
import { useTranslations } from '@/shared/components/translationsProvider';
import { AlertCard } from '@aragon/gov-ui-kit';

export const NotCompatibleAlert = () => {
    const { t } = useTranslations();

    return (
        <AlertCard
            variant="critical"
            message={t('app.plugins.token.tokenSetupMembership.importToken.notCompatibleAlert.message')}
            description={
                <div className="flex flex-col gap-3">
                    <div>{t('app.plugins.token.tokenSetupMembership.importToken.notCompatibleAlert.description')}</div>

                    <Link
                        href="https://docs.aragon.org/token-voting/1.x/importing-existent-tokens.html"
                        target="_blank"
                    >
                        {t('app.plugins.token.tokenSetupMembership.importToken.notCompatibleAlert.infoLabel')}
                    </Link>
                </div>
            }
        />
    );
};
