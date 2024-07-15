'use client';

import { useTranslations } from '@/shared/components/translationsProvider';
import { EmptyState } from '@aragon/ods';

export interface INotFoundBaseProps {}

export const NotFoundBase: React.FC<INotFoundBaseProps> = () => {
    const { t } = useTranslations();

    return (
        <div className="flex grow items-center justify-center">
            <EmptyState
                heading={t('app.application.notFoundBase.title')}
                description={t('app.application.notFoundBase.description')}
                objectIllustration={{ object: 'MAGNIFYING_GLASS' }}
                primaryButton={{ label: t('app.application.notFoundBase.action'), href: '/' }}
            />
        </div>
    );
};
