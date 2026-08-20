import { notFound } from 'next/navigation-original';
import { SafeAccountPage } from '@/modules/safe/pages/safeAccountPage';
import type { ISafeAccountPageParams } from '@/modules/safe/types';
import { safeAccountUtils } from '@/modules/safe/utils/safeAccountUtils';

interface ISafePageProps {
    /**
     * Safe account route parameters.
     */
    params: Promise<ISafeAccountPageParams>;
}

// `next/navigation` is aliased to the app's client-side wrapper, so the server helpers are
// imported from `next/navigation-original`.
const SafePage = async (props: ISafePageProps) => {
    const safeAccount = safeAccountUtils.resolveSafeAccount(await props.params);

    if (safeAccount == null) {
        notFound();
    }

    return <SafeAccountPage {...safeAccount} />;
};

export default SafePage;
