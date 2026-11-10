// The `next/navigation` alias points to the client-hooks wrapper, which cannot re-export server functions.
import { notFound } from 'next/navigation-original';
import { featureFlags } from '@/shared/featureFlags';
import { WorkspaceDemoPageClient } from './workspaceDemoPageClient';

export const WorkspaceDemoPage: React.FC = async () => {
    if (!(await featureFlags.isEnabled('workspaces'))) {
        notFound();
    }

    return <WorkspaceDemoPageClient />;
};
