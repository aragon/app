import { notFound } from 'next/navigation-original';
import { ExploreDaosPage } from '@/modules/explore/pages/exploreDaosPage';
import { featureFlags } from '@/shared/featureFlags';

const ExplorePage = async () => {
    if (!(await featureFlags.isEnabled('workspaces'))) {
        notFound();
    }

    return <ExploreDaosPage />;
};

export default ExplorePage;
