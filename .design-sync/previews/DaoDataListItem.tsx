import { DaoDataListItem, GukModulesProvider } from '@aragon/gov-ui-kit';

export const Default = () => (
    <GukModulesProvider>
        <DaoDataListItem.Structure
            address="0x02782C0b47DcCd8b74a5f0Cc4dA6a68e00a4e0a8"
            description="A community-owned DAO funding public goods across the Ethereum ecosystem through quarterly grant rounds."
            name="Patito DAO"
            network="ethereum"
        />
    </GukModulesProvider>
);

export const WithEns = () => (
    <GukModulesProvider>
        <DaoDataListItem.Structure
            address="0x17C6808fA04DC9de98eaCfeb4c66B352067c1cDD"
            description="Protocol treasury council coordinating audits, upgrades and long-term contributor compensation."
            ens="builders.dao.eth"
            name="Builders Collective"
            network="polygon"
        />
    </GukModulesProvider>
);

export const External = () => (
    <GukModulesProvider>
        <DaoDataListItem.Structure
            address="0x9d0920D3D7c9F28baF0abed7f2E26A5126cc0786"
            description="An external DAO operating on a partner network, linked from the explorer."
            isExternal={true}
            name="Nouncil"
            network="base"
        />
    </GukModulesProvider>
);

export const Loading = () => (
    <GukModulesProvider>
        <DaoDataListItem.Skeleton />
    </GukModulesProvider>
);
