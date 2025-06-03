import type { ITokenLock } from '@/plugins/tokenPlugin/api/tokenService';
import { Network } from '@/shared/api/daoService';

export const generateTokenLock = (lock?: Partial<ITokenLock>): ITokenLock => ({
    id: 'lock-id',
    network: Network.ETHEREUM_SEPOLIA,
    transactionHash: '0x1234',
    blockNumber: null,
    blockTimestamp: null,
    pluginAddress: '0xpluginAddress',
    memberAddress: '0xmemberAddress',
    token: null,
    nft: null,
    tokenId: '1',
    amount: '1000',
    epochStartAt: 0,
    lockExit: {
        status: false,
        transactionHash: null,
        blockNumber: null,
        blockTimestamp: null,
        exitDateAt: null,
    },
    lockWithdraw: {
        status: false,
        transactionHash: null,
        blockNumber: null,
        blockTimestamp: null,
        amount: '0',
        epochEndAt: null,
    },
    ...lock,
});
