import { generateDaoPlugin } from '@/shared/testUtils';
import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import {
    generateTokenMember,
    generateTokenMemberMetrics,
    generateTokenPluginSettings,
    generateTokenPluginSettingsToken,
} from '../../testUtils';
import { TokenMemberListItem, type ITokenMemberListItemProps } from './tokenMemberListItem';

describe('<TokenMemberListItem /> component', () => {
    const createTestComponent = (props?: Partial<ITokenMemberListItemProps>) => {
        const completeProps: ITokenMemberListItemProps = {
            member: generateTokenMember(),
            daoId: 'test-id',
            plugin: generateDaoPlugin({ settings: generateTokenPluginSettings() }),
            ...props,
        };

        return (
            <GukModulesProvider>
                <TokenMemberListItem {...completeProps} />
            </GukModulesProvider>
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
        const token = generateTokenPluginSettingsToken({ decimals: 6 });
        const pluginSettings = generateTokenPluginSettings({ token });
        const member = generateTokenMember({ votingPower: '47928374987234' });
        const plugin = generateDaoPlugin({ settings: pluginSettings });
        render(createTestComponent({ daoId, member, plugin }));
        expect(screen.getByRole('heading', { name: /47.93M Voting Power/ })).toBeInTheDocument();
    });
});
