'use client';

import { Card, EmptyState, Spinner } from '@aragon/gov-ui-kit';
import type { ReactNode } from 'react';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IWorkspaceAccountGateProps {
    /**
     * ID of the account the page below is scoped to, which doubles as the ID of its DAO.
     */
    accountId: string;
    /**
     * Children rendered once the DAO of the account has resolved.
     */
    children?: ReactNode;
}

/**
 * Renders the page of one workspace account only once the DAO of that account has resolved, the counterpart of
 * `WorkspaceGate` one level down.
 *
 * The pages below are DAO pages, and a DAO page assumes a resolved DAO: it reads it with `useDao` and renders
 * whatever it can from `undefined` otherwise. Under the DAO routes that assumption holds because the DAO layout
 * fails the route when the DAO cannot be read. It does not hold here — a workspace account may be a Safe, or an
 * address the backend does not index, and `LayoutWorkspaceAccount` deliberately prefetches with `prefetchQuery`,
 * which resolves rather than throws, so that the sections needing no DAO keep working. Owning the failure here is
 * what keeps a half-rendered DAO page from standing in for an error state.
 */
export const WorkspaceAccountGate: React.FC<IWorkspaceAccountGateProps> = (
    props,
) => {
    const { accountId, children } = props;

    const { t } = useTranslations();

    // Read under the key `LayoutWorkspaceAccount` prefetches, so this is the hydrated entry and not a new request.
    // The page below then reads the same entry once mounted.
    // Filtering for Safes should be done here as well. In that case this can be wrapped around the entire account level folder
    const { isPending, isError } = useDao({ urlParams: { id: accountId } });

    // The page must not be mounted for a DAO that failed to load: its own read of the DAO would refetch the failed
    // query on mount, which reads as pending again and would swap the error back for the page in a loop.
    if (isError) {
        return (
            <Page.Container>
                <Page.Content>
                    <Page.Main>
                        <Card className="border border-neutral-100 py-10">
                            <EmptyState
                                description={t(
                                    'app.workspace.workspaceAccountGate.error.description',
                                )}
                                heading={t(
                                    'app.workspace.workspaceAccountGate.error.heading',
                                )}
                                objectIllustration={{ object: 'WARNING' }}
                            />
                        </Card>
                    </Page.Main>
                </Page.Content>
            </Page.Container>
        );
    }

    // Only reached when the prefetch above did not resolve, i.e. on the way to the error state: a resolved DAO is
    // hydrated and therefore never pending here.
    if (isPending) {
        return (
            <Page.Container>
                <Page.Content>
                    <Page.Main>
                        <div className="flex justify-center py-20">
                            <Spinner size="lg" variant="neutral" />
                        </div>
                    </Page.Main>
                    {/* Reserves the aside column of the page, so the layout does not jump once it mounts. */}
                    <Page.Aside />
                </Page.Content>
            </Page.Container>
        );
    }

    return children;
};
