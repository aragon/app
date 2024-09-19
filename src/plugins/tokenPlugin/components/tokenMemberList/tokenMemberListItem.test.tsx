import { generateToken } from '@/modules/finance/testUtils';
import * as daoService from '@/shared/api/daoService';
import { generateReactQueryResultError, generateReactQueryResultSuccess } from '@/shared/testUtils';
import { OdsModulesProvider } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { generateDaoTokenSettings, generateTokenMember, generateTokenMemberMetrics } from '../../testUtils';
import { TokenMemberListItem, type ITokenMemberListItemProps } from './tokenMemberListItem';

describe('<TokenMemberListItem /> component', () => {
    const useDaoSettingsSpy = jest.spyOn(daoService, 'useDaoSettings');

    beforeEach(() => {
        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDaoTokenSettings() }));
    });

    afterEach(() => {
        useDaoSettingsSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<ITokenMemberListItemProps>) => {
        const completeProps: ITokenMemberListItemProps = {
            member: generateTokenMember(),
            daoId: 'test-id',
            ...props,
        };

        return (
            <OdsModulesProvider>
                <TokenMemberListItem {...completeProps} />
            </OdsModulesProvider>
        );
    };

    it('renders the token member', () => {
        const member = generateTokenMember({ ens: 'tttt.eth', address: '0x123' });
        render(createTestComponent({ member }));
        expect(screen.getByText(member.ens!)).toBeInTheDocument();
    });

    it('renders the token member with correct delegation count', () => {
        const member = generateTokenMember({
            ens: 'tttt.eth',
            address: '0x123',
            metrics: generateTokenMemberMetrics({ delegateReceivedCount: 5 }),
        });
        render(createTestComponent({ member }));
        expect(screen.getByText(member.ens!)).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('Delegations')).toBeInTheDocument();
    });

    it('fetches the DAO settings to parse the member voting power using the decimals of the governance token', () => {
        const daoId = 'test-dao-id';
        const token = generateToken({ decimals: 6 });
        const daoTokenSettings = generateDaoTokenSettings({ token });
        const member = generateTokenMember({ votingPower: '47928374987234' });
        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultSuccess({ data: daoTokenSettings }));
        render(createTestComponent({ daoId, member }));

        expect(useDaoSettingsSpy).toHaveBeenCalledWith({ urlParams: { daoId } });
        expect(screen.getByRole('heading', { name: /47.93M Voting Power/ })).toBeInTheDocument();
    });

    it('falls back to 0 decimals when DAO settings cannot be fetched', () => {
        useDaoSettingsSpy.mockReturnValue(generateReactQueryResultError({ error: new Error() }));
        const member = generateTokenMember({ votingPower: '123456' });
        render(createTestComponent({ member }));
        expect(screen.getByRole('heading', { name: /123.46K Voting Power/ })).toBeInTheDocument();
    });
});
