import { ProposalStatus } from '@aragon/gov-ui-kit';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { generateProposal } from '@/modules/governance/testUtils';
import { Network, PluginInterfaceType } from '@/shared/api/daoService';
import {
    generateDao,
    generateSafeInfo,
    generateSafeTransaction,
} from '@/shared/testUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import {
    type IWorkspaceTodoProposalItem,
    type IWorkspaceTodoTransactionItem,
    WorkspaceTodoType,
} from '../../hooks/useWorkspaceTodoData';
import { generateWorkspaceAccount } from '../../testUtils';
import { workspaceTodoUtils } from './workspaceTodoUtils';

describe('workspaceTodo utils', () => {
    describe('getProposalStatus', () => {
        const getSlotFunctionSpy = jest.spyOn(
            pluginRegistryUtils,
            'getSlotFunction',
        );

        afterEach(() => {
            getSlotFunctionSpy.mockReset();
        });

        it('returns the status computed by the process plugin of the proposal', () => {
            const proposal = generateProposal({
                pluginInterfaceType: PluginInterfaceType.MULTISIG,
            });
            getSlotFunctionSpy.mockReturnValue(() => ProposalStatus.ACTIVE);

            expect(workspaceTodoUtils.getProposalStatus(proposal)).toBe(
                ProposalStatus.ACTIVE,
            );
            expect(getSlotFunctionSpy).toHaveBeenCalledWith({
                slotId: GovernanceSlotId.GOVERNANCE_PROCESS_PROPOSAL_STATUS,
                pluginId: PluginInterfaceType.MULTISIG,
            });
        });

        it('returns undefined when no plugin claims the proposal interface type', () => {
            getSlotFunctionSpy.mockReturnValue(undefined);

            expect(
                workspaceTodoUtils.getProposalStatus(generateProposal()),
            ).toBeUndefined();
        });
    });

    describe('to-do items', () => {
        const network = Network.ETHEREUM_SEPOLIA;
        const daoAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';

        const proposalTodo: IWorkspaceTodoProposalItem = {
            type: WorkspaceTodoType.PROPOSAL,
            proposal: {
                ...generateProposal({ id: 'p1', network, daoAddress }),
                voteEndDate: 1_800_000_000,
            },
            dao: generateDao(),
        };

        const buildTransactionTodo = (
            todo?: Partial<IWorkspaceTodoTransactionItem>,
        ): IWorkspaceTodoTransactionItem => ({
            type: WorkspaceTodoType.TRANSACTION,
            account: generateWorkspaceAccount({ id: 'safe-account' }),
            safeInfo: generateSafeInfo({ threshold: 2 }),
            transaction: generateSafeTransaction({
                safeTxHash: '0xff54',
                confirmationsRequired: 3,
            }),
            hasNonceRival: false,
            ...todo,
        });

        describe('getTodoKey', () => {
            it('keys a proposal by its ID', () => {
                expect(workspaceTodoUtils.getTodoKey(proposalTodo)).toBe('p1');
            });

            it('keys a Safe transaction by its account and hash', () => {
                expect(
                    workspaceTodoUtils.getTodoKey(buildTransactionTodo()),
                ).toBe('safe-account-0xff54');
            });
        });

        describe('getProposalUrl', () => {
            const accountUrl = `/workspace/my-workspace/${network}-${daoAddress}`;

            it('leads to the page of the proposal under its account', () => {
                expect(
                    workspaceTodoUtils.getProposalUrl(
                        'my-workspace',
                        proposalTodo,
                        'GOV-3',
                    ),
                ).toBe(`${accountUrl}/proposals/GOV-3`);
            });

            it('leads to the proposals of the account when the proposal has no slug', () => {
                expect(
                    workspaceTodoUtils.getProposalUrl(
                        'my-workspace',
                        proposalTodo,
                    ),
                ).toBe(`${accountUrl}/proposals`);
            });
        });

        describe('getRequiredSignatures', () => {
            it('prefers the threshold read from the Safe', () => {
                expect(
                    workspaceTodoUtils.getRequiredSignatures(
                        buildTransactionTodo(),
                    ),
                ).toBe(2);
            });

            it('falls back to the queue threshold when the Safe could not be read', () => {
                expect(
                    workspaceTodoUtils.getRequiredSignatures(
                        buildTransactionTodo({ safeInfo: null }),
                    ),
                ).toBe(3);
            });
        });
    });
});
