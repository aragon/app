import { ProposalActionTypeNoBasicView } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { CoreActionType } from '@/actions/core/types/enum/coreActionType';
import type { IProposalAction } from '@/modules/governance/api/governanceService';
import { Network } from '@/shared/api/daoService';
import { safeService } from '@/shared/api/safeService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
import { useSafeDaoProposalActions } from './useSafeDaoProposalActions';

const safeAddress = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const daoAddress = '0x1111111111111111111111111111111111111111';
const targetAddress = '0x2222222222222222222222222222222222222222';
const safeTxHash = `0x${'1'.repeat(64)}`;
const localAction = {
    to: targetAddress,
    value: BigInt(0),
    data: '0x12345678',
} as ITransactionRequest;

const createAction = (values: Partial<IProposalAction> = {}): IProposalAction =>
    ({
        from: daoAddress,
        to: targetAddress,
        value: '0',
        data: '0x12345678',
        type: 'Unknown',
        inputData: null,
        ...values,
    }) as IProposalAction;

const createExecuteAction = (
    nestedActions: IProposalAction[],
): IProposalAction =>
    createAction({
        to: daoAddress,
        type: CoreActionType.EXECUTE,
        inputData: {
            function: 'execute',
            actions: nestedActions,
        } as never,
    });

const createWrapper = () => {
    const client = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });

    return ({ children }: { children?: ReactNode }) =>
        createElement(ReactQueryWrapper, { client, children });
};

describe('useSafeDaoProposalActions', () => {
    const getActionsSpy = jest.spyOn(safeService, 'getSafeTransactionActions');
    const params = {
        daoAddress,
        enabled: true,
        localActions: [localAction],
        network: Network.ETHEREUM_MAINNET,
        safeAddress,
        safeTxHash,
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('uses matching decoded nested DAO actions for display', async () => {
        const decodedAction = createAction();
        getActionsSpy.mockResolvedValue({
            actions: [createExecuteAction([decodedAction])],
            decoding: false,
            rawActions: [
                {
                    data: localAction.data,
                    to: localAction.to,
                    value: '0',
                },
            ],
        });

        const { result } = renderHook(() => useSafeDaoProposalActions(params), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.usingDecoded).toBe(true));
        expect(result.current.actions).toEqual([decodedAction]);
        expect(result.current.isDecoding).toBe(false);
    });

    it('keeps raw stubs while backend decoding is pending', async () => {
        getActionsSpy.mockResolvedValue({
            actions: [],
            decoding: true,
            rawActions: [
                {
                    data: localAction.data,
                    to: localAction.to,
                    value: '0',
                },
            ],
        });

        const { result } = renderHook(() => useSafeDaoProposalActions(params), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isDecoding).toBe(true));
        expect(result.current.usingDecoded).toBe(false);
        expect(result.current.actions).toEqual([
            expect.objectContaining({
                data: localAction.data,
                inputData: null,
                to: localAction.to,
                type: ProposalActionTypeNoBasicView.RAW_CALLDATA,
                value: '0',
            }),
        ]);
    });

    it('keeps raw stubs when the decode request fails', async () => {
        getActionsSpy.mockRejectedValue(new Error('decode unavailable'));

        const { result } = renderHook(() => useSafeDaoProposalActions(params), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(getActionsSpy).toHaveBeenCalledTimes(1));
        expect(result.current.usingDecoded).toBe(false);
        expect(result.current.actions[0]).toEqual(
            expect.objectContaining({
                data: localAction.data,
                inputData: null,
                to: localAction.to,
                type: ProposalActionTypeNoBasicView.RAW_CALLDATA,
                value: '0',
            }),
        );
    });

    it('keeps raw stubs when decoded immutable call data mismatches', async () => {
        const mismatchedAction = createAction({
            data: '0x87654321',
            to: '0x3333333333333333333333333333333333333333',
            value: '1',
        });
        getActionsSpy.mockResolvedValue({
            actions: [createExecuteAction([mismatchedAction])],
            decoding: false,
            rawActions: [
                {
                    data: localAction.data,
                    to: localAction.to,
                    value: '0',
                },
            ],
        });

        const { result } = renderHook(() => useSafeDaoProposalActions(params), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(getActionsSpy).toHaveBeenCalledTimes(1));
        expect(result.current.usingDecoded).toBe(false);
        expect(result.current.actions[0]).toEqual(
            expect.objectContaining({
                data: localAction.data,
                to: localAction.to,
                type: ProposalActionTypeNoBasicView.RAW_CALLDATA,
                value: '0',
            }),
        );
    });
});
