import { walletConnectDefinitions } from '@/shared/constants/walletConnectDefinitions';
import { WalletKit } from '@reown/walletkit';
import type { SessionTypes } from '@walletconnect/types';
import * as WalletConnectUtils from '@walletconnect/utils';
import { getSdkError } from '@walletconnect/utils';
import type { ISession, ISessionEventArguments, ISessionProposal } from './domain';
import { WalletConnectService, walletConnectService } from './walletConnectService';

describe('walletConnect service', () => {
    const walletInitSpy = jest.spyOn(WalletKit, 'init');
    const buildApprovedNamespacesSpy = jest.spyOn(WalletConnectUtils, 'buildApprovedNamespaces');

    const createTestService = async () => {
        const testService = new WalletConnectService();
        // Simple workaround to make sure the client is set after creating a new instance of the service
        await Promise.resolve();
        return testService;
    };

    afterEach(() => {
        walletInitSpy.mockReset();
        buildApprovedNamespacesSpy.mockReset();
    });

    describe('initialize', () => {
        it('initializes the wallet client with correct options', () => {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            walletConnectService['initialize'];
            expect(walletInitSpy).toHaveBeenCalledWith({
                core: expect.any(Object) as unknown,
                metadata: walletConnectDefinitions.metadata,
                signConfig: walletConnectService['signConfig'],
            });
        });
    });

    describe('connectApp', () => {
        it('calls the pair function and attaches a listener for the session-proposal event', async () => {
            const uri = 'wc:abc123';
            const pair = jest.fn(() => Promise.resolve());
            walletInitSpy.mockResolvedValue({ pair } as unknown as InstanceType<typeof WalletKit>);
            const testService = await createTestService();

            testService['handleSessionProposal'] = (({ onSuccess }) =>
                onSuccess({} as ISession)) as (typeof testService)['handleSessionProposal'];
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            testService.attachListener = jest.fn(({ event, callback }) =>
                callback({} as ISessionEventArguments[typeof event]),
            );

            await testService.connectApp({ uri, address: '00' });
            expect(pair).toHaveBeenCalledWith({ uri });
            expect(testService.attachListener).toHaveBeenCalledWith({
                event: 'session_proposal',
                callback: expect.any(Function) as unknown,
            });
        });

        it('throws error when pair function fails', async () => {
            const pairError = new Error('unknown');
            const pair = jest.fn(() => Promise.reject(pairError));
            walletInitSpy.mockResolvedValue({ pair } as unknown as InstanceType<typeof WalletKit>);
            const testService = await createTestService();
            testService.attachListener = jest.fn();
            testService['parseError'] = jest.fn(() => pairError);
            await expect(testService.connectApp({ uri: 'test', address: '00' })).rejects.toThrow();
            expect(testService['parseError']).toHaveBeenCalledWith(pairError);
        });
    });

    describe('disconnectApp', () => {
        it('triggers the disconnect-session function from the wallet client', async () => {
            const session = { topic: 'test-topic' } as ISession;
            const disconnectSession = jest.fn();
            walletInitSpy.mockResolvedValue({ disconnectSession } as unknown as InstanceType<typeof WalletKit>);
            await (await createTestService()).disconnectApp({ session });
            expect(disconnectSession).toHaveBeenCalledWith({
                topic: session.topic,
                reason: getSdkError('USER_DISCONNECTED'),
            });
        });
    });

    describe('attachListener', () => {
        it('attaches the callback to the specified event', async () => {
            const on = jest.fn();
            const callback = () => 'test';
            walletInitSpy.mockResolvedValue({ on } as unknown as InstanceType<typeof WalletKit>);
            (await createTestService()).attachListener({ event: 'proposal_expire', callback });
            expect(on).toHaveBeenCalledWith('proposal_expire', callback);
        });
    });

    describe('removeListener', () => {
        it('removes the event listener from the specified event', async () => {
            const off = jest.fn();
            const callback = () => 'another';
            walletInitSpy.mockResolvedValue({ off } as unknown as InstanceType<typeof WalletKit>);
            (await createTestService()).removeListener({ event: 'session_proposal', callback });
            expect(off).toHaveBeenCalledWith('session_proposal', callback);
        });
    });

    describe('handleSessionProposal', () => {
        const approveSessionSpy = jest.spyOn(walletConnectService, 'approveSession' as keyof WalletConnectService);

        afterEach(() => {
            approveSessionSpy.mockReset();
        });

        afterAll(() => {
            approveSessionSpy.mockRestore();
        });

        it('approves the session and calls the onSuccess callback on session approve success', async () => {
            const onSuccess = jest.fn();
            const sessionProposal = {} as ISessionProposal;
            const address = '0x123';
            const session = { topic: 'test' } as ISession;
            approveSessionSpy.mockResolvedValue(session);
            await walletConnectService['handleSessionProposal']({
                sessionProposal,
                address,
                onSuccess,
                onError: jest.fn(),
            });
            expect(approveSessionSpy).toHaveBeenCalledWith({ sessionProposal, address });
            expect(onSuccess).toHaveBeenCalledWith(session);
        });

        it('calls the onError callback on session approve error', async () => {
            const onError = jest.fn();
            const sessionProposal = {} as ISessionProposal;
            const address = '0x123';
            const approveError = new Error('unknown');
            approveSessionSpy.mockRejectedValue(approveError);
            await walletConnectService['handleSessionProposal']({
                sessionProposal,
                address,
                onSuccess: jest.fn(),
                onError,
            });
            expect(approveSessionSpy).toHaveBeenCalledWith({ sessionProposal, address });
            expect(onError).toHaveBeenCalledWith(approveError);
        });
    });

    describe('approveSession', () => {
        it('builds the approved namespaces, approves and returns the session', async () => {
            const session = {} as ISession;
            const approveSession = jest.fn(() => Promise.resolve(session));
            walletInitSpy.mockResolvedValue({ approveSession } as unknown as InstanceType<typeof WalletKit>);
            const address = '0x123';
            const sessionProposal = { params: [], id: '0' } as unknown as ISessionProposal;
            const supportedNamespaces = { eip155: {} };
            buildApprovedNamespacesSpy.mockReturnValue(supportedNamespaces as unknown as SessionTypes.Namespaces);

            const testService = await createTestService();
            testService['getSupportedNamespaces'] = jest.fn(
                () => supportedNamespaces as ReturnType<(typeof testService)['getSupportedNamespaces']>,
            );

            const result = await testService['approveSession']({ address, sessionProposal });
            expect(testService['getSupportedNamespaces']).toHaveBeenCalledWith(address);
            expect(buildApprovedNamespacesSpy).toHaveBeenCalledWith({
                proposal: sessionProposal.params,
                supportedNamespaces,
            });
            expect(approveSession).toHaveBeenCalledWith({ id: sessionProposal.id, namespaces: supportedNamespaces });
            expect(result).toEqual(session);
        });
    });

    describe('getSupportedNamespaces', () => {
        it('builds the supported namespaces', () => {
            const address = '0x123';
            const namespaces = walletConnectService['getSupportedNamespaces'](address);
            expect(namespaces.eip155.methods).toEqual(walletConnectService['supportedMethods']);
            expect(namespaces.eip155.events).toEqual(walletConnectService['supportedEvents']);
            expect(namespaces.eip155.chains).toContain('eip155:1');
            expect(namespaces.eip155.accounts).toContain(`eip155:1:${address}`);
        });
    });

    describe('parseError', () => {
        it('just returns the error when it is already an error instance', () => {
            const error = new Error('test');
            expect(walletConnectService['parseError'](error)).toEqual(error);
        });

        it('creates a new error instance from the given error message when error is a string', () => {
            const error = 'test-error';
            expect(walletConnectService['parseError'](error)).toEqual(new Error(error));
        });

        it('returns unknown error when error has unsupported type', () => {
            const error = 1;
            expect(walletConnectService['parseError'](error)).toEqual(new Error('unknown error'));
        });
    });
});
