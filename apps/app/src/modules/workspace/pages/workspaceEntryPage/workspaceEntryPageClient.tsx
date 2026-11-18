'use client';

import { Spinner } from '@aragon/gov-ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { Page } from '@/shared/components/page';
import {
    type IWorkspace,
    useGetOrCreateDefaultWorkspace,
    useWorkspaceList,
    workspaceServiceKeys,
} from '../../api/workspaceService';
import {
    workspaceAllAccountsSegment,
    workspaceUtils,
} from '../../utils/workspaceUtils';

export interface IWorkspaceEntryPageClientProps {}

const gettingStartedUrl = '/getting-started';

/**
 * FTUE entry of a connected user: the first workspace of the registry, or the Getting started wizard when the
 * registry holds none.
 */
export const WorkspaceEntryPageClient: React.FC<
    IWorkspaceEntryPageClientProps
> = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const handleSuccess = async (workspace: IWorkspace) => {
        await queryClient.invalidateQueries({
            queryKey: workspaceServiceKeys.workspaceList(),
        });

        router.replace(
            workspaceUtils.getAccountScopeUrl(
                workspace.id,
                workspaceAllAccountsSegment,
                'overview',
            ),
        );
    };

    const { mutate, error } = useGetOrCreateDefaultWorkspace({
        onSuccess: handleSuccess,
    });

    // Write the registry only once, and only when it already holds a workspace: an empty registry sends the user to
    // Getting started instead of seeding an empty workspace they did not ask for.
    const hasSeedingRunRef = useRef(false);

    const { data: workspaces } = useWorkspaceList();

    useEffect(() => {
        if (hasSeedingRunRef.current || workspaces == null) {
            return;
        }

        hasSeedingRunRef.current = true;

        if (workspaces.length === 0) {
            router.replace(gettingStartedUrl);
            return;
        }

        mutate();
    }, [workspaces, mutate, router]);

    if (error != null) {
        return (
            <Page.Error
                descriptionKey="app.workspace.workspaceEntryPage.error.description"
                error={error}
                titleKey="app.workspace.workspaceEntryPage.error.title"
            />
        );
    }

    return (
        <div className="flex grow items-center justify-center py-20">
            <Spinner size="lg" variant="neutral" />
        </div>
    );
};
