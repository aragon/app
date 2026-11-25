import type { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { Image } from '../image';

export interface INetworkBadgeProps {
    /**
     * Network whose logo to show.
     */
    network: Network;
}

/**
 * Network logo for the `badge` of a kit avatar, which sizes it. Its alt names the network, which some rows show
 * nowhere else.
 */
export const NetworkBadge: React.FC<INetworkBadgeProps> = (props) => {
    const { network } = props;

    const { name, logo } = networkDefinitions[network];

    return (
        <Image alt={name} className="object-cover" src={logo} title={name} />
    );
};
