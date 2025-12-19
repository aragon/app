import { DaoDataListItem } from '@aragon/gov-ui-kit';
import type { IFeaturedDao } from '@/modules/explore/api/cmsService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';

export interface IDaoCarouselCardProps extends IFeaturedDao {}

export const DaoCarouselCard: React.FC<IDaoCarouselCardProps> = (props) => {
    const {
        name,
        address,
        ens,
        logo,
        network,
        networkLabel,
        description,
        overrideUrl,
    } = props;

    const networkName = network
        ? networkDefinitions[network].name
        : networkLabel;

    return (
        <div className="max-w-72 md:max-w-96">
            <DaoDataListItem.Structure
                description={description}
                href={
                    overrideUrl ??
                    `/dao/${network!}/${ens ?? address!}/dashboard`
                }
                isExternal={!!overrideUrl}
                logoSrc={logo}
                name={name}
                network={networkName}
                target={overrideUrl ? '_blank' : undefined}
            />
        </div>
    );
};
