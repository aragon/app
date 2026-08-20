import { notFound } from 'next/navigation-original';
import { SafeAccountPage } from '@/modules/safe/pages/safeAccountPage';
import type { ISafeAccountPageParams } from '@/modules/safe/types';
import { networkUtils } from '@/shared/utils/networkUtils';

interface ISafePageProps {
    /**
     * Safe account route parameters.
     */
    params: Promise<ISafeAccountPageParams>;
}

// `next/navigation` is aliased to the app's client-side wrapper, so the server helpers are
// imported from `next/navigation-original`.
const SafePage = async (props: ISafePageProps) => {
    const { network, address } = await props.params;

    // A malformed network is a missing page, never a server error. The address is normalised to
    // its checksum in the client page, matching how the DAO page resolves its parameters.
    if (!networkUtils.isValidNetwork(network)) {
        notFound();
    }

    return <SafeAccountPage network={network} address={address} />;
};

export default SafePage;
