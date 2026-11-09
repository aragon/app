import {
    GukModulesProvider,
    ProposalActionTypeNoBasicView,
} from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as proposalActionsItem from '@/modules/governance/components/proposalActionsItem';
import { actionViewRegistry } from '@/shared/utils/actionViewRegistry';
import {
    type ITransactionExecutionActionsProps,
    TransactionExecutionActions,
} from './transactionExecutionActions';

describe('<TransactionExecutionActions /> component', () => {
    const proposalActionsItemSpy = jest.spyOn(
        proposalActionsItem,
        'ProposalActionsItem',
    );
    const getDaoIndependentViewSpy = jest.spyOn(
        actionViewRegistry,
        'getDaoIndependentView',
    );

    const action = {
        from: '0xfrom',
        to: '0xE5e5f0c2e1B5F1b8f2C0a1D3a4B5c6D7e8F90123',
        data: '0x',
        value: '0',
        type: ProposalActionTypeNoBasicView.RAW_CALLDATA,
        inputData: null,
    };

    beforeEach(() => {
        proposalActionsItemSpy.mockReturnValue(<div />);
    });

    afterEach(() => {
        proposalActionsItemSpy.mockReset();
        getDaoIndependentViewSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<ITransactionExecutionActionsProps>,
    ) => {
        const completeProps: ITransactionExecutionActionsProps = {
            actions: [],
            actionCount: 0,
            isLoading: false,
            isError: false,
            chainId: 1,
            transactionId: 'transaction-id',
            ...props,
        };

        return (
            <GukModulesProvider>
                <TransactionExecutionActions {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the actions with the views that do not depend on the DAO when no DAO is set', async () => {
        getDaoIndependentViewSpy.mockReturnValue({
            actionType: action.type,
            componentDetails: () => 'action-view',
            isDaoIndependent: true,
        });

        render(
            createTestComponent({ actions: [action, action], actionCount: 2 }),
        );

        await userEvent.click(screen.getAllByRole('button')[0]);

        expect(getDaoIndependentViewSpy).toHaveBeenCalledWith(
            action.type,
            undefined,
        );
        expect(screen.getByText('action-view')).toBeInTheDocument();
        expect(proposalActionsItemSpy).not.toHaveBeenCalled();
    });

    it('renders the normalized actions in the context of the DAO when set', () => {
        const normalizedAction = { ...action, to: '0xnormalized' };

        render(
            createTestComponent({
                actions: [action],
                normalizedActions: [normalizedAction],
                actionCount: 1,
                daoId: 'dao-id',
            }),
        );

        expect(proposalActionsItemSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                action: normalizedAction,
                daoId: 'dao-id',
            }),
            undefined,
        );
    });

    it('reports the actions as not loaded instead of as missing when they could not be read', () => {
        render(createTestComponent({ actionCount: 3, isError: true }));

        expect(
            screen.getByText(/transactionExecutionActions.loadError/),
        ).toBeInTheDocument();
        expect(screen.queryByText('No actions added')).not.toBeInTheDocument();
    });
});
