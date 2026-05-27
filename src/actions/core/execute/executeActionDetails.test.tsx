import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import {
    ExecuteActionDetails,
    type IExecuteActionDetailsProps,
} from './executeActionDetails';

jest.mock('@/modules/governance/components/nestedActionsList', () => ({
    NestedActionsList: ({ rawActions }: { rawActions?: IProposalAction[] }) => (
        <div data-testid="nested-actions-list">
            {`nested-count:${(rawActions ?? []).length.toString()}`}
        </div>
    ),
}));

describe('<ExecuteActionDetails /> component', () => {
    const buildAction = (
        overrides?: Partial<IProposalActionData<IProposalAction>>,
    ): IProposalActionData<IProposalAction> => ({
        type: 'Execute',
        from: '0x0',
        to: '0x1',
        data: '0x',
        value: '0',
        daoId: 'dao-id',
        meta: undefined,
        inputData: {
            function: 'execute',
            contract: 'DAO',
            parameters: [],
        },
        ...overrides,
    });

    const createTestComponent = (
        props?: Partial<IExecuteActionDetailsProps>,
    ) => {
        const completeProps: IExecuteActionDetailsProps = {
            action: buildAction(),
            index: 0,
            chainId: 1,
            ...props,
        };

        return (
            <GukModulesProvider>
                <ExecuteActionDetails {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the callId and allowFailureMap parameters', () => {
        const action = buildAction({
            inputData: {
                function: 'execute',
                contract: 'DAO',
                parameters: [
                    {
                        name: '_callId',
                        type: 'bytes32',
                        value: '0xabc123',
                    },
                    {
                        name: 'allowFailureMap',
                        type: 'uint256',
                        value: '7',
                    },
                ],
            },
        });

        render(createTestComponent({ action }));

        expect(
            screen.getByText(/actions.nested.execute.callId/),
        ).toBeInTheDocument();
        expect(screen.getByText('0xabc123')).toBeInTheDocument();
        expect(
            screen.getByText(/actions.nested.execute.allowFailureMap/),
        ).toBeInTheDocument();
        expect(screen.getByText('7')).toBeInTheDocument();
    });

    it('mounts NestedActionsList with the decoded sub-actions', () => {
        const action = buildAction({
            inputData: {
                function: 'execute',
                contract: 'DAO',
                parameters: [],
                actions: [
                    {
                        type: 'Foo',
                        from: '0x0',
                        to: '0x1',
                        data: '0x',
                        value: '0',
                        inputData: null,
                    },
                ],
            },
        });

        render(createTestComponent({ action }));

        expect(screen.getByTestId('nested-actions-list')).toHaveTextContent(
            'nested-count:1',
        );
    });
});
