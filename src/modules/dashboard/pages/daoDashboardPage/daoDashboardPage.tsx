'use client';

import { AssetList } from '@/modules/finance/components/assetList';
import { useDao } from '@/shared/api/daoService';
import { Page } from '@/shared/components/page';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { Button, DaoAvatar, DefinitionList, Dropdown, IconType, Link, addressUtils } from '@aragon/ods';

export interface IDaoDashboardPageProps {
    /**
     * DAO page parameters.
     */
    params: { slug: string };
}

export const DaoDashboardPage: React.FC<IDaoDashboardPageProps> = (props) => {
    const { params } = props;

    const { data: dao } = useDao({ urlParams: params });
    const stats = [
        { value: '69', label: 'Proposals' },
        { value: '420k', label: 'Members' },
        { value: '42.69M', label: 'Treasury value', suffix: 'USD' },
    ];

    const truncatedAddress = addressUtils.truncateAddress(dao?.daoAddress);

    return (
        <Page.Container>
            <Page.Header
                title={dao?.name}
                description={dao?.description}
                stats={stats}
                avatar={<DaoAvatar src={ipfsUtils.cidToSrc(dao?.avatar)} name={dao?.name} size="2xl" />}
            >
                <div className="flex flex-row gap-4">
                    <Button variant="secondary" size="md" disabled={true}>
                        Follow DAO
                    </Button>
                    <Dropdown.Container size="md" label="patito.dao.eth">
                        <Dropdown.Item icon={IconType.COPY}>{truncatedAddress}</Dropdown.Item>
                    </Dropdown.Container>
                </div>
            </Page.Header>
            <Page.Content>
                <Page.Main>
                    <Page.Section title="Top assets">
                        <AssetList />
                    </Page.Section>
                </Page.Main>
                <Page.Aside>
                    <Page.Section title="Details">
                        <DefinitionList.Container>
                            <DefinitionList.Item term="Blockchain">
                                <p className="text-neutral-500">Ethereum Mainnet</p>
                            </DefinitionList.Item>
                            <DefinitionList.Item term="Contract Address">
                                <Link iconRight={IconType.LINK_EXTERNAL}>{truncatedAddress}</Link>
                            </DefinitionList.Item>
                        </DefinitionList.Container>
                    </Page.Section>
                </Page.Aside>
            </Page.Content>
        </Page.Container>
    );
};
