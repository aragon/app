import { getAddress } from 'viem';
import { Network } from '@/shared/api/daoService';
import type { ISession, ISessionRequest } from '../../api/walletConnectService';
import { walletConnectActionDialogUtils } from './walletConnectActionDialogUtils';

describe('walletConnectActionDialog utils', () => {
    describe('sessionRequestToAction', () => {
        const address = '0xab5801a7d398351b8be11c439e05c5b3259aec9b';
        const network = Network.ETHEREUM_SEPOLIA;
        const session = { topic: 'session-topic' } as ISession;
        const transaction = {
            from: address,
            to: '0x00000000000000000000000000000000000000bb',
            data: '0x',
            value: '0x1',
        };

        const generateSessionRequest = (
            values?: Partial<{
                topic: string;
                chainId: string;
                method: string;
                from: string;
            }>,
        ) =>
            ({
                topic: values?.topic ?? session.topic,
                params: {
                    chainId: values?.chainId ?? 'eip155:11155111',
                    request: {
                        method: values?.method ?? 'eth_sendTransaction',
                        params: [
                            { ...transaction, from: values?.from ?? address },
                        ],
                    },
                },
            }) as unknown as ISessionRequest;

        const toAction = (
            sessionRequest: ISessionRequest,
            decodeTransactionAsync = jest.fn(),
        ) =>
            walletConnectActionDialogUtils.sessionRequestToAction({
                sessionRequest,
                session,
                address,
                network,
                decodeTransactionAsync,
            });

        it('decodes a transaction request of the active session on the account network', async () => {
            const decodedAction = { type: 'decoded' };
            const decodeTransactionAsync = jest
                .fn()
                .mockResolvedValue(decodedAction);

            const result = await toAction(
                generateSessionRequest({ from: getAddress(address) }),
                decodeTransactionAsync,
            );

            expect(result).toEqual(decodedAction);
            expect(decodeTransactionAsync).toHaveBeenCalledWith({
                urlParams: { network, address: transaction.to },
                body: expect.objectContaining({ value: '1' }) as unknown,
            });
        });

        it('returns the raw action when decoding fails', async () => {
            const decodeTransactionAsync = jest
                .fn()
                .mockRejectedValue(new Error('error'));

            const result = await toAction(
                generateSessionRequest(),
                decodeTransactionAsync,
            );

            expect(result).toEqual(
                expect.objectContaining({
                    to: transaction.to,
                    value: '1',
                    type: 'unknown',
                }),
            );
        });

        it.each([
            ['an unsupported method', { method: 'personal_sign' }],
            ['another session', { topic: 'other-topic' }],
            ['another chain', { chainId: 'eip155:1' }],
            [
                'another sender',
                { from: '0x00000000000000000000000000000000000000cc' },
            ],
        ])('ignores requests with %s', async (_, values) => {
            const decodeTransactionAsync = jest.fn();

            const result = await toAction(
                generateSessionRequest(values),
                decodeTransactionAsync,
            );

            expect(result).toBeUndefined();
            expect(decodeTransactionAsync).not.toHaveBeenCalled();
        });
    });
});
