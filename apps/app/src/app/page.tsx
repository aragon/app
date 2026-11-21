import { LandingPage } from '@/modules/application/pages/landingPage';
import { ExploreDaosPage } from '@/modules/explore/pages/exploreDaosPage';
import { featureFlags } from '@/shared/featureFlags';

export default async function HomePage() {
    return (await featureFlags.isEnabled('workspaces')) ? (
        <LandingPage />
    ) : (
        <ExploreDaosPage />
    );
}
