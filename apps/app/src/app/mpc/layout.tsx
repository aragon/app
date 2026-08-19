import { LayoutMpc } from '@/modules/mpc/components/layoutMpc';
import { metadataUtils } from '@/shared/utils/metadataUtils';

export const metadata = metadataUtils.buildMetadata({
    title: 'MPC systems (POC) | Aragon',
    description:
        'Proof of concept of MPC systems: 2-of-3 threshold keys with signing policies, approvals and activity.',
});

export default LayoutMpc;
