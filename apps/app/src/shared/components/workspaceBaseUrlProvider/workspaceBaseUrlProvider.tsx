'use client';

import { usePathname } from 'next/navigation';
import { createContext, type ReactNode, useContext, useMemo } from 'react';

export interface IWorkspaceBaseUrlProviderProps {
    /**
     * Children of the provider.
     */
    children?: ReactNode;
}

const WorkspaceBaseUrlContext = createContext<string | undefined>(undefined);

/**
 * Base URL of the workspace the current page belongs to, `/workspace/{id}`, or undefined outside one.
 */
export const workspaceUrlSegment = 'workspace';

/**
 * Tells everything below it that it is rendered inside a workspace, so the DAO components it embeds link there.
 *
 * The DAO pages live under `/dao/{network}/{addressOrEns}` and build their links from the DAO itself, which is the
 * right answer there and stays the default outside a workspace. The workspace embeds those same components —
 * proposal lists on several of its pages — and this keeps their links inside it.
 *
 * Read at the point a link is built rather than passed as a prop, so a list nested at any depth links correctly
 * without every component in between having to forward it.
 *
 * The workspace is read from the path rather than taken as a prop so that this can sit at the root of the
 * application, above the dialog root. Dialogs render as siblings of the page rather than inside it, so a provider
 * mounted in the workspace layout would not reach them — and they navigate too, e.g. the button offering to leave
 * while a transaction is still being indexed.
 */
export const WorkspaceBaseUrlProvider: React.FC<
    IWorkspaceBaseUrlProviderProps
> = (props) => {
    const { children } = props;

    const pathname = usePathname();

    const baseUrl = useMemo(() => {
        const [, firstSegment, workspaceId] = pathname?.split('/') ?? [];

        if (firstSegment !== workspaceUrlSegment || !workspaceId) {
            return undefined;
        }

        return `/${workspaceUrlSegment}/${workspaceId}`;
    }, [pathname]);

    return (
        <WorkspaceBaseUrlContext value={baseUrl}>
            {children}
        </WorkspaceBaseUrlContext>
    );
};

/**
 * Base URL of the workspace the components are rendered in, undefined outside one — which is the DAO pages, where
 * links are built from the DAO itself.
 */
export const useWorkspaceBaseUrl = (): string | undefined =>
    useContext(WorkspaceBaseUrlContext);
