import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import {
    CreateProposalActionDetails,
    type ICreateProposalActionDetailsProps,
} from './createProposalActionDetails';

jest.mock('@/modules/governance/components/nestedActionsList', () => ({
    NestedActionsList: ({ rawActions }: { rawActions?: IProposalAction[] }) => (
        <div data-testid="nested-actions-list">
            {`nested-count:${(rawActions ?? []).length.toString()}`}
        </div>
    ),
}));

describe('<CreateProposalActionDetails /> component', () => {
    const buildAction = (
        overrides?: Partial<IProposalActionData<IProposalAction>>,
    ): IProposalActionData<IProposalAction> => ({
        type: 'CreateProposal',
        from: '0x0',
        to: '0x1',
        data: '0x',
        value: '0',
        daoId: 'dao-id',
        meta: undefined,
        inputData: {
            function: 'createProposal',
            contract: 'TokenPlugin',
            parameters: [],
        },
        ...overrides,
    });

    const createTestComponent = (
        props?: Partial<ICreateProposalActionDetailsProps>,
    ) => {
        const completeProps: ICreateProposalActionDetailsProps = {
            action: buildAction(),
            index: 0,
            chainId: 1,
            ...props,
        };

        return (
            <GukModulesProvider>
                <CreateProposalActionDetails {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders decoded outer parameters and skips _actions and _metadata', () => {
        const action = buildAction({
            inputData: {
                function: 'createProposal',
                contract: 'TokenPlugin',
                parameters: [
                    { name: '_metadata', type: 'bytes', value: '0xdeadbeef' },
                    {
                        name: '_actions',
                        type: 'tuple[]',
                        value: [{ to: '0xa', value: '0', data: '0x' }],
                    },
                    {
                        name: '_allowFailureMap',
                        type: 'uint256',
                        value: '42',
                    },
                    {
                        name: '_startDate',
                        type: 'uint64',
                        value: '1690367967',
                    },
                ],
            },
        });

        render(createTestComponent({ action }));

        expect(
            screen.getByText(/actions.nested.createProposal.allowFailureMap/),
        ).toBeInTheDocument();
        expect(screen.getByText('42')).toBeInTheDocument();
        expect(
            screen.getByText(/actions.nested.createProposal.startDate/),
        ).toBeInTheDocument();
        expect(screen.getByText('July 26, 2023')).toBeInTheDocument();
        // _actions and _metadata params should not be rendered as DefinitionList terms
        expect(screen.queryByText('0xdeadbeef')).not.toBeInTheDocument();
    });

    it('renders the resolved metadata block', () => {
        const action = buildAction({
            metadata: {
                name: 'My DAO',
                description: 'desc',
                links: [{ label: 'web', href: 'https://example.com' }],
            },
        });

        render(createTestComponent({ action }));

        expect(screen.getByText('My DAO')).toBeInTheDocument();
        expect(screen.getByText('desc')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /web/ })).toHaveAttribute(
            'href',
            'https://example.com',
        );
    });

    it('renders the nested actions list with the decoded sub-actions', () => {
        const action = buildAction({
            inputData: {
                function: 'createProposal',
                contract: 'TokenPlugin',
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
                    {
                        type: 'Bar',
                        from: '0x0',
                        to: '0x2',
                        data: '0x',
                        value: '0',
                        inputData: null,
                    },
                ],
            },
        });

        render(createTestComponent({ action }));

        expect(screen.getByTestId('nested-actions-list')).toHaveTextContent(
            'nested-count:2',
        );
    });
});
