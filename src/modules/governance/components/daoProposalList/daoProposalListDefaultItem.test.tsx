import * as useSlotSingleFunction from '@/shared/hooks/useSlotSingleFunction';
import { OdsModulesProvider, ProposalStatus } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { generateProposal } from '../../testUtils';
import { DaoProposalListDefaultItem, type IDaoProposalListDefaultItemProps } from './daoProposalListDefaultItem';

describe('<DaoProposalListDefaultItem /> component', () => {
    const useSlotSingleFunctionSpy = jest.spyOn(useSlotSingleFunction, 'useSlotSingleFunction');

    afterEach(() => {
        useSlotSingleFunctionSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IDaoProposalListDefaultItemProps>) => {
        const completeProps: IDaoProposalListDefaultItemProps = {
            proposal: generateProposal(),
            daoId: 'dao-test',
            ...props,
        };

        return (
            <OdsModulesProvider>
                <DaoProposalListDefaultItem {...completeProps} />
            </OdsModulesProvider>
        );
    };

    it('renders the proposal info', () => {
        const proposal = generateProposal({ title: 'my-proposal', summary: 'proposal-summary' });
        render(createTestComponent({ proposal }));
        expect(screen.getByText(proposal.title)).toBeInTheDocument();
        expect(screen.getByText(proposal.summary)).toBeInTheDocument();
    });

    it('uses the plugin slot-function to process the proposal status', () => {
        const status = ProposalStatus.EXECUTABLE;
        useSlotSingleFunctionSpy.mockReturnValue(status);
        render(createTestComponent());
        expect(screen.getByText(/Executable/)).toBeInTheDocument();
    });
});
