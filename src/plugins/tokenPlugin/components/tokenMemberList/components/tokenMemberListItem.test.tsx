import {
    generateTokenMember,
    generateTokenMemberMetrics,
    generateTokenPluginSettings,
    generateTokenPluginSettingsToken,
} from '@/plugins/tokenPlugin/testUtils';
import * as daoService from '@/shared/api/daoService';
import { Network } from '@/shared/api/daoService';
import { generateDao, generateDaoPlugin, generateReactQueryResultSuccess } from '@/shared/testUtils';
import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { TokenMemberListItem, type ITokenMemberListItemProps } from './tokenMemberListItem';

describe('<TokenMemberListItem /> component', () => {
    const useDaoSpy = jest.spyOn(daoService, 'useDao');

    beforeEach(() => {
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao() }));
    });

    afterEach(() => {
        useDaoSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<ITokenMemberListItemProps>) => {
        const completeProps: ITokenMemberListItemProps = {
            member: generateTokenMember(),
            daoId: 'test-dao-id',
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
        const token = generateTokenPluginSettingsToken({ decimals: 6 });
        const pluginSettings = generateTokenPluginSettings({ token });
        const member = generateTokenMember({ votingPower: '47928374987234' });
        const plugin = generateDaoPlugin({ settings: pluginSettings });
        const daoAddress = '0x123';
        const daoNetwork = Network.ETHEREUM_SEPOLIA;
        const dao = generateDao({ address: daoAddress, network: daoNetwork });
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));

        render(createTestComponent({ member, plugin }));
        expect(screen.getByRole('heading', { name: /47.93M Voting Power/ })).toBeInTheDocument();
        expect(screen.getByRole('link').getAttribute('href')).toEqual(
            `/dao/${daoNetwork}/${daoAddress}/members/${member.address}`,
        );
    });
});
