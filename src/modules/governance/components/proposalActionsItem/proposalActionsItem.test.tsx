import { render, screen } from '@testing-library/react';
import { initExecuteActionViews } from '@/actions/core/execute';
import { ProposalActionsItem } from './proposalActionsItem';

jest.mock('@aragon/gov-ui-kit', () => ({
    ProposalActions: {
        Item: ({
            CustomComponent,
            actionFunctionSelector,
        }: {
            CustomComponent?: React.ComponentType;
            actionFunctionSelector?: string;
        }) => (
            <div
                data-component={CustomComponent?.name ?? ''}
                data-selector={actionFunctionSelector}
                data-testid="proposal-action-item"
            />
        ),
    },
}));

describe('<ProposalActionsItem /> component', () => {
    beforeAll(() => {
        initExecuteActionViews();
    });

    it('resolves executor execute actions by selector even when the backend type is Unknown', () => {
        render(
            <ProposalActionsItem
                action={
                    {
                        type: 'Unknown',
                        from: '0x0000000000000000000000000000000000000000',
                        to: '0xb81902c5e28e0e2bcdeeb74b7e4543902e8e4c74',
                        data: '0x3f707e6b',
                        value: '0',
                        inputData: {
                            function: 'execute',
                            contract: 'CrossChainExecutor',
                            parameters: [
                                {
                                    name: '_actions',
                                    type: 'tuple[]',
                                    components: [
                                        { name: 'to', type: 'address' },
                                        { name: 'value', type: 'uint256' },
                                        { name: 'data', type: 'bytes' },
                                    ],
                                    value: [],
                                },
                            ],
                        },
                    } as never
                }
                daoId="ethereum-sepolia-0xdao"
            />,
        );

        const actionItem = screen.getByTestId('proposal-action-item');

        expect(actionItem).toHaveAttribute('data-selector', '0x3f707e6b');
        expect(actionItem).toHaveAttribute(
            'data-component',
            'ExecuteActionDetails',
        );
    });
});
