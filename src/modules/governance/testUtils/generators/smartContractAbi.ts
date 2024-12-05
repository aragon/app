import { Network } from '@/shared/api/daoService';
import type { ISmartContractAbi } from '../../api/smartContractService';

export const generateSmartContractAbi = (abi?: Partial<ISmartContractAbi>): ISmartContractAbi => ({
    name: 'smart-contract',
    address: '0x123',
    network: Network.ETHEREUM_MAINNET,
    implementationAddress: null,
    functions: [],
    ...abi,
});
