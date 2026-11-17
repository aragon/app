'use client';

import { Spinner } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { useWalletConnected } from '@/modules/application/hooks/useWalletConnected';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useIsMounted } from '@/shared/hooks/useIsMounted';
import { useWorkspaceList } from '../../api/workspaceService';
import {
    workspaceAllAccountsSegment,
    workspaceUtils,
} from '../../utils/workspaceUtils';
import { WorkspaceGettingStarted } from './workspaceGettingStarted';

export interface IWorkspaceEntryPageClientProps {}

type WorkspaceEntryOutcome = 'open' | 'landing' | 'gettingStarted' | 'wait';

export const WorkspaceEntryPageClient: React.FC<
    IWorkspaceEntryPageClientProps
> = () => {
    const { t } = useTranslations();
    const router = useRouter();
    const { data: workspaces, error } = useWorkspaceList();
    const { address, isConnecting, isReconnecting } = useWalletAccount();
    const isConnected = useWalletConnected();
    const isMounted = useIsMounted();

    const firstWorkspaceId = workspaces?.[0]?.id;
    // Only an empty list waits on the wallet. AppKit lags wagmi on load (see DesyncWatcher), so both must agree.
    const isWalletSettled =
        isMounted &&
        !isConnecting &&
        !isReconnecting &&
        (isConnected || address == null);
    const isEmptyAndSettled =
        workspaces != null && firstWorkspaceId == null && isWalletSettled;

    // Latched: once shown, Getting started owns the page until it navigates away.
    const [hasGettingStarted, setHasGettingStarted] = useState(false);

    const getOutcome = (): WorkspaceEntryOutcome => {
        if (hasGettingStarted) {
            return 'gettingStarted';
        }

        if (firstWorkspaceId != null) {
            return 'open';
        }

        if (!isEmptyAndSettled) {
            return 'wait';
        }

        return isConnected ? 'gettingStarted' : 'landing';
    };
    const outcome = getOutcome();

    if (outcome === 'gettingStarted' && !hasGettingStarted) {
        setHasGettingStarted(true);
    }

    useEffect(() => {
        if (outcome === 'open' && firstWorkspaceId != null) {
            router.replace(
                workspaceUtils.getAccountScopeUrl(
                    firstWorkspaceId,
                    workspaceAllAccountsSegment,
                    'overview',
                ),
            );
        } else if (outcome === 'landing') {
            router.replace('/');
        }
    }, [outcome, firstWorkspaceId, router]);

    if (outcome === 'gettingStarted') {
        return <WorkspaceGettingStarted />;
    }

    if (error != null) {
        return (
            <Page.Error
                descriptionKey="app.workspace.workspaceEntryPage.error.description"
                error={error}
                titleKey="app.workspace.workspaceEntryPage.error.title"
            />
        );
    }

    // The workspace route can be slow to load; the short wallet wait shows nothing.
    if (outcome === 'open') {
        return (
            <div
                className="flex grow flex-col items-center justify-center gap-3 py-20 text-neutral-500"
                role="status"
            >
                <Spinner size="lg" variant="neutral" />
                <p className="text-base leading-tight">
                    {t('app.workspace.workspaceEntryPage.opening')}
                </p>
            </div>
        );
    }

    return null;
};
