export type SmokeDaoFeature =
    | 'spp'
    | 'tokenvoting'
    | 'multisig'
    | 'gauges'
    | 'locktovote'
    | 'linkedaccounts'
    | 'rewards';

export interface ISmokeDao {
    name: string;
    network: string;
    address: string;
    features: SmokeDaoFeature[];
}
