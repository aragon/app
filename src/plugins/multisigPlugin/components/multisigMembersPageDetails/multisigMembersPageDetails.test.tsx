import { render, screen } from '@testing-library/react';
import { MultisigMemberPageDetails, type IMultisigMembersPageDetailsProps } from './multisigMembersPageDetails';

describe('<MultisigMembersPageDetails /> component', () => {
    const createTestComponent = (props?: Partial<IMultisigMembersPageDetailsProps>) => {
        const completeProps: IMultisigMembersPageDetailsProps = { ...props };

        return <MultisigMemberPageDetails {...completeProps} />;
    };

    it('renders info regarding the eligible members', () => {
        render(createTestComponent());
        expect(screen.getByText(/multisigMembersPageDetails.eligibleMembers/)).toBeInTheDocument();
        expect(screen.getByText(/multisigMembersPageDetails.members/)).toBeInTheDocument();
    });
});
