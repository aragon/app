'use client';

import { Spinner } from '@aragon/gov-ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    workspaceService,
    workspaceServiceKeys,
} from '../../api/workspaceService';
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
    const queryClient = useQueryClient();
    const installPromiseRef = useRef<Promise<void> | null>(null);

    useEffect(() => {
        let isActive = true;

        const openDemo = async () => {
            try {
                installPromiseRef.current ??= (async () => {
                    await workspaceService.importWorkspaceRegistry(
                        JSON.stringify(workspaceDemoFixture),
                        true,
                    );
                    await Promise.all([
                        queryClient.invalidateQueries({
                            queryKey: workspaceServiceKeys.workspaceList(),
                        }),
                        ...Object.keys(workspaceDemoFixture).map((id) =>
                            queryClient.invalidateQueries({
                                queryKey: workspaceServiceKeys.workspace({
                                    urlParams: { id },
                                }),
                            }),
                        ),
                    ]);
                })();
                await installPromiseRef.current;

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
    }, [queryClient, router]);

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
