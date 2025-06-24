'use client';

import { useTranslations } from '@/shared/components/translationsProvider';
import { EmptyState } from '@aragon/gov-ui-kit';

export interface INotFoundDaoErrorProps {
    /**
     * URL to redirect users to.
     */
    url: string;
}

export const NotFoundDaoError: React.FC<INotFoundDaoErrorProps> = (props) => {
    const { url } = props;

    const { t } = useTranslations();

    return (
        <EmptyState
            heading={t('app.application.notFoundDao.title')}
            description={t('app.application.notFoundDao.description')}
            objectIllustration={{ object: 'MAGNIFYING_GLASS' }}
            primaryButton={{ label: t('app.application.notFoundDao.action'), href: url }}
        />
    );
};
