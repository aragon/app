import type { IDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, IconType } from '@aragon/gov-ui-kit';
import { NavigationAppLinksLegacy } from './navigationAppLinksLegacy';

export interface INavigationAppLinksProps {
    /**
     * The DAO to enable us to navigate to the correct dao dashboard in the legacy app.
     */
    dao?: IDao;
}

export const NavigationAppLinks: React.FC<INavigationAppLinksProps> = (props) => {
    const { dao } = props;

    const { t } = useTranslations();

    return (
        <div className="flex items-center gap-2">
            <Button
                target="_blank"
                href="https://aragonassociation.atlassian.net/servicedesk/customer/portal/3"
                iconRight={IconType.FEEDBACK}
                variant="tertiary"
                size="sm"
                className="hidden md:flex"
            >
                {t('app.application.navigation.appLinks.contact')}
            </Button>
            <NavigationAppLinksLegacy dao={dao} />
        </div>
    );
};
