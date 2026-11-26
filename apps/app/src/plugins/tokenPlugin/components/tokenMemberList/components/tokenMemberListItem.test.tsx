import {
    AddressResolutionProvider,
    addressEntryKey,
    GukModulesProvider,
} from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import * as ensModule from '@/modules/ens';
import {
    generateTokenPluginSettings,
    generateTokenPluginSettingsToken,
    generateTokenVotingMember,
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
            member: generateTokenVotingMember(),
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

    // The row names the member through the address book, which holds ENS names with the Aragon registry suffix
    // already stripped (see `resolveAddress`).
    const memberAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    const renderWithName = (label: string) =>
        render(
            <AddressResolutionProvider
                entries={
                    new Map([
                        [
                            addressEntryKey(memberAddress, 0),
                            { label, source: 'ens' as const },
                        ],
                    ])
                }
            >
                {createTestComponent({
                    member: generateTokenVotingMember({
                        address: memberAddress,
                    }),
                })}
            </AddressResolutionProvider>,
        );

    it('renders the token member with the name of its address', () => {
        renderWithName('tttt.eth');
        expect(screen.getByText('tttt.eth')).toBeInTheDocument();
    });

    it('never shows the full aragon name read for the avatar', () => {
        useEnsNameSpy.mockReturnValue({
            data: 'alice.aragon.eth',
            isLoading: false,
        } as ReturnType<typeof ensModule.useEnsName>);
        renderWithName('alice');
        expect(screen.getByText('alice')).toBeInTheDocument();
        expect(screen.queryByText('alice.aragon.eth')).not.toBeInTheDocument();
    });

    it('retrieves the plugin settings to parse the member voting power using the decimals of the governance token', () => {
        const token = generateTokenPluginSettingsToken({ decimals: 6 });
        const pluginSettings = generateTokenPluginSettings({ token });
        const member = generateTokenVotingMember({
            votingPower: '47928374987234',
        });
        const plugin = generateDaoPlugin({ settings: pluginSettings });
        const daoAddress = '0x123';
        const daoNetwork = Network.ETHEREUM_SEPOLIA;
        const dao = generateDao({ address: daoAddress, network: daoNetwork });
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: dao }),
        );

        render(
            createTestComponent({
                member,
                plugin,
                memberSourceId: 'safe/body',
            }),
        );
        expect(
            screen.getByRole('heading', { name: /47.93M Voting Power/ }),
        ).toBeInTheDocument();
        expect(screen.getByRole('link').getAttribute('href')).toEqual(
            `/dao/${daoNetwork}/${daoAddress}/members/${member.address}?members=safe%2Fbody`,
        );
    });
});
