import { DataList, OdsModulesProvider } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { generateTokenProposal } from '../../testUtils';
import { type ITokenProposalListItemProps, TokenProposalListItem } from './tokenProposalListItem';

describe('<TokenProposalListItem /> component', () => {
    const createTestComponent = (props?: Partial<ITokenProposalListItemProps>) => {
        const completeProps: ITokenProposalListItemProps = {
            proposal: generateTokenProposal(),
            daoId: 'dao-id',
            ...props,
        };

        return (
            <OdsModulesProvider>
                <DataList.Root entityLabel="">
                    <TokenProposalListItem {...completeProps} />
                </DataList.Root>
            </OdsModulesProvider>
        );
    };

    it('renders the token proposal', () => {
        const proposal = generateTokenProposal();
        render(createTestComponent({ proposal }));
        expect(screen.getByText(proposal.title)).toBeInTheDocument();
    });

    it('sets the correct link for proposal page', () => {
        const proposal = generateTokenProposal({ id: 'proposal-id' });
        const daoId = 'dao-id';
        render(createTestComponent({ proposal }));
        expect(screen.getAllByRole('link')[0].getAttribute('href')).toEqual(`/dao/${daoId}/proposals/${proposal.id}`);
    });
});
