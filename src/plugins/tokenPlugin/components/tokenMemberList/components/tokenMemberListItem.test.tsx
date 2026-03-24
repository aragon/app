import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import * as ensModule from '@/modules/ens';
import {
    generateTokenMember,
    generateTokenPluginSettings,
    generateTokenPluginSettingsToken,
} from '@/plugins/tokenPlugin/testUtils';
import * as daoService from '@/shared/api/daoService';
import { Network } from '@/shared/api/daoService';
import {
    generateDao,
    generateDaoPlugin,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import {
    type ITokenMemberListItemProps,
    TokenMemberListItem,
} from './tokenMemberListItem';

describe('<TokenMemberListItem /> component', () => {
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const useEnsNameSpy = jest.spyOn(ensModule, 'useEnsName');
    const useEnsAvatarSpy = jest.spyOn(ensModule, 'useEnsAvatar');

    beforeEach(() => {
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: generateDao() }),
        );
        useEnsNameSpy.mockReturnValue({
            data: null,
            isLoading: false,
        } as ReturnType<typeof ensModule.useEnsName>);
        useEnsAvatarSpy.mockReturnValue({
            data: null,
            isLoading: false,
        } as ReturnType<typeof ensModule.useEnsAvatar>);
    });

    afterEach(() => {
        useDaoSpy.mockReset();
        useEnsNameSpy.mockReset();
        useEnsAvatarSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<ITokenMemberListItemProps>,
    ) => {
        const completeProps: ITokenMemberListItemProps = {
            member: generateTokenMember(),
            daoId: 'test-dao-id',
            plugin: generateDaoPlugin({
                settings: generateTokenPluginSettings(),
            }),
            ...props,
        };

        return (
            <GukModulesProvider>
                <TokenMemberListItem {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the token member', () => {
        const ensName = 'tttt.eth';
        const member = generateTokenMember({
            ens: 'tttt.eth',
            address: '0x123',
        });
        useEnsNameSpy.mockReturnValue({
            data: ensName,
            isLoading: false,
        } as ReturnType<typeof ensModule.useEnsName>);
        render(createTestComponent({ member }));
        expect(screen.getByText(ensName)).toBeInTheDocument();
    });

    it('retrieves the plugin settings to parse the member voting power using the decimals of the governance token', () => {
        const token = generateTokenPluginSettingsToken({ decimals: 6 });
        const pluginSettings = generateTokenPluginSettings({ token });
        const member = generateTokenMember({ votingPower: '47928374987234' });
        const plugin = generateDaoPlugin({ settings: pluginSettings });
        const daoAddress = '0x123';
        const daoNetwork = Network.ETHEREUM_SEPOLIA;
        const dao = generateDao({ address: daoAddress, network: daoNetwork });
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: dao }),
        );

        render(createTestComponent({ member, plugin }));
        expect(
            screen.getByRole('heading', { name: /47.93M Voting Power/ }),
        ).toBeInTheDocument();
        expect(screen.getByRole('link').getAttribute('href')).toEqual(
            `/dao/${daoNetwork}/${daoAddress}/members/${member.address}`,
        );
    });
});
