'use client';

import { createContext, type ReactNode, useContext } from 'react';

export interface IWorkspaceBaseUrlProviderProps {
    /**
     * Base URL of the workspace, e.g. `/workspace/{id}`.
     */
    baseUrl: string;
    /**
     * Children of the provider.
     */
    children?: ReactNode;
}

const WorkspaceBaseUrlContext = createContext<string | undefined>(undefined);

/**
 * Marks everything below it as rendered inside a workspace, so the DAO components it embeds link there.
 *
 * The DAO pages live under `/dao/{network}/{addressOrEns}` and build their links from the DAO itself, which is the
 * right answer there and stays the default outside this provider. The workspace embeds those same components —
 * proposal lists on several of its pages — and wraps them so their links keep the reader inside it.
 *
 * Read at the point a link is built rather than passed as a prop, so a list nested at any depth links correctly
 * without every component in between having to forward it.
 */
export const WorkspaceBaseUrlProvider: React.FC<
    IWorkspaceBaseUrlProviderProps
> = (props) => {
    const { baseUrl, children } = props;

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
