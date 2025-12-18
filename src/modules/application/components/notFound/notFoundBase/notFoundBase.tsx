'use client';

import { EmptyState } from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface INotFoundBaseProps {}

export const NotFoundBase: React.FC<INotFoundBaseProps> = () => {
    const { t } = useTranslations();

    return (
        <div className="flex grow items-center justify-center">
            <EmptyState
                description={t('app.application.notFoundBase.description')}
                heading={t('app.application.notFoundBase.title')}
                objectIllustration={{ object: 'MAGNIFYING_GLASS' }}
                primaryButton={{ label: t('app.application.notFoundBase.action'), href: '/' }}
            />
        </div>
    );
};
