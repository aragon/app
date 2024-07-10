import { DataList, OdsModulesProvider } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { generateMultisigProposal } from '../../testUtils';
import { type IMultisigProposalListItemProps, MultisigProposalListItem } from './multisigProposalListItem';

describe('<MultisigProposalListItem /> component', () => {
    const createTestComponent = (props?: Partial<IMultisigProposalListItemProps>) => {
        const completeProps: IMultisigProposalListItemProps = {
            proposal: generateMultisigProposal(),
            ...props,
        };

        return (
            <OdsModulesProvider>
                <DataList.Root entityLabel="">
                    <MultisigProposalListItem {...completeProps} />
                </DataList.Root>
            </OdsModulesProvider>
        );
    };

    it('renders the multisig proposal', () => {
        const proposal = generateMultisigProposal();
        render(createTestComponent({ proposal }));
        expect(screen.getByText(proposal.title)).toBeInTheDocument();
    });
});
