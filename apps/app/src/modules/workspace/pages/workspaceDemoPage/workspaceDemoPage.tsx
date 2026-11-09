// The `next/navigation` alias points to the client-hooks wrapper, which cannot re-export server functions.
import { notFound } from 'next/navigation-original';
import { featureFlags } from '@/shared/featureFlags';
import { WorkspaceDemoPageClient } from './workspaceDemoPageClient';

export interface IWorkspaceDemoPageProps {
    path?: string[];
}

const accountTypeById: Record<string, 'dao' | 'safe'> = {
    'aragon-x': 'dao',
    'operations-safe': 'safe',
    'grants-safe': 'safe',
};
const accountSections: Record<string, true> = {
    dashboard: true,
    proposals: true,
    transactions: true,
    assets: true,
    members: true,
};

const isValidPath = (path: string[]) => {
    const accountType = accountTypeById[path[1] ?? ''];
    const section = path[2];

    return (
        path.length === 0 ||
        (path.length === 1 &&
            (path[0] === 'dashboard' || path[0] === 'accounts')) ||
        (path[0] === 'account' &&
            accountType != null &&
            (path.length === 2 ||
                (path.length === 3 &&
                    accountSections[section ?? ''] === true &&
                    (section !== 'proposals' || accountType === 'dao'))))
    );
};

/**
 * Static, read-only workspace demo. It deliberately bypasses the local workspace registry so opening it cannot
 * create or update a workspace on this device.
 */
export const WorkspaceDemoPage: React.FC<IWorkspaceDemoPageProps> = async (
    props,
) => {
    const { path = [] } = props;

    if (!(await featureFlags.isEnabled('workspaces')) || !isValidPath(path)) {
        notFound();
    }

    return <WorkspaceDemoPageClient path={path} />;
};
