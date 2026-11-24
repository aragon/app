import { addressUtils } from '@aragon/gov-ui-kit';
import { act, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import type { TransactionReceipt } from 'viem';
import safeWallet from '@/assets/images/safeWallet.png';
import { Network } from '@/shared/api/daoService';
import * as IpfsMutations from '@/shared/api/ipfsService/mutations';
import {
    type ITransactionDialogProps,
    TransactionDialog,
} from '@/shared/components/transactionDialog';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import { safeDeploymentUtils } from '../../utils/safeDeploymentUtils';
import {
    type ISafeDeployTransactionDialogParams,
    SafeDeployTransactionDialog,
} from './safeDeployTransactionDialog';

jest.mock('@/assets/images/safeWallet.png', () => ({
    __esModule: true,
    default: { src: '/safeWallet.png' },
}));

jest.mock('@/shared/components/transactionDialog', () => ({
    __esModule: true,
    TransactionDialog: jest.fn((props: { children?: ReactNode }) => (
        <div>{props.children}</div>
    )),
    TransactionDialogStep: { PREPARE: 'PREPARE', CONFIRM: 'CONFIRM' },
}));

describe('<SafeDeployTransactionDialog /> component', () => {
    const buildDeploymentSpy = jest.spyOn(
        safeDeploymentUtils,
        'buildDeployment',
    );
    const getSafeAddressSpy = jest.spyOn(safeDeploymentUtils, 'getSafeAddress');
    const logErrorSpy = jest.spyOn(monitoringUtils, 'logError');
    const usePinFileSpy = jest.spyOn(IpfsMutations, 'usePinFile');
    const pinFile = jest.fn();
    const imageSpies: jest.SpyInstance[] = [];

    const wallet = '0x0000000000000000000000000000000000000011';
    const safeAddress = '0x3c66f458e159c671e908E51fABf869556c488a82';
    const transaction = {
        to: '0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67',
        data: '0x1688f0b9',
        value: BigInt(0),
    } as const;

    beforeEach(() => {
        imageSpies.push(
            jest
                .spyOn(HTMLImageElement.prototype, 'complete', 'get')
                .mockReturnValue(true),
            jest
                .spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get')
                .mockReturnValue(1),
        );
        pinFile.mockResolvedValue({ IpfsHash: 'QmSafeLogo' });
        usePinFileSpy.mockReturnValue({
            mutateAsync: pinFile,
        } as unknown as ReturnType<typeof IpfsMutations.usePinFile>);
        buildDeploymentSpy.mockResolvedValue({
            address: safeAddress,
            transaction,
        });
        getSafeAddressSpy.mockResolvedValue(safeAddress);
    });

    afterEach(() => {
        buildDeploymentSpy.mockReset();
        getSafeAddressSpy.mockReset();
        logErrorSpy.mockReset();
        pinFile.mockReset();
        usePinFileSpy.mockReset();
        imageSpies.forEach((spy) => spy.mockRestore());
        imageSpies.length = 0;
        (TransactionDialog as unknown as jest.Mock).mockClear();
    });

    const buildParams = (
        params?: Partial<ISafeDeployTransactionDialogParams>,
    ): ISafeDeployTransactionDialogParams => ({
        network: Network.ETHEREUM_SEPOLIA,
        name: 'Treasury',
        owners: [wallet, '0x0000000000000000000000000000000000000012'],
        threshold: 2,
        onCreated: jest.fn(),
        ...params,
    });

    const lastDialogProps = () =>
        (TransactionDialog as unknown as jest.Mock).mock.lastCall?.[0] as
            | ITransactionDialogProps
            | undefined;

    const renderDialog = (params = buildParams()) =>
        render(
            <SafeDeployTransactionDialog location={{ id: 'deploy', params }} />,
        );

    const setConfirmedStep = () => {
        act(() => {
            lastDialogProps()!.stepper.updateSteps([
                {
                    id: 'CONFIRM',
                    order: 2,
                    meta: {
                        state: 'success',
                        label: 'Confirm',
                        errorLabel: 'Confirmation failed',
                    },
                },
            ]);
            lastDialogProps()!.stepper.updateActiveStep('CONFIRM');
        });
    };

    const confirmTransaction = async (receipt: TransactionReceipt) => {
        setConfirmedStep();
        await act(async () => {
            await lastDialogProps()!.onSuccess?.(receipt);
        });
    };

    const confirmStep = () =>
        lastDialogProps()!.stepper.steps.find((step) => step.id === 'CONFIRM')!;

    it('sends the transaction on the network of the new Safe', () => {
        renderDialog(buildParams({ network: Network.BASE_MAINNET }));

        expect(lastDialogProps()?.network).toBe(Network.BASE_MAINNET);
    });

    it('prepares the deploy transaction from the owners and approvals', async () => {
        const params = buildParams();
        renderDialog(params);

        const prepared = await act(() =>
            lastDialogProps()!.prepareTransaction(),
        );

        expect(buildDeploymentSpy).toHaveBeenCalledWith({
            network: params.network,
            owners: params.owners,
            threshold: params.threshold,
            saltNonce: expect.any(String) as string,
        });
        expect(prepared).toEqual(transaction);
    });

    it('keeps the same salt when the transaction is prepared again', async () => {
        let now = 1_731_500_000_000;
        const dateNowSpy = jest
            .spyOn(Date, 'now')
            .mockImplementation(() => now++);
        renderDialog();

        await act(() => lastDialogProps()!.prepareTransaction());
        await act(() => lastDialogProps()!.prepareTransaction());

        const [firstCall, secondCall] = buildDeploymentSpy.mock.calls;
        expect(secondCall[0].saltNonce).toBe(firstCall[0].saltNonce);
        dateNowSpy.mockRestore();
    });

    it('uses a new salt when the deploy dialog opens again in the same millisecond', async () => {
        const dateNowSpy = jest
            .spyOn(Date, 'now')
            .mockReturnValue(1_731_500_000_000);
        const first = renderDialog();
        await act(() => lastDialogProps()!.prepareTransaction());
        first.unmount();
        renderDialog();
        await act(() => lastDialogProps()!.prepareTransaction());
        expect(buildDeploymentSpy.mock.calls[1][0].saltNonce).not.toBe(
            buildDeploymentSpy.mock.calls[0][0].saltNonce,
        );
        dateNowSpy.mockRestore();
    });

    it('shows the Safe logo, name and chain on the deploy card', () => {
        renderDialog();
        expect(
            screen.getByRole('heading', { name: 'Treasury' }),
        ).toBeInTheDocument();
        expect(screen.getByText('Ethereum Sepolia')).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'avatar' })).toHaveAttribute(
            'src',
            safeWallet.src,
        );
    });

    it('pins an uploaded logo before preparing the deployment', async () => {
        const file = new File(['image'], 'logo.png', { type: 'image/png' });
        const params = buildParams({
            avatar: { file, url: 'blob:logo-preview' },
        });
        renderDialog(params);
        expect(screen.getByRole('img', { name: 'avatar' })).toHaveAttribute(
            'src',
            'blob:logo-preview',
        );
        await act(() => lastDialogProps()!.prepareTransaction());
        expect(pinFile).toHaveBeenCalledWith({ body: file });
        expect(buildDeploymentSpy).toHaveBeenCalledTimes(1);
        const receipt = {
            transactionHash: '0x1234',
        } as unknown as TransactionReceipt;
        await confirmTransaction(receipt);
        act(() => {
            lastDialogProps()!.successLink?.onClick?.(receipt);
        });
        expect(params.onCreated).toHaveBeenCalledWith({
            network: params.network,
            address: safeAddress,
            avatarUri: 'ipfs://QmSafeLogo',
        });
    });

    it('does not prepare a deployment if the logo cannot be pinned', async () => {
        pinFile.mockRejectedValueOnce(new Error('Pin failed'));
        const params = buildParams({
            avatar: { file: new File(['image'], 'logo.png') },
        });
        renderDialog(params);
        await expect(
            act(() => lastDialogProps()!.prepareTransaction()),
        ).rejects.toThrow('Pin failed');
        expect(buildDeploymentSpy).not.toHaveBeenCalled();
        expect(params.onCreated).not.toHaveBeenCalled();
    });

    it('reuses a pinned logo when deployment preparation is retried', async () => {
        const file = new File(['image'], 'logo.png');
        pinFile.mockResolvedValueOnce({ IpfsHash: 'QmSafeLogo' });
        pinFile.mockRejectedValueOnce(new Error('Pin service unavailable'));
        buildDeploymentSpy.mockRejectedValueOnce(new Error('RPC unavailable'));
        renderDialog(buildParams({ avatar: { file } }));

        await act(async () => {
            await expect(
                lastDialogProps()!.prepareTransaction(),
            ).rejects.toThrow('RPC unavailable');
        });
        const prepared = await act(() =>
            lastDialogProps()!
                .prepareTransaction()
                .catch(() => undefined),
        );

        expect(prepared).toEqual(transaction);
        expect(pinFile).toHaveBeenCalledTimes(1);
        expect(buildDeploymentSpy).toHaveBeenCalledTimes(2);
    });

    it('retries the upload when the first pin fails', async () => {
        const file = new File(['image'], 'logo.png');
        pinFile.mockRejectedValueOnce(new Error('Pin service unavailable'));
        renderDialog(buildParams({ avatar: { file } }));

        await act(async () => {
            await expect(
                lastDialogProps()!.prepareTransaction(),
            ).rejects.toThrow('Pin service unavailable');
        });
        expect(buildDeploymentSpy).not.toHaveBeenCalled();
        const prepared = await act(() =>
            lastDialogProps()!.prepareTransaction(),
        );

        expect(prepared).toEqual(transaction);
        expect(pinFile).toHaveBeenCalledTimes(2);
        expect(buildDeploymentSpy).toHaveBeenCalledTimes(1);
    });

    it('shows the address the Safe will get once the transaction is prepared', async () => {
        const shortAddress = addressUtils.truncateAddress(safeAddress);
        renderDialog();
        expect(screen.queryByText(shortAddress)).not.toBeInTheDocument();

        await act(() => lastDialogProps()!.prepareTransaction());

        expect(screen.getByText(shortAddress)).toBeInTheDocument();
    });

    it('shows the Safe deploy title and finishes in three steps', () => {
        renderDialog();
        expect(lastDialogProps()?.title).toBe(
            'app.safe.safeDeployTransactionDialog.title',
        );
        expect(lastDialogProps()?.transactionType).toBeUndefined();
        expect(lastDialogProps()?.customSteps).toBeUndefined();
        expect(lastDialogProps()?.dialogId).toBe('deploy');
        expect(lastDialogProps()?.preventCloseWhileBusy).toBe(true);
    });

    it('hands the deployed Safe back on Done, not on confirmation', async () => {
        const params = buildParams();
        const receipt = { logs: [] } as unknown as TransactionReceipt;
        renderDialog(params);

        await confirmTransaction(receipt);

        expect(params.onCreated).not.toHaveBeenCalled();
        expect(confirmStep().meta.state).toBe('success');
        act(() => {
            lastDialogProps()!.successLink?.onClick?.(receipt);
        });
        expect(getSafeAddressSpy).toHaveBeenCalledTimes(1);
        expect(getSafeAddressSpy).toHaveBeenCalledWith(receipt);
        expect(params.onCreated).toHaveBeenCalledWith({
            network: params.network,
            address: safeAddress,
        });
    });

    it('keeps Done unavailable while the confirmed address is being read', async () => {
        let finishRead!: (address: string) => void;
        getSafeAddressSpy.mockReturnValueOnce(
            new Promise((resolve) => {
                finishRead = resolve;
            }),
        );
        const receipt = {
            logs: [],
            transactionHash: '0x1234',
        } as unknown as TransactionReceipt;
        renderDialog();
        setConfirmedStep();
        expect(confirmStep().meta.state).toBe('pending');
        act(() => {
            void lastDialogProps()!.onSuccess?.(receipt);
        });
        expect(confirmStep().meta.state).toBe('pending');
        await act(async () => {
            finishRead(safeAddress);
            await Promise.resolve();
        });
        expect(confirmStep().meta.state).toBe('success');
    });

    it('shows an address error and retries without deploying again', async () => {
        const params = buildParams();
        const receipt = {
            logs: [],
            transactionHash: '0x1234',
        } as unknown as TransactionReceipt;
        const error = new Error('SafeProxy was not deployed correctly');
        getSafeAddressSpy.mockRejectedValueOnce(error);
        logErrorSpy.mockImplementation(jest.fn());
        renderDialog(params);
        await confirmTransaction(receipt);

        expect(confirmStep().meta.state).toBe('error');
        expect(confirmStep().meta.errorLabel).toBe(
            'app.safe.safeDeployTransactionDialog.addressError',
        );
        expect(params.onCreated).not.toHaveBeenCalled();
        expect(logErrorSpy).toHaveBeenCalledWith(error, {
            context: { network: params.network, hash: receipt.transactionHash },
        });

        await act(async () => {
            confirmStep().meta.action?.({ onError: jest.fn() });
            await Promise.resolve();
        });
        expect(getSafeAddressSpy).toHaveBeenCalledTimes(2);
        expect(getSafeAddressSpy).toHaveBeenLastCalledWith(receipt);
        expect(buildDeploymentSpy).not.toHaveBeenCalled();
        expect(confirmStep().meta.state).toBe('success');
        expect(params.onCreated).not.toHaveBeenCalled();
        act(() => {
            lastDialogProps()!.successLink?.onClick?.(receipt);
        });
        expect(params.onCreated).toHaveBeenCalledTimes(1);
        expect(params.onCreated).toHaveBeenCalledWith({
            network: params.network,
            address: safeAddress,
        });
    });

    it('does not add the predicted Safe from a successful cancellation receipt', async () => {
        const params = buildParams();
        const receipt = {
            status: 'success',
            logs: [],
            transactionHash: '0x5678',
        } as unknown as TransactionReceipt;
        getSafeAddressSpy.mockRejectedValue(
            new Error('SafeProxy was not deployed correctly'),
        );
        logErrorSpy.mockImplementation(jest.fn());
        renderDialog(params);
        await act(() => lastDialogProps()!.prepareTransaction());
        await confirmTransaction(receipt);

        expect(
            screen.getByText(addressUtils.truncateAddress(safeAddress)),
        ).toBeInTheDocument();
        expect(confirmStep().meta.state).toBe('error');
        expect(params.onCreated).not.toHaveBeenCalled();
    });

    it('leaves cancelling to the transaction dialog', () => {
        renderDialog();

        expect(lastDialogProps()?.onCancelClick).toBeUndefined();
    });
});
