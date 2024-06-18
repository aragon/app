import type { IDao } from '@/shared/api/daoService';
import { Network } from '@/shared/types';

export const generateDao = (dao?: Partial<IDao>): IDao => ({
    id: 'dao-test',
    address: '1234',
    network: Network.ETHEREUM_MAINNET,
    name: 'name',
    description: 'description',
    ens: null,
    avatar: null,
    ...dao,
});
