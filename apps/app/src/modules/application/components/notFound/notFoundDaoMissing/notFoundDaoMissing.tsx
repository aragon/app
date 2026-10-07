'use client';

import { EmptyState } from '@aragon/gov-ui-kit';
import { useSafeTranslations } from '@/shared/components/translationsProvider';

export interface INotFoundDaoMissingProps {}

/**
 * Not-found page of the DAO routes: the URL names a network we do not support or a DAO the
 * backend does not know.
 */
export const NotFoundDaoMissing: React.FC<INotFoundDaoMissingProps> = () => {
    // not-found can render outside TranslationsProvider (e.g. notFound() during a
    // POST/server-action), so use the safe variant to avoid throwing there.
    const { t } = useSafeTranslations();

    return (
        <div className="flex grow items-center justify-center">
            <EmptyState
                description={t(
                    'app.application.notFoundDaoMissing.description',
                )}
                heading={t('app.application.notFoundDaoMissing.title')}
                objectIllustration={{ object: 'MAGNIFYING_GLASS' }}
                primaryButton={{
                    label: t('app.application.notFoundDaoMissing.action'),
                    href: '/',
                }}
            />
        </div>
    );
};
