'use client';

import { Spinner } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslations } from '@/shared/components/translationsProvider';
import { workspaceService } from '../../api/workspaceService';
import {
    workspaceAllAccountsSegment,
    workspaceUtils,
} from '../../utils/workspaceUtils';
import workspaceDemoFixture from './workspaceDemo.fixture.json';

const demoWorkspaceId = 'aragon-demo';
const demoWorkspaceUrl = workspaceUtils.getAccountScopeUrl(
    demoWorkspaceId,
    workspaceAllAccountsSegment,
    'overview',
);

/** Installs the demo fixture into the local registry, then opens it through the regular workspace routes. */
export const WorkspaceDemoPageClient: React.FC = () => {
    const router = useRouter();
    const { t } = useTranslations();
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        let isActive = true;

        const openDemo = async () => {
            try {
                const workspaces = await workspaceService.getWorkspaceList();
                const demoWorkspace = workspaces.find(
                    (workspace) => workspace.id === demoWorkspaceId,
                );

                if (demoWorkspace == null) {
                    await workspaceService.importWorkspaceRegistry(
                        JSON.stringify(workspaceDemoFixture),
                        true,
                    );
                } else if (!demoWorkspace.isDemo) {
                    const { id, ...body } = demoWorkspace;
                    await workspaceService.updateWorkspace({
                        urlParams: { id },
                        body: { ...body, isDemo: true },
                    });
                }

                if (isActive) {
                    router.replace(demoWorkspaceUrl);
                }
            } catch {
                if (isActive) {
                    setHasError(true);
                }
            }
        };

        openDemo();

        return () => {
            isActive = false;
        };
    }, [router]);

    return (
        <main className="flex min-h-screen items-center justify-center p-6">
            {hasError ? (
                <p className="text-critical-500" role="alert">
                    {t('app.workspace.demo.error')}
                </p>
            ) : (
                <div className="flex items-center gap-3 text-neutral-500">
                    <Spinner size="lg" variant="neutral" />
                    <p>{t('app.workspace.demo.settingUp')}</p>
                </div>
            )}
        </main>
    );
};
