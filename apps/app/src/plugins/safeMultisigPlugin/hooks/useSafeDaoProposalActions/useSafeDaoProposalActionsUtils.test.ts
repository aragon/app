import { CoreActionType } from '@/actions/core/types/enum/coreActionType';
import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
import { safeDaoProposalActionsUtils } from './useSafeDaoProposalActionsUtils';

const daoAddress = '0x1111111111111111111111111111111111111111';
const targetAddress = '0x2222222222222222222222222222222222222222';
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

describe('safeDaoProposalActionsUtils', () => {
    it('flattens only Execute wrappers targeting the DAO in order', () => {
        const firstNestedAction = createAction();
        const secondNestedAction = createAction({ data: '0x87654321' });
        const actions = [
            createAction({
                to: daoAddress,
                type: CoreActionType.EXECUTE,
                inputData: {
                    function: 'execute',
                    actions: [firstNestedAction],
                } as never,
            }),
            createAction({
                to: daoAddress,
                type: 'Unknown',
                inputData: {
                    function: 'execute',
                    actions: [createAction({ data: '0xwrong' })],
                } as never,
            }),
            createAction({
                to: daoAddress,
                type: CoreActionType.EXECUTE,
                inputData: {
                    function: 'execute',
                    actions: [secondNestedAction],
                } as never,
            }),
            createAction({
                type: CoreActionType.EXECUTE,
                inputData: {
                    function: 'execute',
                    actions: [createAction({ data: '0xwrong-target' })],
                } as never,
            }),
        ];

        expect(
            safeDaoProposalActionsUtils.flattenDaoExecuteActions(
                actions,
                daoAddress,
            ),
        ).toEqual([firstNestedAction, secondNestedAction]);
    });

    it('converts locally verified actions into comparable raw tuples', () => {
        expect(
            safeDaoProposalActionsUtils.localActionsToRawTuple([localAction]),
        ).toEqual([
            {
                to: targetAddress,
                value: '0',
                data: '0x12345678',
            },
        ]);
    });

    it('polls only while decoding and before the request cap', () => {
        expect(
            safeDaoProposalActionsUtils.getRefetchInterval({
                state: {
                    data: {
                        decoding: true,
                        actions: [],
                        rawActions: [],
                    },
                    dataUpdateCount: 0,
                },
            }),
        ).toBe(2000);
        expect(
            safeDaoProposalActionsUtils.getRefetchInterval({
                state: {
                    data: {
                        decoding: true,
                        actions: [],
                        rawActions: [],
                    },
                    dataUpdateCount: 10,
                },
            }),
        ).toBe(false);
        expect(
            safeDaoProposalActionsUtils.getRefetchInterval({
                state: {
                    data: {
                        decoding: false,
                        actions: [],
                        rawActions: [],
                    },
                    dataUpdateCount: 0,
                },
            }),
        ).toBe(false);
    });
});
