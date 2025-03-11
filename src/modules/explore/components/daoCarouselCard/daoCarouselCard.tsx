import { type Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { DaoDataListItem } from '@aragon/gov-ui-kit';

export interface IDaoCarouselCardProps {
    /**
     * Name of the DAO.
     */
    name: string;
    /**
     * Contract address of the DAO.
     */
    address: string;
    /**
     * Logo source of the DAO.
     */
    logoSrc?: string;
    /**
     * The network on which the DAO is deployed.
     */
    network: Network | string;
    /**
     * Description of the DAO.
     */
    description: string;
    /**
     * Override URL for the card. If set, the card will open the URL in a new tab. Otherwise, it will open the DAO dashboard in the same tab.
     */
    overrideUrl?: string;
}

export const DaoCarouselCard: React.FC<IDaoCarouselCardProps> = ({
    name,
    address,
    logoSrc,
    network,
    description,
    overrideUrl,
}) => {
    const networkName =
        network in networkDefinitions ? networkDefinitions[network as Network].name : network.split('-')[0];

    return (
        <div className="max-w-72 md:max-w-96">
            <DaoDataListItem.Structure
                href={overrideUrl ?? `/dao/${network}-${address}/dashboard`}
                target={overrideUrl ? '_blank' : undefined}
                name={name}
                description={description}
                network={networkName}
                logoSrc={logoSrc}
                isExternal={!!overrideUrl}
            />
        </div>
    );
};
