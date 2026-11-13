import { act, renderHook } from '@testing-library/react';
import * as WagmiActions from 'wagmi/actions';
import {
    generateSafeConfirmation,
    generateSafeMultisigTransaction,
} from '@/plugins/safeMultisigPlugin/testUtils';
import { Network } from '@/shared/api/daoService';
import {
    SafeServiceError,
    SafeServiceErrorCode,
} from '@/shared/api/safeService';
import * as translationsProvider from '@/shared/components/translationsProvider';
import {
    type SafeProtocolKit,
    SafeProtocolKitError,
    safeProtocolKitUtils,
} from '../../utils/safeProtocolKitUtils';
import { safeTransactionLookupUtils } from '../../utils/safeTransactionLookupUtils';
import {
    SafeSignatureSubmission,
    useSafeOwnerSigning,
} from './useSafeOwnerSigning';

// Named ESM exports of these modules cannot be spied on, so they are the only module mocks of this suite.
jest.mock('wagmi/actions', () => ({
    ...jest.requireActual('wagmi/actions'),
    getBytecode: jest.fn(),
}));

jest.mock('@safe-global/protocol-kit', () => ({
    __esModule: true,
    EthSafeTransaction: jest.fn(),
}));

describe('useSafeOwnerSigning hook', () => {
    const owner = '0x0000000000000000000000000000000000000011';
    const otherOwner = '0x0000000000000000000000000000000000000012';
    const safeAddress = '0x0000000000000000000000000000000000000001';
    const network = Network.ETHEREUM_SEPOLIA;
    const safeTxHash = `0x${'1'.repeat(64)}`;
    const signature = `0x${'3'.repeat(130)}`;

    const translationKey = 'app.safe.safeOwnerSigning';

    const protocolKitModule = jest.requireMock('@safe-global/protocol-kit') as {
        EthSafeTransaction: jest.Mock;
    };
    const getBytecodeMock = jest.mocked(WagmiActions.getBytecode);

    const useTranslationsSpy = jest.spyOn(
        translationsProvider,
        'useTranslations',
    );
    const initForOwnerSpy = jest.spyOn(safeProtocolKitUtils, 'initForOwner');
    const getOwnerConnectionSpy = jest.spyOn(
        safeProtocolKitUtils,
        'getOwnerConnection',
    );
    const findTransactionSpy = jest.spyOn(
        safeTransactionLookupUtils,
        'findTransaction',
    );

    let protocolKit: {
        getOwners: jest.Mock;
        getThreshold: jest.Mock;
        getNonce: jest.Mock;
        getTransactionHash: jest.Mock;
        signTypedData: jest.Mock;
    };

    const kit = () => protocolKit as unknown as SafeProtocolKit;

    const transactionHolding = (heldSignature: string) =>
        generateSafeMultisigTransaction({
            safeTxHash,
            confirmations: [
                generateSafeConfirmation({ owner, signature: heldSignature }),
            ],
        });

    beforeEach(() => {
        protocolKit = {
            getOwners: jest.fn().mockResolvedValue([owner, otherOwner]),
            getThreshold: jest.fn().mockResolvedValue(2),
            getNonce: jest.fn().mockResolvedValue(3),
            getTransactionHash: jest.fn().mockResolvedValue(safeTxHash),
            signTypedData: jest.fn().mockResolvedValue({ data: signature }),
        };
        protocolKitModule.EthSafeTransaction.mockImplementation(
            (data: unknown) => ({ data }),
        );
        useTranslationsSpy.mockReturnValue({
            t: (key: string) => key,
        } as ReturnType<typeof translationsProvider.useTranslations>);
        getOwnerConnectionSpy.mockReturnValue({} as never);
    });

    afterEach(() => {
        jest.clearAllMocks();
        useTranslationsSpy.mockReset();
        initForOwnerSpy.mockReset();
        getOwnerConnectionSpy.mockReset();
        findTransactionSpy.mockReset();
        getBytecodeMock.mockReset();
    });

    /**
     * Runs a call of the hook inside act, as it updates the hook state, and hands back what it resolved or threw.
     */
    const inAct = async <TValue>(task: () => Promise<TValue>) => {
        let outcome: { value?: TValue; error?: unknown; isFailed: boolean } = {
            isFailed: false,
        };

        await act(async () => {
            try {
                outcome = { value: await task(), isFailed: false };
            } catch (error: unknown) {
                outcome = { error, isFailed: true };
            }
        });

        if (outcome.isFailed) {
            throw outcome.error;
        }

        return outcome.value as TValue;
    };

    const renderSigningHook = () =>
        renderHook(() => useSafeOwnerSigning({ network, safeAddress }));

    describe('getProtocolKit', () => {
        it('translates a wallet that cannot sign for the owner', async () => {
            initForOwnerSpy.mockRejectedValue(
                new SafeProtocolKitError('walletRequired'),
            );
            const { result } = renderSigningHook();

            await expect(result.current.getProtocolKit(owner)).rejects.toThrow(
                `${translationKey}.walletRequired`,
            );
        });

        it('rethrows any other failure as it is', async () => {
            initForOwnerSpy.mockRejectedValue(new Error('boom'));
            const { result } = renderSigningHook();

            await expect(result.current.getProtocolKit(owner)).rejects.toThrow(
                'boom',
            );
        });
    });

    describe('readOwnerAuthority', () => {
        it('returns the owners, threshold and nonce read from the chain', async () => {
            const { result } = renderSigningHook();

            await expect(
                result.current.readOwnerAuthority({
                    protocolKit: kit(),
                    owner,
                }),
            ).resolves.toEqual({
                owners: [owner, otherOwner],
                threshold: 2,
                currentNonce: 3,
            });
        });

        it('refuses a wallet that is not a current owner', async () => {
            protocolKit.getOwners.mockResolvedValue([otherOwner]);
            const { result } = renderSigningHook();

            await expect(
                result.current.readOwnerAuthority({
                    protocolKit: kit(),
                    owner,
                }),
            ).rejects.toThrow(`${translationKey}.notOwner`);
        });

        it('refuses a threshold the owners cannot reach', async () => {
            protocolKit.getThreshold.mockResolvedValue(3);
            const { result } = renderSigningHook();

            await expect(
                result.current.readOwnerAuthority({
                    protocolKit: kit(),
                    owner,
                }),
            ).rejects.toThrow(`${translationKey}.invalidThreshold`);
        });
    });

    describe('assertCanSign', () => {
        it('does not read the wallet on a Safe that verifies contract signatures', async () => {
            const { result } = renderSigningHook();

            await result.current.assertCanSign({
                owner,
                safeVersion: '1.4.1',
            });

            expect(getBytecodeMock).not.toHaveBeenCalled();
        });

        it('refuses a contract wallet on a Safe older than v1.3.0', async () => {
            getBytecodeMock.mockResolvedValue('0x6080');
            const { result } = renderSigningHook();

            await expect(
                result.current.assertCanSign({ owner, safeVersion: '1.2.0' }),
            ).rejects.toThrow(`${translationKey}.unsupportedContractOwner`);
        });

        it('accepts a wallet without code on a Safe older than v1.3.0', async () => {
            getBytecodeMock.mockResolvedValue(undefined);
            const { result } = renderSigningHook();

            await expect(
                result.current.assertCanSign({ owner, safeVersion: '1.2.0' }),
            ).resolves.toBeUndefined();
        });
    });

    describe('buildSafeTransaction', () => {
        it('rebuilds the reviewed transaction', async () => {
            const transaction = generateSafeMultisigTransaction({
                safeTxHash,
                nonce: '4',
            });
            const { result } = renderSigningHook();

            const safeTransaction = await result.current.buildSafeTransaction({
                protocolKit: kit(),
                transaction,
                expectedSafeTxHash: safeTxHash,
            });

            expect(safeTransaction).toEqual({
                data: expect.objectContaining({ to: transaction.to, nonce: 4 }),
            });
        });

        it('refuses fields that hash to anything but the reviewed transaction', async () => {
            protocolKit.getTransactionHash.mockResolvedValue(
                `0x${'9'.repeat(64)}`,
            );
            const { result } = renderSigningHook();

            await expect(
                result.current.buildSafeTransaction({
                    protocolKit: kit(),
                    transaction: generateSafeMultisigTransaction({
                        safeTxHash,
                    }),
                    expectedSafeTxHash: safeTxHash,
                }),
            ).rejects.toThrow(`${translationKey}.hashMismatch`);
        });

        it('refuses a transaction other than the reviewed one', async () => {
            const { result } = renderSigningHook();

            await expect(
                result.current.buildSafeTransaction({
                    protocolKit: kit(),
                    transaction: generateSafeMultisigTransaction({
                        safeTxHash: `0x${'8'.repeat(64)}`,
                    }),
                    expectedSafeTxHash: safeTxHash,
                }),
            ).rejects.toThrow(`${translationKey}.hashMismatch`);
        });
    });

    describe('signAndSubmit', () => {
        const signAndSubmit = (
            current: ReturnType<typeof useSafeOwnerSigning>,
            submit: jest.Mock,
        ) =>
            inAct(() =>
                current.signAndSubmit({
                    protocolKit: kit(),
                    owner,
                    safeTransaction: {} as never,
                    safeTxHash,
                    submit,
                }),
            );

        it('submits the signature of the owner', async () => {
            const submit = jest.fn().mockResolvedValue(undefined);
            const { result } = renderSigningHook();

            await expect(signAndSubmit(result.current, submit)).resolves.toBe(
                SafeSignatureSubmission.ACCEPTED,
            );
            expect(submit).toHaveBeenCalledWith(signature);
        });

        it('does not submit a signature made by an account switched to during the prompt', async () => {
            getOwnerConnectionSpy.mockReturnValue(undefined);
            const submit = jest.fn();
            const { result } = renderSigningHook();

            await expect(signAndSubmit(result.current, submit)).rejects.toThrow(
                `${translationKey}.walletRequired`,
            );
            expect(submit).not.toHaveBeenCalled();
        });

        it('throws a submission the service refused, leaving nothing to re-check', async () => {
            const refusal = new SafeServiceError(
                SafeServiceErrorCode.UPSTREAM_ERROR,
                'Refused',
                422,
            );
            const { result } = renderSigningHook();

            await expect(
                signAndSubmit(
                    result.current,
                    jest.fn().mockRejectedValue(refusal),
                ),
            ).rejects.toBe(refusal);
            expect(result.current.hasUncertainSignature()).toBeFalsy();
            expect(findTransactionSpy).not.toHaveBeenCalled();
        });

        it('accepts a submission without an answer once the service holds the exact signature', async () => {
            findTransactionSpy.mockResolvedValue(transactionHolding(signature));
            const { result } = renderSigningHook();

            await expect(
                signAndSubmit(
                    result.current,
                    jest.fn().mockRejectedValue(new TypeError('Failed')),
                ),
            ).resolves.toBe(SafeSignatureSubmission.ACCEPTED);
            expect(findTransactionSpy).toHaveBeenCalledWith({
                network,
                address: safeAddress,
                safeTxHash,
            });
            expect(result.current.hasUncertainSignature()).toBeFalsy();
        });

        it('keeps a submission without an answer uncertain while the service holds another signature of the owner', async () => {
            findTransactionSpy.mockResolvedValue(
                transactionHolding(`0x${'5'.repeat(130)}`),
            );
            const { result } = renderSigningHook();

            await expect(
                signAndSubmit(
                    result.current,
                    jest.fn().mockRejectedValue(new TypeError('Failed')),
                ),
            ).resolves.toBe(SafeSignatureSubmission.UNCERTAIN);
            expect(result.current.hasUncertainSignature()).toBeTruthy();
        });
    });

    describe('recheck', () => {
        it('reports nothing landed when no submission is uncertain', async () => {
            const { result } = renderSigningHook();

            await expect(result.current.recheck()).resolves.toBeFalsy();
            expect(findTransactionSpy).not.toHaveBeenCalled();
        });

        it('forgets an uncertain submission once the service holds it', async () => {
            findTransactionSpy.mockResolvedValue(undefined);
            const { result } = renderSigningHook();
            await inAct(() =>
                result.current.signAndSubmit({
                    protocolKit: kit(),
                    owner,
                    safeTransaction: {} as never,
                    safeTxHash,
                    submit: jest
                        .fn()
                        .mockRejectedValue(new TypeError('Failed')),
                }),
            );
            expect(result.current.hasUncertainSignature()).toBeTruthy();

            findTransactionSpy.mockResolvedValue(transactionHolding(signature));

            await expect(
                inAct(() => result.current.recheck()),
            ).resolves.toBeTruthy();
            expect(result.current.hasUncertainSignature()).toBeFalsy();
        });
    });
});
