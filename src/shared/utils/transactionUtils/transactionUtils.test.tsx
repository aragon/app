import { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import * as viem from 'viem';
import { transactionUtils } from './transactionUtils';
import type { IMulticallRequest, ITransactionRequest } from './transactionUtils.api';

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
        const transactionToMulticallRequestSpy = jest.spyOn(transactionUtils as any, 'transactionToMulticallRequest');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const encodeMulticallTransactionSpy = jest.spyOn(transactionUtils as any, 'encodeMulticallTransaction');

        afterEach(() => {
            transactionToMulticallRequestSpy.mockReset();
            encodeMulticallTransactionSpy.mockReset();
        });

        afterAll(() => {
            transactionToMulticallRequestSpy.mockRestore();
            encodeMulticallTransactionSpy.mockRestore();
        });

        it('returns the single transaction when having only one transaction', () => {
            const transactions: ITransactionRequest[] = [{ to: '0x123', data: '0x456' }];
            const result = transactionUtils.encodeTransactionRequests(transactions, Network.ARBITRUM_MAINNET);
            expect(result).toEqual(transactions[0]);
        });

        it('maps every request to a multicall request and encodes the transaction', () => {
            const transactions: ITransactionRequest[] = [
                { to: '0x1', data: '0x2' },
                { to: '0x3', data: '0x4' },
            ];
            const network = Network.ARBITRUM_MAINNET;
            const multicallRequest: IMulticallRequest = { target: '0x123', callData: '0x456', allowFailure: false };
            const multicallTransaction = { to: '0xmulticall', data: '0xdata' };
            transactionToMulticallRequestSpy.mockReturnValue(multicallRequest);
            encodeMulticallTransactionSpy.mockReturnValue(multicallTransaction);

            const result = transactionUtils.encodeTransactionRequests(transactions, network);
            expect(transactionToMulticallRequestSpy).toHaveBeenCalledTimes(transactions.length);
            expect(encodeMulticallTransactionSpy).toHaveBeenCalledWith([multicallRequest, multicallRequest], network);
            expect(result).toEqual(multicallTransaction);
        });
    });

    describe('transactionToMulticallRequest', () => {
        it('maps a transaction request to a multicall request', () => {
            const transaction: ITransactionRequest = { to: '0x123', data: '0x456' };
            const result = transactionUtils['transactionToMulticallRequest'](transaction);
            expect(result).toEqual({ target: '0x123', callData: '0x456', allowFailure: false });
        });
    });

    describe('encodeMulticallTransaction', () => {
        const encodeFunctionDataSpy = jest.spyOn(viem, 'encodeFunctionData');

        afterEach(() => {
            encodeFunctionDataSpy.mockReset();
        });

        it('encodes the transaction and return a multicall transaction', () => {
            const calls: IMulticallRequest[] = [
                { target: '0x123', callData: '0x456', allowFailure: false },
                { target: '0x789', callData: '0xabc', allowFailure: false },
            ];
            const network = Network.ARBITRUM_MAINNET;
            const multicallData = '0xdata';
            const expectedAddress = networkDefinitions[network].contracts!.multicall3!.address;
            encodeFunctionDataSpy.mockReturnValue(multicallData);

            const multicallTransaction = transactionUtils['encodeMulticallTransaction'](calls, network);
            expect(encodeFunctionDataSpy).toHaveBeenCalledWith({
                abi: viem.multicall3Abi,
                functionName: 'aggregate3',
                args: [calls],
            });
            expect(multicallTransaction).toEqual({ to: expectedAddress, data: multicallData });
        });
    });
});
