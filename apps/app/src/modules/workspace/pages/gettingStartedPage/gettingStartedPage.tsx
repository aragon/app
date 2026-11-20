// The `next/navigation` alias points to the client-hooks wrapper, which cannot re-export server functions.
import { notFound } from 'next/navigation-original';
import { Page } from '@/shared/components/page';
import { featureFlags } from '@/shared/featureFlags';
import { GettingStartedPageClient } from './gettingStartedPageClient';

export interface IGettingStartedPageProps {}

export const GettingStartedPage: React.FC<
    IGettingStartedPageProps
> = async () => {
    if (!(await featureFlags.isEnabled('workspaces'))) {
        notFound();
    }

    return (
        <Page.Container>
            <GettingStartedPageClient />
        </Page.Container>
    );
};
