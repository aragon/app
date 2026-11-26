import { WalletKit } from '@reown/walletkit';
import type { SessionTypes } from '@walletconnect/types';
import * as WalletConnectUtils from '@walletconnect/utils';
import { getSdkError } from '@walletconnect/utils';
import { Network } from '@/shared/api/daoService';
import { walletConnectDefinitions } from '@/shared/constants/walletConnectDefinitions';
import type { ISession, ISessionProposal } from './domain';
import {
    WalletConnectService,
    walletConnectService,
} from './walletConnectService';
import { WalletConnectUnsupportedNetworkError } from './walletConnectUnsupportedNetworkError';
import { WalletConnectUsedUriError } from './walletConnectUsedUriError';

describe('walletConnect service', () => {
    const walletInitSpy = jest.spyOn(WalletKit, 'init');
    const buildApprovedNamespacesSpy = jest.spyOn(
        WalletConnectUtils,
        'buildApprovedNamespaces',
    );

    const pairingTopic = 'a'.repeat(64);
    const uri = `wc:${pairingTopic}@2?relay-protocol=irn&symKey=${'b'.repeat(64)}`;
    const address = '0x123';
    const network = Network.ETHEREUM_SEPOLIA;

    const mockClient = (client: Record<string, unknown> = {}) => {
        const clientMock = { on: jest.fn(), ...client };
        walletInitSpy.mockResolvedValue(
            clientMock as unknown as InstanceType<typeof WalletKit>,
        );
        return clientMock;
    };

    const createTestService = async () => {
        const testService = new WalletConnectService();
        // Simple workaround to make sure the client is set after creating a new instance of the service
        await Promise.resolve();
        return testService;
    };

    const generateSessionProposal = (topic = pairingTopic) =>
        ({ id: 1, params: { pairingTopic: topic } }) as ISessionProposal;

    afterEach(() => {
        walletInitSpy.mockReset();
        buildApprovedNamespacesSpy.mockReset();
    });

    describe('initialize', () => {
        it('initializes the wallet client with correct options', () => {
            walletConnectService['initialize'];
            expect(walletInitSpy).toHaveBeenCalledWith({
                core: expect.any(Object) as unknown,
                metadata: walletConnectDefinitions.metadata,
                signConfig: walletConnectService['signConfig'],
            });
        });

        it('registers the session-proposal handler once', async () => {
            const { on } = mockClient();
            const testService = await createTestService();
            expect(on).toHaveBeenCalledWith(
                'session_proposal',
                testService['handleSessionProposal'],
            );
        });
    });

    describe('connectApp', () => {
        it('pairs and resolves the session approved for the proposal of its pairing', async () => {
            const pair = jest.fn(() => Promise.resolve());
            mockClient({ pair });
            const testService = await createTestService();
            const session = { topic: 'session-topic' } as ISession;
            const approveSession = jest.fn().mockResolvedValue(session);
            testService['approveSession'] = approveSession;
            const sessionProposal = generateSessionProposal();

            const connection = testService.connectApp({
                uri,
                address,
                network,
            });
            await testService['handleSessionProposal'](sessionProposal);

            await expect(connection).resolves.toEqual(session);
            expect(pair).toHaveBeenCalledWith({ uri });
            expect(approveSession).toHaveBeenCalledWith({
                sessionProposal,
                address,
                network,
            });
            expect(testService['pendingConnection']).toBeUndefined();
        });

        it('rejects proposals of other pairings and keeps waiting for its own', async () => {
            const rejectSession = jest.fn(() => Promise.resolve());
            mockClient({
                pair: jest.fn(() => Promise.resolve()),
                rejectSession,
            });
            const testService = await createTestService();
            const approveSession = jest.fn();
            testService['approveSession'] = approveSession;
            const sessionProposal = generateSessionProposal('c'.repeat(64));

            void testService.connectApp({ uri, address, network });
            await testService['handleSessionProposal'](sessionProposal);

            expect(rejectSession).toHaveBeenCalledWith({
                id: sessionProposal.id,
                reason: getSdkError('USER_REJECTED'),
            });
            expect(approveSession).not.toHaveBeenCalled();
            expect(testService['pendingConnection']?.pairingTopic).toEqual(
                pairingTopic,
            );
        });

        it('cancels the previous pending connection', async () => {
            mockClient({ pair: jest.fn(() => Promise.resolve()) });
            const testService = await createTestService();
            const otherUri = uri.replace(pairingTopic, 'c'.repeat(64));

            const previousConnection = testService.connectApp({
                uri,
                address,
                network,
            });
            void testService.connectApp({ uri: otherUri, address, network });

            await expect(previousConnection).rejects.toThrow();
            expect(testService['pendingConnection']?.pairingTopic).toEqual(
                'c'.repeat(64),
            );
        });

        it('throws a used-URI error without pairing again when the URI was already paired', async () => {
            const pair = jest.fn(() => Promise.resolve());
            mockClient({ pair });
            const testService = await createTestService();
            testService['core'] = {
                pairing: { getPairings: () => [{ topic: pairingTopic }] },
            } as unknown as (typeof testService)['core'];

            await expect(
                testService.connectApp({ uri, address, network }),
            ).rejects.toThrow(WalletConnectUsedUriError);
            expect(pair).not.toHaveBeenCalled();
            expect(testService['pendingConnection']).toBeUndefined();
        });

        it('clears the pending connection and throws error when pair function fails', async () => {
            const pairError = new Error('unknown');
            mockClient({ pair: jest.fn(() => Promise.reject(pairError)) });
            const testService = await createTestService();
            testService['parseError'] = jest.fn(() => pairError);

            await expect(
                testService.connectApp({ uri, address, network }),
            ).rejects.toThrow(pairError);
            expect(testService['parseError']).toHaveBeenCalledWith(pairError);
            expect(testService['pendingConnection']).toBeUndefined();
        });
    });

    describe('cancelConnectApp', () => {
        it('rejects the pending connection and rejects the proposal its dApp sends afterwards', async () => {
            const rejectSession = jest.fn(() => Promise.resolve());
            mockClient({
                pair: jest.fn(() => Promise.resolve()),
                rejectSession,
            });
            const testService = await createTestService();
            const approveSession = jest.fn();
            testService['approveSession'] = approveSession;
            const sessionProposal = generateSessionProposal();

            const connection = testService.connectApp({
                uri,
                address,
                network,
            });
            testService.cancelConnectApp();
            await testService['handleSessionProposal'](sessionProposal);

            await expect(connection).rejects.toThrow();
            expect(approveSession).not.toHaveBeenCalled();
            expect(rejectSession).toHaveBeenCalledWith({
                id: sessionProposal.id,
                reason: getSdkError('USER_REJECTED'),
            });
        });
    });

    describe('disconnectApp', () => {
        it('triggers the disconnect-session function from the wallet client', async () => {
            const session = { topic: 'test-topic' } as ISession;
            const disconnectSession = jest.fn();
            mockClient({ disconnectSession });
            await (await createTestService()).disconnectApp({ session });
            expect(disconnectSession).toHaveBeenCalledWith({
                topic: session.topic,
                reason: getSdkError('USER_DISCONNECTED'),
            });
        });
    });

    describe('attachListener', () => {
        it('attaches the callback to the specified event', async () => {
            const { on } = mockClient();
            const callback = () => 'test';
            (await createTestService()).attachListener({
                event: 'proposal_expire',
                callback,
            });
            expect(on).toHaveBeenCalledWith('proposal_expire', callback);
        });
    });

    describe('removeListener', () => {
        it('only removes the given callback, keeping the event forwarded for other listeners', async () => {
            const off = jest.fn();
            const eventsOff = jest.fn();
            mockClient({ off, events: { off: eventsOff } });
            const callback = () => 'another';
            (await createTestService()).removeListener({
                event: 'session_request',
                callback,
            });
            expect(eventsOff).toHaveBeenCalledWith('session_request', callback);
            expect(off).not.toHaveBeenCalled();
        });
    });

    describe('approveSession', () => {
        const approvedNamespaces = {
            eip155: { accounts: [`eip155:11155111:${address}`] },
        };

        it('builds the approved namespaces, approves and returns the session', async () => {
            const session = {} as ISession;
            const approveSession = jest.fn(() => Promise.resolve(session));
            mockClient({ approveSession });
            const sessionProposal = generateSessionProposal();
            const supportedNamespaces = { eip155: {} };
            buildApprovedNamespacesSpy.mockReturnValue(
                approvedNamespaces as unknown as SessionTypes.Namespaces,
            );

            const testService = await createTestService();
            testService['getSupportedNamespaces'] = jest.fn(
                () =>
                    supportedNamespaces as ReturnType<
                        (typeof testService)['getSupportedNamespaces']
                    >,
            );

            const result = await testService['approveSession']({
                address,
                network,
                sessionProposal,
            });
            expect(testService['getSupportedNamespaces']).toHaveBeenCalledWith(
                address,
                network,
            );
            expect(buildApprovedNamespacesSpy).toHaveBeenCalledWith({
                proposal: sessionProposal.params,
                supportedNamespaces,
            });
            expect(approveSession).toHaveBeenCalledWith({
                id: sessionProposal.id,
                namespaces: approvedNamespaces,
            });
            expect(result).toEqual(session);
        });

        it.each([
            [
                'no account is approved',
                () =>
                    buildApprovedNamespacesSpy.mockReturnValue({
                        eip155: { accounts: [] },
                    } as unknown as SessionTypes.Namespaces),
            ],
            [
                'the required namespaces are not supported',
                () =>
                    buildApprovedNamespacesSpy.mockImplementation(() => {
                        throw new Error('unsupported');
                    }),
            ],
        ])(
            'rejects the proposal as unsupported chains when %s',
            async (_, mockNamespaces) => {
                const approveSession = jest.fn();
                const rejectSession = jest.fn(() => Promise.resolve());
                mockClient({ approveSession, rejectSession });
                mockNamespaces();
                const sessionProposal = generateSessionProposal();
                const testService = await createTestService();

                await expect(
                    testService['approveSession']({
                        address,
                        network,
                        sessionProposal,
                    }),
                ).rejects.toBeInstanceOf(WalletConnectUnsupportedNetworkError);
                expect(rejectSession).toHaveBeenCalledWith({
                    id: sessionProposal.id,
                    reason: getSdkError('UNSUPPORTED_CHAINS'),
                });
                expect(approveSession).not.toHaveBeenCalled();
            },
        );
    });

    describe('getChainNamespace', () => {
        it('returns the CAIP-2 chain id of the network', () => {
            expect(
                walletConnectService.getChainNamespace(
                    Network.ETHEREUM_MAINNET,
                ),
            ).toEqual('eip155:1');
        });
    });

    describe('getSupportedNamespaces', () => {
        it('only offers the account on the given network', () => {
            const address = '0x123';
            const namespaces = walletConnectService['getSupportedNamespaces'](
                address,
                Network.ETHEREUM_MAINNET,
            );
            expect(namespaces.eip155.methods).toEqual(
                walletConnectService['supportedMethods'],
            );
            expect(namespaces.eip155.events).toEqual(
                walletConnectService['supportedEvents'],
            );
            expect(namespaces.eip155.chains).toEqual(['eip155:1']);
            expect(namespaces.eip155.accounts).toEqual([`eip155:1:${address}`]);
        });
    });

    describe('parseError', () => {
        it('just returns the error when it is already an error instance', () => {
            const error = new Error('test');
            expect(walletConnectService['parseError'](error)).toEqual(error);
        });

        it('creates a new error instance from the given error message when error is a string', () => {
            const error = 'test-error';
            expect(walletConnectService['parseError'](error)).toEqual(
                new Error(error),
            );
        });

        it('returns unknown error when error has unsupported type', () => {
            const error = 1;
            expect(walletConnectService['parseError'](error)).toEqual(
                new Error('unknown error'),
            );
        });
    });
});
