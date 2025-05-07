'use client';

import { useTranslations } from '@/shared/components/translationsProvider';
import type { IDaoPageParams } from '@/shared/types';
import { EmptyState } from '@aragon/gov-ui-kit';

export interface INotFoundDaoProps {
    /**
     * DAO page parameters.
     */
    params: IDaoPageParams;
}

export const NotFoundDao: React.FC<INotFoundDaoProps> = (props) => {
    const { params } = props;
    const { network, id } = params;

    const { t } = useTranslations();

    const dashboardUrl = `/dao/${network}/${id}/dashboard`;

    return (
        <div className="flex grow items-center justify-center">
            <EmptyState
                heading={t('app.application.notFoundDao.title')}
                description={t('app.application.notFoundDao.description')}
                objectIllustration={{ object: 'MAGNIFYING_GLASS' }}
                primaryButton={{ label: t('app.application.notFoundDao.action'), href: dashboardUrl }}
            />
        </div>
    );
};
