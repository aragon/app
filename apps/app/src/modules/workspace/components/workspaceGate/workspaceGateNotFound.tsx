'use client';

import { EmptyState } from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';

/**
 * Rendered by `WorkspaceGate` in place of the page when the link names a workspace the registry does not hold and
 * no account, so there is no page to carry over to another workspace: it offers a way into the reader's own.
 *
 * Rendered here rather than through `notFound()`, whose page is the generic "Explore DAOs" one. The registry is
 * read on the client, so the response status stays 200 either way.
 */
export const WorkspaceGateNotFound: React.FC = () => {
    const { t } = useTranslations();

    return (
        <div className="flex grow items-center justify-center">
            <EmptyState
                description={t(
                    'app.workspace.workspaceGateNotFound.description',
                )}
                heading={t('app.workspace.workspaceGateNotFound.heading')}
                objectIllustration={{ object: 'NOT_FOUND' }}
                primaryButton={{
                    label: t('app.workspace.workspaceGateNotFound.action.open'),
                    href: '/workspace',
                }}
                secondaryButton={{
                    label: t(
                        'app.workspace.workspaceGateNotFound.action.create',
                    ),
                    href: '/create/workspace',
                }}
            />
        </div>
    );
};
