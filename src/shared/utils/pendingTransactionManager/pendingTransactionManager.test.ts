import type { Hex } from 'viem';
import * as wagmiActions from 'wagmi/actions';
import {
    buildIntentId,
    PendingTransactionManager,
} from './pendingTransactionManager';
import { PendingTransactionStatus } from './pendingTransactionManager.api';

jest.mock('@/modules/application/constants/wagmi', () => ({ wagmiConfig: {} }));

const STORAGE_KEY = 'aragon.pendingTransactions';
const request = {
    to: '0xabc',
    data: '0x',
    value: BigInt(0),
    chainId: 1,
} as unknown as Parameters<PendingTransactionManager['send']>[1];
const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('pendingTransactionManager', () => {
    const sendTransactionSpy = jest.spyOn(wagmiActions, 'sendTransaction');

    beforeEach(() => {
        sessionStorage.clear();
        sendTransactionSpy.mockReset();
    });

    describe('buildIntentId', () => {
        it('returns the same id for the same inputs and a different id for different inputs', () => {
            expect(buildIntentId({ to: '0x1', value: BigInt(1) })).toBe(
                buildIntentId({ to: '0x1', value: BigInt(1) }),
            );
            expect(buildIntentId({ to: '0x1', value: BigInt(1) })).not.toBe(
                buildIntentId({ to: '0x1', value: BigInt(2) }),
            );
        });

        it('serializes bigint inputs that are not JSON-serializable', () => {
            expect(() => buildIntentId({ value: BigInt(10) })).not.toThrow();
        });
    });

    describe('send', () => {
        it('records the action as PENDING immediately', () => {
            sendTransactionSpy.mockReturnValue(new Promise(() => undefined));
            const manager = new PendingTransactionManager();

            manager.send('id', request);

            expect(manager.get('id')).toEqual({
                status: PendingTransactionStatus.PENDING,
            });
        });

        it('records SUBMITTED with the hash once the wallet signs', async () => {
            sendTransactionSpy.mockResolvedValue('0xhash');
            const manager = new PendingTransactionManager();

            manager.send('id', request);
            await flushPromises();

            expect(manager.get('id')).toEqual({
                status: PendingTransactionStatus.SUBMITTED,
                hash: '0xhash',
            });
        });

        it('records FAILED with the error when the wallet rejects', async () => {
            const error = new Error('rejected');
            sendTransactionSpy.mockRejectedValue(error);
            const manager = new PendingTransactionManager();

            manager.send('id', request);
            await flushPromises();

            expect(manager.get('id')).toEqual({
                status: PendingTransactionStatus.FAILED,
                error,
            });
        });

        it('ignores a stale resolution from a superseded send for the same intent', async () => {
            let resolveFirst!: (hash: Hex) => void;
            const firstSend = new Promise<Hex>((resolve) => {
                resolveFirst = resolve;
            });
            sendTransactionSpy.mockReturnValueOnce(firstSend);
            sendTransactionSpy.mockResolvedValueOnce('0xnew');
            const manager = new PendingTransactionManager();

            manager.send('id', request); // attempt 1 — still pending
            manager.send('id', request); // attempt 2 — resolves to 0xnew
            await flushPromises();
            expect(manager.get('id')).toEqual({
                status: PendingTransactionStatus.SUBMITTED,
                hash: '0xnew',
            });

            resolveFirst('0xold'); // the superseded send resolves late
            await flushPromises();
            expect(manager.get('id')).toEqual({
                status: PendingTransactionStatus.SUBMITTED,
                hash: '0xnew',
            });
        });

        it('keeps the request so a resumed action can re-send, and drops it on clear', () => {
            sendTransactionSpy.mockReturnValue(new Promise(() => undefined));
            const manager = new PendingTransactionManager();

            manager.send('id', request);
            expect(manager.getRequest('id')).toBe(request);

            manager.clear('id');
            expect(manager.getRequest('id')).toBeUndefined();
        });
    });

    describe('clear', () => {
        it('removes the record', () => {
            sendTransactionSpy.mockReturnValue(new Promise(() => undefined));
            const manager = new PendingTransactionManager();
            manager.send('id', request);

            manager.clear('id');

            expect(manager.get('id')).toBeUndefined();
        });
    });

    describe('getActive', () => {
        it('returns only PENDING and SUBMITTED records', async () => {
            sendTransactionSpy.mockResolvedValueOnce('0xhash'); // submitted
            sendTransactionSpy.mockRejectedValueOnce(new Error('x')); // failed
            sendTransactionSpy.mockReturnValueOnce(
                new Promise(() => undefined),
            ); // pending
            const manager = new PendingTransactionManager();

            manager.send('submitted', request);
            manager.send('failed', request);
            manager.send('pending', request);
            await flushPromises();

            const ids = manager.getActive().map(([id]) => id);
            expect(ids).toEqual(
                expect.arrayContaining(['submitted', 'pending']),
            );
            expect(ids).not.toContain('failed');
        });

        it('narrows by type and scope and excludes a given intent id', () => {
            sendTransactionSpy.mockReturnValue(new Promise(() => undefined));
            const manager = new PendingTransactionManager();
            const meta = { type: 'proposalCreate', scope: 'dao:plugin' };

            manager.send('match', request, meta);
            manager.send('other-scope', request, {
                type: 'proposalCreate',
                scope: 'other',
            });
            manager.send('other-type', request, {
                type: 'tokenTransfer',
                scope: 'dao:plugin',
            });
            manager.send('self', request, meta);

            const matches = manager.getActive({
                ...meta,
                excludeIntentId: 'self',
            });

            expect(matches.map(([id]) => id)).toEqual(['match']);
        });
    });

    describe('subscribe', () => {
        it('notifies listeners on each change and stops after unsubscribe', () => {
            sendTransactionSpy.mockReturnValue(new Promise(() => undefined));
            const manager = new PendingTransactionManager();
            const listener = jest.fn();

            const unsubscribe = manager.subscribe(listener);
            manager.send('id', request);
            expect(listener).toHaveBeenCalledTimes(1);

            unsubscribe();
            manager.clear('id');
            expect(listener).toHaveBeenCalledTimes(1);
        });
    });

    describe('isInterrupted', () => {
        it('is false for a PENDING send started this session (it has a live promise)', () => {
            sendTransactionSpy.mockReturnValue(new Promise(() => undefined));
            const manager = new PendingTransactionManager();

            manager.send('id', request);

            expect(manager.isInterrupted('id')).toBe(false);
        });

        it('is true for a PENDING record hydrated after a reload (no live promise)', () => {
            sessionStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({ id: { status: 'PENDING' } }),
            );
            const manager = new PendingTransactionManager();

            expect(manager.isInterrupted('id')).toBe(true);
        });
    });

    describe('persistence', () => {
        it('mirrors records to sessionStorage', async () => {
            sendTransactionSpy.mockResolvedValue('0xhash');
            const manager = new PendingTransactionManager();

            manager.send('id', request);
            await flushPromises();

            expect(
                JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}'),
            ).toEqual({ id: { status: 'SUBMITTED', hash: '0xhash' } });
        });

        it('persists and hydrates the type and scope meta for duplicate detection', async () => {
            sendTransactionSpy.mockResolvedValue('0xhash');
            const meta = { type: 'proposalCreate', scope: 'dao:plugin' };
            const manager = new PendingTransactionManager();

            manager.send('id', request, meta);
            await flushPromises();

            expect(
                JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}'),
            ).toEqual({
                id: { status: 'SUBMITTED', hash: '0xhash', ...meta },
            });

            const rehydrated = new PendingTransactionManager();
            expect(rehydrated.get('id')).toEqual({
                status: PendingTransactionStatus.SUBMITTED,
                hash: '0xhash',
                ...meta,
            });
        });

        it('hydrates persisted records on construction so a reload can resume', () => {
            sessionStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({ id: { status: 'SUBMITTED', hash: '0xhash' } }),
            );
            const manager = new PendingTransactionManager();

            expect(manager.get('id')).toEqual({
                status: PendingTransactionStatus.SUBMITTED,
                hash: '0xhash',
            });
        });

        it('drops a hydrated record whose status is no longer a known status', () => {
            sessionStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({ id: { status: 'OBSOLETE' } }),
            );
            const manager = new PendingTransactionManager();

            expect(manager.get('id')).toBeUndefined();
        });

        it('skips a malformed record without dropping the valid ones alongside it', () => {
            sessionStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    broken: null,
                    alsoBroken: 'not-an-object',
                    valid: { status: 'SUBMITTED', hash: '0xhash' },
                }),
            );
            const manager = new PendingTransactionManager();

            expect(manager.get('broken')).toBeUndefined();
            expect(manager.get('alsoBroken')).toBeUndefined();
            expect(manager.get('valid')).toEqual({
                status: PendingTransactionStatus.SUBMITTED,
                hash: '0xhash',
            });
        });

        it('starts empty when the stored payload itself is not an object', () => {
            sessionStorage.setItem(STORAGE_KEY, 'null');

            expect(() => new PendingTransactionManager()).not.toThrow();
        });
    });
});
