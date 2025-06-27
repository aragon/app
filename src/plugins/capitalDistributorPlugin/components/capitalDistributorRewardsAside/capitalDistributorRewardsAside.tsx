'use client';

import { CapitalDistributorRewardsStats } from '@/plugins/capitalDistributorPlugin/components/capitalDistributorRewardsStats';
import { Page } from '@/shared/components/page';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { Link } from '@aragon/gov-ui-kit';
import { useAccount } from 'wagmi';

export interface ICapitalDistributorRewardsAsideProps {
    /**
     * The ID of the DAO for which to display the rewards.
     */
    daoId: string;
}

export const CapitalDistributorRewardsAside: React.FC<ICapitalDistributorRewardsAsideProps> = (props) => {
    const { daoId } = props;
    const { address } = useAccount();

    const capitalDistributorPlugin = useDaoPlugins({ daoId, subdomain: 'capital-distributor' })![0];

    const pluginName = capitalDistributorPlugin.meta.name ?? capitalDistributorPlugin.meta.subdomain;
    const pluginDescription = capitalDistributorPlugin.meta.description;
    const resources = capitalDistributorPlugin.meta.links;

    return (
        <Page.AsideCard title={pluginName}>
            {pluginDescription && <p className="text-base text-gray-500">{pluginDescription}</p>}
            {address && <CapitalDistributorRewardsStats />}
            {resources?.map(({ url, name }) => (
                <Link key={url} href={url} isExternal={true} showUrl={true}>
                    {name}
                </Link>
            ))}
        </Page.AsideCard>
    );
};
