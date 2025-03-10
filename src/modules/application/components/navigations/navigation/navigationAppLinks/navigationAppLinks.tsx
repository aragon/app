import type { IDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, IconType } from '@aragon/gov-ui-kit';
import { LegacyAppLink } from './legacyAppLink';

export interface INavigationAppLinksProps {
    /**
     * The DAO to enable us to navigate to the correct dao dashboard in the legacy app.
     */
    dao?: IDao;
}

const feedbackUrl = 'https://aragonassociation.atlassian.net/servicedesk/customer/portal/3';

export const NavigationAppLinks: React.FC<INavigationAppLinksProps> = (props) => {
    const { dao } = props;

    const { t } = useTranslations();

    return (
        <div className="flex items-center gap-3">
            <Button
                target="_blank"
                href={feedbackUrl}
                iconRight={IconType.FEEDBACK}
                variant="tertiary"
                size="sm"
                className="hidden md:flex"
            >
                {t('app.application.navigationAppLinks.feedback')}
            </Button>
            <LegacyAppLink dao={dao} />
        </div>
    );
};
