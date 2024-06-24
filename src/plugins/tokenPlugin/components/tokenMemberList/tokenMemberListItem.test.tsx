import { DataList, OdsModulesProvider } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { generateTokenMember } from '../../testUtils/generators/tokenMember';
import { TokenMemberListItem, type ITokenMemberListItemProps } from './tokenMemberListItem';

describe('<TokenMemberListItem /> component', () => {
    const createTestComponent = (props?: Partial<ITokenMemberListItemProps>) => {
        const completeProps: ITokenMemberListItemProps = {
            member: generateTokenMember(),
            ...props,
        };

        return (
            <OdsModulesProvider>
                <DataList.Root entityLabel="">
                    <TokenMemberListItem {...completeProps} />
                </DataList.Root>
            </OdsModulesProvider>
        );
    };

    it('renders the token member and parses his voting power', () => {
        const member = generateTokenMember({ votingPower: '900000000000000000000', ens: 'tttt.eth', address: '0x123' });
        render(createTestComponent({ member }));
        expect(screen.getByText(member.ens!)).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /900 Voting Power/ })).toBeInTheDocument();
    });
});
