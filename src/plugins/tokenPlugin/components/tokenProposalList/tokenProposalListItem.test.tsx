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

    it('displays 100% for a single yes vote', () => {
        const currentDate = new Date();
        const futureDate = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000); // Some future date
        const futureTimestamp = Math.floor(futureDate.getTime() / 1000);

        const proposal = generateTokenProposal({
            metrics: {
                votesByOption: [
                    {
                        type: 2,
                        totalVotingPower: '5.000000001e+19',
                    },
                ],
            },
            endDate: futureTimestamp,
        });

        render(createTestComponent({ proposal }));
        expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('calculates correct percentage for multiple options', () => {
        const currentDate = new Date();
        const futureDate = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000); // Some future date
        const futureTimestamp = Math.floor(futureDate.getTime() / 1000);
        const proposal = generateTokenProposal({
            metrics: {
                votesByOption: [
                    {
                        type: 2,
                        totalVotingPower: '5.000000001e+19',
                    },
                    {
                        type: 3,
                        totalVotingPower: '2.500000001e+19',
                    },
                ],
            },
            endDate: futureTimestamp,
        });

        render(createTestComponent({ proposal }));
        // Maybe we should format this, but I expected this to happen on ODS?
        expect(screen.getByText('66.67%')).toBeInTheDocument();
    });

    it('handles zero votes correctly', () => {
        // Perhaps this is not correct as no votes would mean no winning option?
        const currentDate = new Date();
        const futureDate = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        const futureTimestamp = Math.floor(futureDate.getTime() / 1000);
        const proposal = generateTokenProposal({
            metrics: {
                votesByOption: [],
            },
            endDate: futureTimestamp,
        });

        render(createTestComponent({ proposal }));
        expect(screen.getByText('0%')).toBeInTheDocument();
    });


});
