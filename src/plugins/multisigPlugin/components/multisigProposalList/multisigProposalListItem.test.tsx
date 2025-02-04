import { generateDaoPlugin } from '@/shared/testUtils';
import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { generateMultisigProposal } from '../../testUtils';
import { type IMultisigProposalListItemProps, MultisigProposalListItem } from './multisigProposalListItem';

describe('<MultisigProposalListItem /> component', () => {
    const createTestComponent = (props?: Partial<IMultisigProposalListItemProps>) => {
        const completeProps: IMultisigProposalListItemProps = {
            proposal: generateMultisigProposal(),
            daoId: 'dao-id',
            plugin: generateDaoPlugin(),
            ...props,
        };

        return (
            <GukModulesProvider>
                <MultisigProposalListItem {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the multisig proposal', () => {
        const proposal = generateMultisigProposal();
        render(createTestComponent({ proposal }));
        expect(screen.getByText(proposal.title)).toBeInTheDocument();
    });

    it('sets the correct link for proposal page', () => {
        const plugin = generateDaoPlugin({ slug: 'multisig' });
        const proposal = generateMultisigProposal({ incrementalId: 3 });
        const daoId = 'dao-id';
        render(createTestComponent({ plugin, proposal }));
        expect(screen.getAllByRole('link')[0].getAttribute('href')).toEqual(`/dao/${daoId}/proposals/MULTISIG-3`);
    });
});
