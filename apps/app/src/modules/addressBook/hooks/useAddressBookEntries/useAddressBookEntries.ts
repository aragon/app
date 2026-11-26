'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { useWorkspaceList } from '@/modules/workspace/api/workspaceService';
import type { IWorkspacePageParams } from '@/shared/types';
import { addressBookUtils } from '../../utils/addressBookUtils';

/**
 * The entries the kit reads to name addresses, built from the workspace list of the route's registry. Computed once and
 * reused until the list or the current workspace changes.
 */
export const useAddressBookEntries = () => {
    // Null outside the App Router, e.g. in tests that do not mock the route.
    const workspaceId = useParams<Partial<IWorkspacePageParams>>()?.workspaceId;
    const { data: workspaces } = useWorkspaceList();

    return useMemo(
        () => addressBookUtils.buildEntries(workspaces ?? [], workspaceId),
        [workspaces, workspaceId],
    );
};
