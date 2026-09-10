import { Page } from '@/shared/components/page';
import type { ISafeAccountPageParams } from '../../types';
import { SafeAccountPageClient } from './safeAccountPageClient';

export interface ISafeAccountPageProps extends ISafeAccountPageParams {}

export const SafeAccountPage: React.FC<ISafeAccountPageProps> = (props) => {
    const { network, address } = props;

    return (
        <Page.Container>
            <SafeAccountPageClient address={address} network={network} />
        </Page.Container>
    );
};
