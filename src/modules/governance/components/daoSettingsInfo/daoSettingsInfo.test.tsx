import * as DaoService from '@/shared/api/daoService';
import { generateDao, generateReactQueryResultSuccess } from '@/shared/testUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { OdsModulesProvider } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { DaoSettingsInfo } from './daoSettingsInfo';

jest.mock('@aragon/ods', () => ({
    ...jest.requireActual('@aragon/ods'),
    DaoAvatar: (props: { src: string }) => <div data-testid="dao-avatar-mock" data-src={props.src} />,
}));

describe('<DaoSettingsInfo /> component', () => {
    const useDaoSpy = jest.spyOn(DaoService, 'useDao');

    beforeEach(() => {
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao() }));
    });

    afterEach(() => {
        useDaoSpy.mockReset();
    });

    const createTestComponent = (props: { daoId?: string } = {}) => {
        const { daoId = 'test-id' } = props;

        return (
            <OdsModulesProvider>
                <DaoSettingsInfo daoId={daoId} />
            </OdsModulesProvider>
        );
    };

    it('renders the dao avatar and name', () => {
        const daoAvatarCid = 'ipfs://avatar-cid';
        const dao = generateDao({ avatar: daoAvatarCid, name: 'MyDao' });
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));
        render(createTestComponent());
        const daoAvatar = screen.getByTestId('dao-avatar-mock');
        expect(daoAvatar).toBeInTheDocument();
        expect(daoAvatar.dataset.src).toEqual(ipfsUtils.cidToSrc(dao.avatar));
        expect(screen.getByText(dao.name)).toBeInTheDocument();
    });

    it('renders the correct terms', () => {
        render(createTestComponent());
        expect(screen.getByText('app.governance.daoSettingsPage.main.daoSettingsInfo.name')).toBeInTheDocument();
        expect(screen.getByText('app.governance.daoSettingsPage.main.daoSettingsInfo.blockchain')).toBeInTheDocument();
        expect(screen.getByText('app.governance.daoSettingsPage.main.daoSettingsInfo.ens')).toBeInTheDocument();
        expect(screen.getByText('app.governance.daoSettingsPage.main.daoSettingsInfo.summary')).toBeInTheDocument();
    });

    it('renders the links term if links are present', () => {
        const dao = generateDao({ links: [{ name: 'link', url: 'link' }] });
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));
        render(createTestComponent());
        expect(screen.getByText('app.governance.daoSettingsPage.main.daoSettingsInfo.links')).toBeInTheDocument();
    });

    it('renders the correct definition values of the dao', () => {
        const dao = generateDao({
            name: 'Some DAO',
            network: DaoService.Network.ETHEREUM_MAINNET,
            address: '0x123',
            subdomain: 'somedao.eth',
            description: 'This is a test DAO.',
            links: [{ name: 'Test Link', url: 'https://testlink.com' }],
        });
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));
        render(createTestComponent());

        expect(screen.getByText('Some DAO')).toBeInTheDocument();
        expect(screen.getByText('Ethereum Mainnet')).toBeInTheDocument();
        expect(screen.getByText('somedao.eth')).toBeInTheDocument();
        expect(screen.getByText('This is a test DAO.')).toBeInTheDocument();
        expect(screen.getByText('Test Link')).toBeInTheDocument();
        expect(screen.getByText('https://testlink.com')).toBeInTheDocument();
    });
});
