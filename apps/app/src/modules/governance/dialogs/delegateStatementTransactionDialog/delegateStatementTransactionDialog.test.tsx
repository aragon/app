import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ensTransactionUtils } from '@/modules/ens';
import { Network } from '@/shared/api/daoService';
import * as ipfsServiceMutations from '@/shared/api/ipfsService/mutations';
import {
    type ITransactionDialogProps,
    TransactionDialog,
} from '@/shared/components/transactionDialog';
import {
    generateReactQueryMutationResultIdle,
    generateReactQueryMutationResultSuccess,
    ReactQueryWrapper,
} from '@/shared/testUtils';
import { monitoringUtils } from '@/shared/utils/monitoringUtils';
import { DelegateStatementTransactionDialog } from './delegateStatementTransactionDialog';
import type { IDelegateStatementTransactionDialogParams } from './delegateStatementTransactionDialog.api';

// TransactionDialog encapsulates the on-chain pipeline. Mock it so we can capture
// the props the wrapper hands off (customSteps, prepareTransaction, etc.) without
// pulling wagmi/viem into the test environment.
jest.mock('@/shared/components/transactionDialog', () => ({
    __esModule: true,
    TransactionDialog: jest.fn((props: { children?: ReactNode }) => (
        <div data-testid="transaction-dialog">{props.children}</div>
    )),
    TransactionDialogStep: { PREPARE: 'PREPARE' },
}));

jest.mock('@/modules/application/constants/wagmi', () => ({
    wagmiConfig: { mocked: true },
}));

const TRANSACTION = {
    to: '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63',
    data: '0x10f13a8c',
    value: BigInt(0),
} as const;

const buildParams = (
    overrides?: Partial<IDelegateStatementTransactionDialogParams>,
): IDelegateStatementTransactionDialogParams => ({
    ensName: 'whomst.eth',
    network: Network.ETHEREUM_MAINNET,
    tokenAddress: '0x1111111111111111111111111111111111111111',
    content: 'I will be a long-term delegate.',
    ...overrides,
});

describe('<DelegateStatementTransactionDialog />', () => {
    const usePinJsonSpy = jest.spyOn(ipfsServiceMutations, 'usePinJson');
    const logErrorSpy = jest.spyOn(monitoringUtils, 'logError');
    const buildUpdateRecordsTransactionSpy = jest.spyOn(
        ensTransactionUtils,
        'buildUpdateRecordsTransaction',
    );

    afterEach(() => {
        usePinJsonSpy.mockReset();
        logErrorSpy.mockReset();
        buildUpdateRecordsTransactionSpy.mockReset();
        (TransactionDialog as unknown as jest.Mock).mockClear();
    });

    const lastDialogProps = () =>
        (TransactionDialog as unknown as jest.Mock).mock
            .calls[0]?.[0] as unknown as ITransactionDialogProps<string>;

    it('wires a single PIN_STATEMENT custom step that pins the markdown content as a versioned DelegateStatement', () => {
        usePinJsonSpy.mockReturnValue(
            generateReactQueryMutationResultIdle() as never,
        );
        render(
            <ReactQueryWrapper>
                <DelegateStatementTransactionDialog
                    location={{ id: 'tx', params: buildParams() }}
                />
            </ReactQueryWrapper>,
        );

        const props = lastDialogProps();
        expect(props.customSteps).toHaveLength(1);
        expect(props.customSteps?.[0].id).toBe('PIN_STATEMENT');
        expect(props.customSteps?.[0].meta.auto).toBe(true);
    });

    it('does not call the on-chain prepare step until pinJson has returned a CID', async () => {
        usePinJsonSpy.mockReturnValue(
            generateReactQueryMutationResultIdle() as never,
        );
        render(
            <ReactQueryWrapper>
                <DelegateStatementTransactionDialog
                    location={{ id: 'tx', params: buildParams() }}
                />
            </ReactQueryWrapper>,
        );

        const props = lastDialogProps();
        await expect(props.prepareTransaction()).rejects.toThrow(
            /must be pinned before tx prepare runs/,
        );
    });

    it('propagates Pinata pin failure to customSteps state so TransactionDialog halts before the on-chain step', () => {
        usePinJsonSpy.mockReturnValue({
            ...generateReactQueryMutationResultIdle(),
            status: 'error',
            isError: true,
            isIdle: false,
            error: new Error('Pinata 502'),
        } as never);

        render(
            <ReactQueryWrapper>
                <DelegateStatementTransactionDialog
                    location={{ id: 'tx', params: buildParams() }}
                />
            </ReactQueryWrapper>,
        );

        const props = lastDialogProps();
        expect(props.customSteps?.[0].meta.state).toBe('error');
        expect(props.customSteps?.[0].meta.errorLabel).toBeTruthy();
    });

    it('writes the pinned CID to the delegate-statement text record once pinJson succeeds', async () => {
        const ipfsHash = 'bafyHashFromPinata';
        usePinJsonSpy.mockReturnValue(
            generateReactQueryMutationResultSuccess({
                data: { IpfsHash: ipfsHash },
            }) as never,
        );
        buildUpdateRecordsTransactionSpy.mockResolvedValue(TRANSACTION);

        render(
            <ReactQueryWrapper>
                <DelegateStatementTransactionDialog
                    location={{ id: 'tx', params: buildParams() }}
                />
            </ReactQueryWrapper>,
        );

        const props = lastDialogProps();
        await expect(props.prepareTransaction()).resolves.toBe(TRANSACTION);
        expect(buildUpdateRecordsTransactionSpy).toHaveBeenCalledWith({
            ensName: 'whomst.eth',
            updates: {
                'eth.0x1111111111111111111111111111111111111111.delegate': `ipfs://${ipfsHash}`,
            },
        });
    });

    it('routes Pinata pin failures through monitoringUtils with stage="pinStatement"', () => {
        usePinJsonSpy.mockImplementation(((options?: {
            onError?: (e: Error) => void;
        }) => {
            options?.onError?.(new Error('Pinata 502'));
            return generateReactQueryMutationResultIdle();
        }) as never);

        render(
            <ReactQueryWrapper>
                <DelegateStatementTransactionDialog
                    location={{ id: 'tx', params: buildParams() }}
                />
            </ReactQueryWrapper>,
        );

        expect(logErrorSpy).toHaveBeenCalledWith(
            expect.any(Error),
            expect.objectContaining({
                context: expect.objectContaining({
                    module: 'delegateStatementTransactionDialog',
                    stage: 'pinStatement',
                }),
            }),
        );
    });

    it('routes ENS resolver lookup failures through monitoringUtils with stage="resolveEns"', async () => {
        usePinJsonSpy.mockReturnValue(
            generateReactQueryMutationResultSuccess({
                data: { IpfsHash: 'bafyTest' },
            }) as never,
        );
        buildUpdateRecordsTransactionSpy.mockRejectedValue(
            new Error('resolver lookup failed'),
        );

        render(
            <ReactQueryWrapper>
                <DelegateStatementTransactionDialog
                    location={{ id: 'tx', params: buildParams() }}
                />
            </ReactQueryWrapper>,
        );

        const props = lastDialogProps();
        await expect(props.prepareTransaction()).rejects.toThrow(
            /resolver lookup failed/,
        );
        expect(logErrorSpy).toHaveBeenCalledWith(
            expect.any(Error),
            expect.objectContaining({
                context: expect.objectContaining({
                    module: 'delegateStatementTransactionDialog',
                    stage: 'resolveEns',
                }),
            }),
        );
    });

    it('targets Ethereum mainnet for the on-chain transaction regardless of token network', () => {
        usePinJsonSpy.mockReturnValue(
            generateReactQueryMutationResultIdle() as never,
        );
        render(
            <ReactQueryWrapper>
                <DelegateStatementTransactionDialog
                    location={{
                        id: 'tx',
                        params: buildParams({
                            network: Network.POLYGON_MAINNET,
                        }),
                    }}
                />
            </ReactQueryWrapper>,
        );

        const props = lastDialogProps();
        expect(props.network).toBe(Network.ETHEREUM_MAINNET);
    });
});
