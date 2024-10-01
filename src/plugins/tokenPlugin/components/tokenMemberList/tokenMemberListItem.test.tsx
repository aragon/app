import { generateToken } from '@/modules/finance/testUtils';
import * as usePluginSettings from '@/shared/hooks/usePluginSettings';
import { OdsModulesProvider } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { generateTokenMember, generateTokenMemberMetrics, generateTokenPluginSettings } from '../../testUtils';
import { TokenMemberListItem, type ITokenMemberListItemProps } from './tokenMemberListItem';

describe('<TokenMemberListItem /> component', () => {
    const usePluginSettingsSpy = jest.spyOn(usePluginSettings, 'usePluginSettings');

    beforeEach(() => {
        usePluginSettingsSpy.mockReturnValue(generateTokenPluginSettings());
    });

    afterEach(() => {
        usePluginSettingsSpy.mockReset();
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

    it('retrieves the plugin settings to parse the member voting power using the decimals of the governance token', () => {
        const daoId = 'test-dao-id';
        const token = generateToken({ decimals: 6 });
        const pluginSettings = generateTokenPluginSettings({ token });
        const member = generateTokenMember({ votingPower: '47928374987234' });
        usePluginSettingsSpy.mockReturnValue(pluginSettings);
        render(createTestComponent({ daoId, member }));

        expect(usePluginSettingsSpy).toHaveBeenCalledWith({ daoId });
        expect(screen.getByRole('heading', { name: /47.93M Voting Power/ })).toBeInTheDocument();
    });

    it('falls back to 0 decimals when plugin settings cannot be fetched', () => {
        usePluginSettingsSpy.mockReturnValue(undefined);
        const member = generateTokenMember({ votingPower: '123456' });
        render(createTestComponent({ member }));
        expect(screen.getByRole('heading', { name: /123.46K Voting Power/ })).toBeInTheDocument();
    });
});
