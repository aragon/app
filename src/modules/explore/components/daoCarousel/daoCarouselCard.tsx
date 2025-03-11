import { type Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { AvatarIcon, DaoAvatar, DataList, Heading, Icon, IconType } from '@aragon/gov-ui-kit';

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
    // const networkName = networkDefinitions[network].name;
    const networkName =
        network in networkDefinitions ? networkDefinitions[network as Network].name : network.split('-')[0];

    return (
        <DataList.Item
            className="grid max-w-72 gap-y-3 py-4 md:max-w-96 md:gap-y-4 md:py-6"
            href={overrideUrl ?? `/dao/${network}-${address}/dashboard`}
            target={overrideUrl ? '_blank' : undefined}
        >
            <div className="flex w-full items-center justify-between gap-2">
                <Heading size="h3" as="h2" className="truncate text-neutral-800">
                    {name}
                </Heading>
                <DaoAvatar name={name} src={logoSrc} size="md" responsiveSize={{ md: 'lg' }} />
            </div>
            <p className="line-clamp-2 text-base leading-normal text-neutral-500 md:text-lg">{description}</p>
            <div className="flex justify-between">
                <div className="mt-1 flex items-center gap-x-1 text-neutral-400 md:mt-0 md:gap-x-2">
                    <span className="text-sm capitalize leading-tight md:text-base">{networkName}</span>
                    <Icon icon={IconType.BLOCKCHAIN_BLOCKCHAIN} size="sm" responsiveSize={{ md: 'md' }} />
                </div>
                {overrideUrl && <AvatarIcon icon={IconType.LINK_EXTERNAL} size="sm" variant="primary" />}
            </div>
        </DataList.Item>
    );
};
