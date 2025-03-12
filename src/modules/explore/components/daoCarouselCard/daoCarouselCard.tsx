import { IFeaturedDao } from '@/modules/explore/api/cmsService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { DaoDataListItem } from '@aragon/gov-ui-kit';

export interface IDaoCarouselCardProps extends IFeaturedDao {}

export const DaoCarouselCard: React.FC<IDaoCarouselCardProps> = (props) => {
    const { name, address, logo, network, networkLabel, description, overrideUrl } = props;

    const networkName = network ? networkDefinitions[network].name : networkLabel;

    return (
        <div className="max-w-72 md:max-w-96">
            <DaoDataListItem.Structure
                href={overrideUrl ?? `/dao/${network!}-${address!}/dashboard`}
                target={overrideUrl ? '_blank' : undefined}
                name={name}
                description={description}
                network={networkName}
                logoSrc={logo}
                isExternal={!!overrideUrl}
            />
        </div>
    );
};
