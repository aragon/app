import { decodeFunctionData, zeroHash } from 'viem';
import { generateDao } from '@/shared/testUtils';
import { globalExecutorAbi } from '@/shared/utils/transactionUtils/globalExecutorAbi';
import type { IProposalActionData } from '../../components/createProposalForm/createProposalFormDefinitions';
import { executeActionsDialogUtils } from './executeActionsDialogUtils';

describe('executeActionsDialogUtils', () => {
    describe('buildExecuteTransaction', () => {
        const generateAction = (
            action?: Partial<IProposalActionData>,
        ): IProposalActionData =>
            ({
                to: '0x1111111111111111111111111111111111111111',
                value: '0',
                data: '0x',
                ...action,
            }) as IProposalActionData;

        it('targets the DAO itself with zero value', () => {
            const dao = generateDao({
                address: '0xda0000000000000000000000000000000000beef',
            });
            const transaction =
                executeActionsDialogUtils.buildExecuteTransaction({
                    dao,
                    preparedActions: [generateAction()],
                });

            expect(transaction.to).toBe(dao.address);
            expect(transaction.value).toBe(BigInt(0));
        });

        it('encodes execute() with a zero callId and zero allowFailureMap', () => {
            const dao = generateDao();
            const { data } = executeActionsDialogUtils.buildExecuteTransaction({
                dao,
                preparedActions: [generateAction()],
            });

            const decoded = decodeFunctionData({
                abi: globalExecutorAbi,
                data,
            });

            expect(decoded.functionName).toBe('execute');
            expect(decoded.args[0]).toBe(zeroHash);
            expect(decoded.args[2]).toBe(BigInt(0));
        });

        it('round-trips the action array', () => {
            const dao = generateDao();
            const actions = [
                generateAction({
                    to: '0x2222222222222222222222222222222222222222',
                    value: '100',
                    data: '0xabcdef',
                }),
                generateAction({
                    to: '0x3333333333333333333333333333333333333333',
                    value: '0',
                    data: '0x12',
                }),
            ];

            const { data } = executeActionsDialogUtils.buildExecuteTransaction({
                dao,
                preparedActions: actions,
            });

            const decoded = decodeFunctionData({
                abi: globalExecutorAbi,
                data,
            });
            const decodedActions = decoded.args[1];

            expect(decodedActions).toEqual([
                {
                    to: actions[0].to,
                    value: BigInt(actions[0].value),
                    data: actions[0].data,
                },
                {
                    to: actions[1].to,
                    value: BigInt(actions[1].value),
                    data: actions[1].data,
                },
            ]);
        });
    });
});
