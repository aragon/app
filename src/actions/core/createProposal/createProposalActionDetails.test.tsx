import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import type { ICoreActionCreateProposal } from '../types/coreActionCreateProposal';
import { CoreActionType } from '../types/enum/coreActionType';
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
        overrides?: Partial<IProposalActionData<ICoreActionCreateProposal>>,
    ): IProposalActionData<ICoreActionCreateProposal> => ({
        type: CoreActionType.CREATE_PROPOSAL,
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

    it('renders the resolved metadata fields and nested actions when both are present', () => {
        const action = buildAction({
            inputData: {
                function: 'createProposal',
                contract: 'TokenPlugin',
                parameters: [],
                proposalMetadata: {
                    title: 'My DAO',
                    summary: 'short summary',
                    description: 'desc',
                    resources: [{ name: 'web', url: 'https://example.com' }],
                },
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

        expect(screen.getByText('My DAO')).toBeInTheDocument();
        expect(screen.getByText('short summary')).toBeInTheDocument();
        expect(screen.getByText('desc')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /web/ })).toHaveAttribute(
            'href',
            'https://example.com',
        );
        expect(screen.getByTestId('nested-actions-list')).toHaveTextContent(
            'nested-count:2',
        );
    });

    it('omits the metadata block when proposalMetadata is missing and still renders the nested actions list', () => {
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
                ],
            },
        });

        render(createTestComponent({ action }));

        expect(screen.queryByText('My DAO')).not.toBeInTheDocument();
        expect(screen.queryByText('short summary')).not.toBeInTheDocument();
        expect(screen.getByTestId('nested-actions-list')).toHaveTextContent(
            'nested-count:1',
        );
    });
});
