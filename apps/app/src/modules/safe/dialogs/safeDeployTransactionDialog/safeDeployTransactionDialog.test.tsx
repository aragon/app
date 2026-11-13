import { addressUtils } from '@aragon/gov-ui-kit';
import { act, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import type { TransactionReceipt } from 'viem';
import { Network } from '@/shared/api/daoService';
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

jest.mock('@/shared/components/transactionDialog', () => ({
    __esModule: true,
    TransactionDialog: jest.fn((props: { children?: ReactNode }) => (
        <div>{props.children}</div>
    )),
    TransactionDialogStep: { PREPARE: 'PREPARE' },
}));

describe('<SafeDeployTransactionDialog /> component', () => {
    const buildDeploymentSpy = jest.spyOn(
        safeDeploymentUtils,
        'buildDeployment',
    );
    const getSafeAddressSpy = jest.spyOn(safeDeploymentUtils, 'getSafeAddress');
    const logErrorSpy = jest.spyOn(monitoringUtils, 'logError');

    const wallet = '0x0000000000000000000000000000000000000011';
    const safeAddress = '0x3c66f458e159c671e908E51fABf869556c488a82';
    const transaction = {
        to: '0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67',
        data: '0x1688f0b9',
        value: BigInt(0),
    } as const;

    beforeEach(() => {
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

    it('shows the address the Safe will get once the transaction is prepared', async () => {
        const shortAddress = addressUtils.truncateAddress(safeAddress);
        renderDialog();
        expect(screen.queryByText(shortAddress)).not.toBeInTheDocument();

        await act(() => lastDialogProps()!.prepareTransaction());

        expect(screen.getByText(shortAddress)).toBeInTheDocument();
    });

    it('hands the deployed Safe back once the transaction is confirmed', async () => {
        const params = buildParams();
        const receipt = { logs: [] } as unknown as TransactionReceipt;
        renderDialog(params);

        await act(async () => {
            await lastDialogProps()!.onSuccess?.(receipt);
        });

        expect(getSafeAddressSpy).toHaveBeenCalledWith(receipt);
        expect(params.onCreated).toHaveBeenCalledWith({
            network: params.network,
            address: safeAddress,
            name: 'Treasury',
        });
    });

    it('hands back no Safe when the receipt has no deployment', async () => {
        const params = buildParams();
        const error = new Error('SafeProxy was not deployed correctly');
        getSafeAddressSpy.mockRejectedValue(error);
        logErrorSpy.mockImplementation(jest.fn());
        renderDialog(params);

        await act(async () => {
            await lastDialogProps()!.onSuccess?.({
                logs: [],
            } as unknown as TransactionReceipt);
        });

        expect(params.onCreated).not.toHaveBeenCalled();
        expect(logErrorSpy).toHaveBeenCalledWith(error, expect.anything());
    });

    it('leaves cancelling to the transaction dialog', () => {
        renderDialog();

        expect(lastDialogProps()?.onCancelClick).toBeUndefined();
    });
});
