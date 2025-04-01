import { Link } from '@/shared/components/link';
import { useTranslations } from '@/shared/components/translationsProvider';
import { AlertCard } from '@aragon/gov-ui-kit';

export const RequiresWrappingAlert = () => {
    const { t } = useTranslations();

    return (
        <AlertCard
            variant="warning"
            message={t('app.plugins.token.tokenSetupMembership.importToken.requiresWrappingAlert.message')}
            description={
                <span className="flex flex-col gap-3">
                    <span className="flex flex-col gap-6">
                        <span>
                            {t('app.plugins.token.tokenSetupMembership.importToken.requiresWrappingAlert.description1')}
                        </span>
                        <span>
                            {t('app.plugins.token.tokenSetupMembership.importToken.requiresWrappingAlert.description2')}
                        </span>
                    </span>

                    <Link
                        href="https://docs.aragon.org/token-voting/1.x/importing-existent-tokens.html"
                        target="_blank"
                    >
                        {t('app.plugins.token.tokenSetupMembership.importToken.requiresWrappingAlert.infoLabel')}
                    </Link>
                </span>
            }
        />
    );
};
