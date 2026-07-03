import type * as GovUiKit from '@aragon/gov-ui-kit';
import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import * as featureFlagsProvider from '@/shared/components/featureFlagsProvider';
import { generateDao } from '@/shared/testUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { DaoSettingsInfo, type IDaoSettingsInfoProps } from './daoSettingsInfo';

jest.mock('@aragon/gov-ui-kit', () => ({
    ...jest.requireActual<typeof GovUiKit>('@aragon/gov-ui-kit'),
    DaoAvatar: (props: { src: string }) => (
        <div data-src={props.src} data-testid="dao-avatar-mock" />
    ),
}));

describe('<DaoSettingsInfo /> component', () => {
    const useFeatureFlagsSpy = jest.spyOn(
        featureFlagsProvider,
        'useFeatureFlags',
    );

    const setPermissionsPageEnabled = (enabled: boolean) => {
        useFeatureFlagsSpy.mockReturnValue({
            isEnabled: (key) => key === 'permissionsPage' && enabled,
        } as ReturnType<typeof featureFlagsProvider.useFeatureFlags>);
    };

    beforeEach(() => {
        setPermissionsPageEnabled(true);
    });

    afterEach(() => {
        useFeatureFlagsSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IDaoSettingsInfoProps>) => {
        const completeProps: IDaoSettingsInfoProps = {
            dao: generateDao(),
            ...props,
        };

        return (
            <GukModulesProvider>
                <DaoSettingsInfo {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the dao avatar and name', () => {
        const daoAvatarCid = 'ipfs://avatar-cid';
        const dao = generateDao({ avatar: daoAvatarCid, name: 'MyDao' });
        render(createTestComponent({ dao }));
        const daoAvatar = screen.getByTestId('dao-avatar-mock');
        expect(daoAvatar).toBeInTheDocument();
        expect(daoAvatar.dataset.src).toEqual(ipfsUtils.cidToSrc(dao.avatar));
        expect(screen.getByText(dao.name)).toBeInTheDocument();
    });

    it('renders the correct terms', () => {
        render(createTestComponent());
        expect(screen.getByText(/daoSettingsInfo.name/)).toBeInTheDocument();
        expect(screen.getByText(/daoSettingsInfo.chain/)).toBeInTheDocument();
        expect(screen.getByText(/daoSettingsInfo.summary/)).toBeInTheDocument();
    });

    it('renders the ens term and value if present', () => {
        const dao = generateDao({ ens: 'mydaoname.dao.eth' });
        render(createTestComponent({ dao }));

        expect(screen.getByText(/daoSettingsInfo.ens/)).toBeInTheDocument();
        expect(screen.getByText('mydaoname.dao.eth')).toBeInTheDocument();
    });

    it('renders the links term if links are present', () => {
        const dao = generateDao({ links: [{ name: 'link', url: 'link' }] });
        render(createTestComponent({ dao }));
        expect(screen.getByText(/daoSettingsInfo.links/)).toBeInTheDocument();
    });

    it('renders the permissions link to the permissions page', () => {
        const dao = generateDao({
            address: '0x123',
            ens: 'somedao.dao.eth',
            network: Network.ETHEREUM_MAINNET,
        });
        render(createTestComponent({ dao }));

        expect(
            screen.getByText(/daoSettingsInfo.permissionsLink/),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('link', {
                name: /daoSettingsInfo.permissionsLink/,
            }),
        ).toHaveAttribute(
            'href',
            '/dao/ethereum-mainnet/somedao.dao.eth/settings/permissions',
        );
    });

    it('does not render the permissions link when the flag is disabled', () => {
        setPermissionsPageEnabled(false);
        render(createTestComponent());

        expect(
            screen.queryByText(/daoSettingsInfo.permissionsLink/),
        ).not.toBeInTheDocument();
    });

    it('renders the correct definition values of the dao', () => {
        const dao = generateDao({
            name: 'Some DAO',
            network: Network.ETHEREUM_MAINNET,
            address: '0x123',
            ens: 'somedao.dao.eth',
            description: 'This is a test DAO.',
            links: [{ name: 'Test Link', url: 'https://testlink.com' }],
        });
        render(createTestComponent({ dao }));

        expect(screen.getByText('Some DAO')).toBeInTheDocument();
        expect(screen.getByText('Ethereum')).toBeInTheDocument();
        expect(screen.getByText('somedao.dao.eth')).toBeInTheDocument();
        expect(screen.getByText('This is a test DAO.')).toBeInTheDocument();
        expect(screen.getByText('Test Link')).toBeInTheDocument();
        expect(screen.getByText('https://testlink.com')).toBeInTheDocument();
    });
});
