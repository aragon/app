import type { Network } from '@/shared/types';

export interface IDao {
    permalink: string;
    daoAddress: string; // todo: change to address
    network: Network;
    name: string;
    description: string;
    ens: string | null;
    avatar: string | null;
}
