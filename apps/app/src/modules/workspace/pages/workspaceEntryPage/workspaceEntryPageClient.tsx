'use client';

import { Spinner } from '@aragon/gov-ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { Page } from '@/shared/components/page';
import {
    type IWorkspace,
    useGetOrCreateDefaultWorkspace,
    workspaceServiceKeys,
} from '../../api/workspaceService';
import {
    workspaceAllAccountsSegment,
    workspaceUtils,
} from '../../utils/workspaceUtils';

export interface IWorkspaceEntryPageClientProps {}

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

    // Make sure seeding is called only once
    const hasSeedingRunRef = useRef(false);

    useEffect(() => {
        if (hasSeedingRunRef.current) {
            return;
        }

        hasSeedingRunRef.current = true;
        mutate();
    }, [mutate]);

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
