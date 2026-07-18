import { DaoTargetIndicator } from '@aragon/gov-ui-kit';

const linkedAccount = {
    id: 'base-mainnet-0x7f268357A8c2552623316e2562D90e642bB538E5',
    address: '0x7f268357A8c2552623316e2562D90e642bB538E5',
    network: 'base-mainnet',
    name: 'Treasury Guild',
    description: 'Linked account managing the operational treasury.',
};

const dao = {
    id: 'ethereum-mainnet-0x1a9C8182C09F50C8318d769245beA52c32BE35BC',
    address: '0x1a9C8182C09F50C8318d769245beA52c32BE35BC',
    network: 'ethereum-mainnet',
    name: 'Builders Collective',
    linkedAccounts: [linkedAccount],
} as never;

export const MainDaoTarget = () => (
    <div className="flex">
        <DaoTargetIndicator dao={dao} size="sm" />
    </div>
);

export const LinkedAccountTarget = () => (
    <div className="flex">
        <DaoTargetIndicator
            dao={dao}
            size="sm"
            targetDaoAddress="0x7f268357A8c2552623316e2562D90e642bB538E5"
        />
    </div>
);

export const ExtraSmall = () => (
    <div className="flex">
        <DaoTargetIndicator
            dao={dao}
            size="xs"
            targetDaoAddress="0x7f268357A8c2552623316e2562D90e642bB538E5"
        />
    </div>
);
