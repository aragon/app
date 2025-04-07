import { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import * as viem from 'viem';
import { globalExecutorAbi } from './globalExecutorAbi';
import { transactionUtils } from './transactionUtils';
import type { ITransactionRequest } from './transactionUtils.api';

describe('transaction utils', () => {
    describe('cidToHex', () => {
        it('parses the metadata cid to hex format', () => {
            const metadataCid = 'QmT8PDLFQDWaAUoKw4BYziWQNVKChJY3CGi5eNpECi7ufD';
            const expectedValue =
                '0x697066733a2f2f516d543850444c465144576141556f4b773442597a6957514e564b43684a593343476935654e7045436937756644';
            expect(transactionUtils.cidToHex(metadataCid)).toEqual(expectedValue);
        });
    });

    describe('encodeTransactionRequests', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const buildExecutorTransactionSpy = jest.spyOn(transactionUtils as any, 'buildExecutorTransaction');

        afterEach(() => {
            buildExecutorTransactionSpy.mockReset();
        });

        afterAll(() => {
            buildExecutorTransactionSpy.mockRestore();
        });

        it('returns the single transaction when having only one transaction', () => {
            const transactions: ITransactionRequest[] = [{ to: '0x123', data: '0x456', value: BigInt(0) }];
            const result = transactionUtils.encodeTransactionRequests(transactions, Network.ARBITRUM_MAINNET);
            expect(result).toEqual(transactions[0]);
        });

        it('builds an executor transaction when having multiple transactions to execute', () => {
            const transactions: ITransactionRequest[] = [
                { to: '0x1', data: '0x2', value: BigInt(0) },
                { to: '0x3', data: '0x4', value: BigInt(0) },
            ];
            const network = Network.ARBITRUM_MAINNET;
            const executorTransaction = { to: '0xmulticall', data: '0xdata' };
            buildExecutorTransactionSpy.mockReturnValue(executorTransaction);

            const result = transactionUtils.encodeTransactionRequests(transactions, network);
            expect(buildExecutorTransactionSpy).toHaveBeenCalledWith(transactions, network);
            expect(result).toEqual(executorTransaction);
        });
    });

    describe('buildExecutorTransaction', () => {
        const encodeFunctionDataSpy = jest.spyOn(viem, 'encodeFunctionData');

        afterEach(() => {
            encodeFunctionDataSpy.mockReset();
        });

        it('encodes the transaction and return an executor transaction', () => {
            const actions: ITransactionRequest[] = [
                { to: '0x123', data: '0x456', value: BigInt(0) },
                { to: '0x789', data: '0xabc', value: BigInt(0) },
            ];
            const network = Network.ARBITRUM_MAINNET;
            const executorData = '0xdata';
            const expectedAddress = networkDefinitions[network].addresses.globalExecutor;
            encodeFunctionDataSpy.mockReturnValue(executorData);

            const multicallTransaction = transactionUtils['buildExecutorTransaction'](actions, network);
            expect(encodeFunctionDataSpy).toHaveBeenCalledWith({
                abi: globalExecutorAbi,
                functionName: 'execute',
                args: [viem.zeroHash, actions, BigInt(0)],
            });
            expect(multicallTransaction).toEqual({ to: expectedAddress, data: executorData, value: BigInt(0) });
        });
    });
});
