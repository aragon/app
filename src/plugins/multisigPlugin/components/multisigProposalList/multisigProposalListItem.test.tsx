import { OdsModulesProvider } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { generateMultisigProposal } from '../../testUtils';
import { type IMultisigProposalListItemProps, MultisigProposalListItem } from './multisigProposalListItem';

describe('<MultisigProposalListItem /> component', () => {
    const createTestComponent = (props?: Partial<IMultisigProposalListItemProps>) => {
        const completeProps: IMultisigProposalListItemProps = {
            proposal: generateMultisigProposal(),
            daoId: 'dao-id',
            ...props,
        };

        return (
            <OdsModulesProvider>
                <MultisigProposalListItem {...completeProps} />
            </OdsModulesProvider>
        );
    };

    it('renders the multisig proposal', () => {
        const proposal = generateMultisigProposal();
        render(createTestComponent({ proposal }));
        expect(screen.getByText(proposal.title)).toBeInTheDocument();
    });

    it('sets the correct link for proposal page', () => {
        const proposal = generateMultisigProposal({ id: 'proposal-id' });
        const daoId = 'dao-id';
        render(createTestComponent({ proposal }));
        expect(screen.getAllByRole('link')[0].getAttribute('href')).toEqual(`/dao/${daoId}/proposals/${proposal.id}`);
    });
});
