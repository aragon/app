import { render, screen } from '@testing-library/react';
import { TokenMembersPageDetails, type ITokenMembersPageDetailsProps } from './tokenMembersPageDetails';

describe('<TokenMembersPageDetails /> component', () => {
    const createTestComponent = (props?: Partial<ITokenMembersPageDetailsProps>) => {
        const completeProps: ITokenMembersPageDetailsProps = { ...props };

        return <TokenMembersPageDetails {...completeProps} />;
    };

    it('renders info regarding the eligible members', () => {
        render(createTestComponent());
        expect(screen.getByText(/tokenMembersPageDetails.eligibleMembers/)).toBeInTheDocument();
        expect(screen.getByText(/tokenMembersPageDetails.members/)).toBeInTheDocument();
    });
});
