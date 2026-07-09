'use client';

import { EmptyState } from '@aragon/gov-ui-kit';
import { useSafeTranslations } from '@/shared/components/translationsProvider';

export interface INotFoundBaseProps {}

export const NotFoundBase: React.FC<INotFoundBaseProps> = () => {
    // not-found can render outside TranslationsProvider (e.g. notFound() during a
    // POST/server-action), so use the safe variant to avoid throwing there.
    const { t } = useSafeTranslations();

    return (
        <div className="flex grow items-center justify-center">
            <EmptyState
                description={t('app.application.notFoundBase.description')}
                heading={t('app.application.notFoundBase.title')}
                objectIllustration={{ object: 'MAGNIFYING_GLASS' }}
                primaryButton={{
                    label: t('app.application.notFoundBase.action'),
                    href: '/',
                }}
            />
        </div>
    );
};
