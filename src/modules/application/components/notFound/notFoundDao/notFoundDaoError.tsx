'use client';

import { EmptyState } from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';

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
            description={t('app.application.notFoundDao.description')}
            heading={t('app.application.notFoundDao.title')}
            objectIllustration={{ object: 'MAGNIFYING_GLASS' }}
            primaryButton={{ label: t('app.application.notFoundDao.action'), href: url }}
        />
    );
};
