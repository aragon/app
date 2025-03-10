import { DaoAvatar, DataList, Heading, Icon, IconType } from '@aragon/gov-ui-kit';

export const DaoCarouselCard = ({ name, address, logoSrc, network, description, overrideUrl }) => {
    return (
        <DataList.Item
            className="grid max-w-80 gap-y-3 py-4 md:gap-y-4 md:py-6"
            href={overrideUrl ?? `/dao/${network}-mainnet-${address}/dashboard`}
            target={overrideUrl ? '_blank' : undefined}
        >
            <div className="flex w-full items-center justify-between gap-2">
                <Heading size="h3" as="h2" className="truncate text-neutral-800">
                    {name}
                </Heading>
                <DaoAvatar name={name} src={logoSrc} size="md" responsiveSize={{ md: 'lg' }} />
            </div>
            <p className="line-clamp-2 text-base leading-normal text-neutral-500 md:text-lg">{description}</p>
            <div className="mt-1 flex items-center gap-x-1 text-neutral-400 md:mt-0 md:gap-x-2">
                <span className="text-sm capitalize leading-tight md:text-base">{network}</span>
                <Icon icon={IconType.BLOCKCHAIN_BLOCKCHAIN} size="sm" responsiveSize={{ md: 'md' }} />
            </div>
        </DataList.Item>
    );
};
