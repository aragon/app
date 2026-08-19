import {
    recoverMessageAddress,
    recoverTransactionAddress,
    type TransactionSerializedEIP1559,
} from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import {
    generateMpcSignRequest,
    setupWebCrypto,
} from '@/modules/mpc/testUtils';
import { loadDeviceShare } from '@/modules/mpc/utils/deviceShareStorage';
import { parseRecoveryShare } from '@/modules/mpc/utils/recoveryShare';
import { mockShamirProvider } from './mockShamirProvider';
import type { MpcCeremonyStep } from './mpcProvider.api';

describe('mockShamirProvider', () => {
    beforeAll(() => {
        setupWebCrypto();
    });

    beforeEach(() => {
        localStorage.clear();
    });

    const systemId = 'system-1';
    const passphrase = 'correct horse battery staple';

    it('creates a key, stores the device share and signs a message recoverable to the address', async () => {
        const steps: MpcCeremonyStep[] = [];
        const registerServerShare = jest.fn(() => Promise.resolve());
        const created = await mockShamirProvider.createKey({
            systemId,
            passphrase,
            onProgress: (step) => steps.push(step),
            registerServerShare,
        });

        expect(steps).toEqual([
            'generating',
            'splitting',
            'storing_device_share',
            'registering_server_share',
            'done',
        ]);
        expect(registerServerShare).toHaveBeenCalledWith({
            address: created.address,
            publicKey: created.publicKey,
            serverShare: created.serverShare,
        });
        expect(created.serverShare).toEqual(
            expect.objectContaining({ index: 2, epoch: 1 }),
        );
        expect(created.recoveryShare).toEqual(
            expect.objectContaining({ index: 3, epoch: 1, systemId }),
        );
        expect(parseRecoveryShare(created.recoveryShareText)).toEqual(
            created.recoveryShare,
        );
        expect(await mockShamirProvider.hasDeviceShare(systemId)).toBe(true);

        const request = generateMpcSignRequest({ systemId });
        const { signature, signedTransaction } = await mockShamirProvider.sign({
            systemId,
            passphrase,
            request,
            serverShare: created.serverShare,
        });
        expect(signedTransaction).toBeUndefined();
        const recovered = await recoverMessageAddress({
            message: 'hello',
            signature,
        });
        expect(recovered).toBe(created.address);
    }, 30_000);

    it('signs a prepared transaction', async () => {
        const created = await mockShamirProvider.createKey({
            systemId,
            passphrase,
        });
        const request = generateMpcSignRequest({
            systemId,
            type: 'transaction',
            payload: {
                type: 'transaction',
                transaction: {
                    chainId: 11_155_111,
                    to: '0x1234567890123456789012345678901234567890',
                    valueWei: '1000',
                },
            },
        });
        const { signedTransaction } = await mockShamirProvider.sign({
            systemId,
            passphrase,
            request,
            serverShare: created.serverShare,
            preparedTransaction: {
                chainId: 11_155_111,
                nonce: 0,
                to: '0x1234567890123456789012345678901234567890',
                valueWei: '1000',
                gas: '21000',
                maxFeePerGasWei: '1000000000',
                maxPriorityFeePerGasWei: '1000000',
            },
        });
        expect(signedTransaction).toBeDefined();
        const recovered = await recoverTransactionAddress({
            serializedTransaction:
                signedTransaction as TransactionSerializedEIP1559,
        });
        expect(recovered).toBe(created.address);
    }, 30_000);

    it('fails to sign with a wrong passphrase', async () => {
        const created = await mockShamirProvider.createKey({
            systemId,
            passphrase,
        });
        await expect(
            mockShamirProvider.sign({
                systemId,
                passphrase: 'wrong',
                request: generateMpcSignRequest({ systemId }),
                serverShare: created.serverShare,
            }),
        ).rejects.toThrow();
    }, 30_000);

    it('reshares, recovers and exports the same key', async () => {
        const created = await mockShamirProvider.createKey({
            systemId,
            passphrase,
        });
        const exported = await mockShamirProvider.exportKey({
            systemId,
            passphrase,
            recoveryShare: created.recoveryShare,
        });
        expect(exported).toMatch(/^0x[0-9a-f]{64}$/);

        const reshared = await mockShamirProvider.reshare({
            systemId,
            passphrase,
            newPassphrase: 'new-pass',
            serverShare: created.serverShare,
        });
        expect(reshared.serverShare.epoch).toBe(2);
        expect(reshared.serverShare.value).not.toBe(created.serverShare.value);
        expect(
            await mockShamirProvider.exportKey({
                systemId,
                passphrase: 'new-pass',
                serverShare: reshared.serverShare,
            }),
        ).toBe(exported);

        // Device lost: recover with recovery + server share.
        localStorage.clear();
        const recovered = await mockShamirProvider.recover({
            systemId,
            recoveryShare: reshared.recoveryShare,
            serverShare: reshared.serverShare,
            newPassphrase: 'recovered-pass',
        });
        expect(recovered.serverShare.epoch).toBe(3);
        expect(
            await mockShamirProvider.exportKey({
                systemId,
                passphrase: 'recovered-pass',
                serverShare: recovered.serverShare,
            }),
        ).toBe(exported);
    }, 60_000);

    it('verifies the device share and passphrase without releasing anything', async () => {
        await expect(
            mockShamirProvider.verifyDeviceShare({ systemId, passphrase }),
        ).rejects.toThrow(/no device share/);

        await mockShamirProvider.createKey({ systemId, passphrase });

        await expect(
            mockShamirProvider.verifyDeviceShare({ systemId, passphrase }),
        ).resolves.toBeUndefined();
        await expect(
            mockShamirProvider.verifyDeviceShare({
                systemId,
                passphrase: 'wrong',
            }),
        ).rejects.toThrow();
    }, 30_000);

    it('keeps the current device share when the reshare upload fails', async () => {
        const created = await mockShamirProvider.createKey({
            systemId,
            passphrase,
        });
        const before = await loadDeviceShare(systemId);
        const uploadServerShare = jest.fn(() =>
            Promise.reject(new Error('network')),
        );

        await expect(
            mockShamirProvider.reshare({
                systemId,
                passphrase,
                serverShare: created.serverShare,
                expectedAddress: created.address,
                uploadServerShare,
            }),
        ).rejects.toThrow('network');

        expect(uploadServerShare).toHaveBeenCalledTimes(1);
        // Device share unchanged (still epoch 1, still decryptable with the same passphrase).
        expect(await loadDeviceShare(systemId)).toEqual(before);
        await expect(
            mockShamirProvider.exportKey({
                systemId,
                passphrase,
                serverShare: created.serverShare,
                expectedAddress: created.address,
            }),
        ).resolves.toMatch(/^0x[0-9a-f]{64}$/);

        // Upload succeeds: the device share moves to the new epoch only afterwards.
        const uploaded: number[] = [];
        const reshared = await mockShamirProvider.reshare({
            systemId,
            passphrase,
            serverShare: created.serverShare,
            expectedAddress: created.address,
            uploadServerShare: async (share) => {
                uploaded.push(share.epoch);
                expect((await loadDeviceShare(systemId))?.epoch).toBe(1);
            },
        });
        expect(uploaded).toEqual([2]);
        expect(reshared.serverShare.epoch).toBe(2);
        expect((await loadDeviceShare(systemId))?.epoch).toBe(2);
    }, 60_000);

    it('refuses to reshare, recover or export when the reconstructed key does not match the address', async () => {
        const created = await mockShamirProvider.createKey({
            systemId,
            passphrase,
        });
        const wrongAddress = privateKeyToAccount(generatePrivateKey()).address;
        const uploadServerShare = jest.fn(() => Promise.resolve());

        await expect(
            mockShamirProvider.reshare({
                systemId,
                passphrase,
                serverShare: created.serverShare,
                expectedAddress: wrongAddress,
                uploadServerShare,
            }),
        ).rejects.toThrow(/does not match the system address/);
        expect(uploadServerShare).not.toHaveBeenCalled();

        // Corrupted recovery share (right epoch / index, wrong value).
        await expect(
            mockShamirProvider.recover({
                systemId,
                recoveryShare: {
                    ...created.recoveryShare,
                    value: `0x${'22'.repeat(32)}`,
                },
                serverShare: created.serverShare,
                newPassphrase: 'other-pass',
                expectedAddress: created.address,
                uploadServerShare,
            }),
        ).rejects.toThrow(/does not match the system address/);
        expect(uploadServerShare).not.toHaveBeenCalled();
        expect((await loadDeviceShare(systemId))?.epoch).toBe(1);

        await expect(
            mockShamirProvider.exportKey({
                systemId,
                passphrase,
                recoveryShare: created.recoveryShare,
                expectedAddress: wrongAddress,
            }),
        ).rejects.toThrow(/does not match the system address/);
    }, 60_000);

    it('rejects shares from different epochs', async () => {
        const created = await mockShamirProvider.createKey({
            systemId,
            passphrase,
        });
        await expect(
            mockShamirProvider.sign({
                systemId,
                passphrase,
                request: generateMpcSignRequest({ systemId }),
                serverShare: { ...created.serverShare, epoch: 2 },
            }),
        ).rejects.toThrow(/epochs/);
    }, 30_000);
});
