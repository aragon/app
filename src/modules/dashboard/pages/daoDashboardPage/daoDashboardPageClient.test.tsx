import * as daoService from '@/shared/api/daoService';
import { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import {
    generateDao,
    generateDaoMetrics,
    generateReactQueryResultError,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import { daoUtils } from '@/shared/utils/daoUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import type * as GovUiKit from '@aragon/gov-ui-kit';
import { addressUtils, clipboardUtils, GukModulesProvider, IconType } from '@aragon/gov-ui-kit';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { DaoDashboardPageClient, type IDaoDashboardPageClientProps } from './daoDashboardPageClient';

jest.mock('@aragon/gov-ui-kit', () => ({
    ...jest.requireActual<typeof GovUiKit>('@aragon/gov-ui-kit'),
    DaoAvatar: (props: { src: string }) => <div data-testid="dao-avatar-mock" data-src={props.src} />,
}));

jest.mock('@/modules/governance/components/daoProposalList', () => ({
    DaoProposalList: {
        Container: (props: { children: ReactNode }) => <div data-testid="proposal-list-mock">{props.children}</div>,
    },
}));

jest.mock('@/modules/governance/components/daoMemberList', () => ({
    DaoMemberList: {
        Container: (props: { children: ReactNode }) => <div data-testid="member-list-mock">{props.children}</div>,
    },
}));

jest.mock('@/modules/finance/components/assetList', () => ({
    AssetList: (props: { children: ReactNode }) => <div data-testid="asset-list-mock">{props.children}</div>,
}));

describe('<DaoDashboardPageClient /> component', () => {
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const clipboardCopySpy = jest.spyOn(clipboardUtils, 'copy');
    const hasSupportedPluginsSpy = jest.spyOn(daoUtils, 'hasSupportedPlugins');

    beforeEach(() => {
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao() }));
    });

    afterEach(() => {
        useDaoSpy.mockReset();
        clipboardCopySpy.mockReset();
        hasSupportedPluginsSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IDaoDashboardPageClientProps>) => {
        const completeProps: IDaoDashboardPageClientProps = {
            daoId: 'dao-id',
            ...props,
        };

        return (
            <GukModulesProvider>
                <DaoDashboardPageClient {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('fetches and renders the dao name, description and avatar', () => {
        const daoId = 'test-id';
        const dao = generateDao({ name: 'Dao name', description: 'Dao description', avatar: 'ipfs://avatar-cid' });
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));
        render(createTestComponent({ daoId }));

        expect(useDaoSpy).toHaveBeenCalledWith({ urlParams: { id: daoId } });
        expect(screen.getByText(dao.name)).toBeInTheDocument();
        expect(screen.getByText(dao.description)).toBeInTheDocument();

        const daoAvatar = screen.getByTestId('dao-avatar-mock');
        expect(daoAvatar).toBeInTheDocument();
        expect(daoAvatar.dataset.src).toEqual(ipfsUtils.cidToSrc(dao.avatar));
    });

    it('returns empty container on dao fetch error', () => {
        useDaoSpy.mockReturnValue(generateReactQueryResultError({ error: new Error() }));
        const { container } = render(createTestComponent());
        expect(container).toBeEmptyDOMElement();
    });

    it('renders the formatted DAO stats', () => {
        const metrics = generateDaoMetrics({ proposalsCreated: 2342, members: 123, tvlUSD: '4729384792837.4928374' });
        const dao = generateDao({ metrics });
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));
        render(createTestComponent());

        expect(screen.getByText(/dashboardDefaultHeader.stat.proposals/)).toBeInTheDocument();
        expect(screen.getByText('2.34K')).toBeInTheDocument();

        expect(screen.getByText(/dashboardDefaultHeader.stat.members/)).toBeInTheDocument();
        expect(screen.getByText('123')).toBeInTheDocument();

        expect(screen.getByText(/dashboardDefaultHeader.stat.treasury/)).toBeInTheDocument();
        expect(screen.getByText('$4.73T')).toBeInTheDocument();
    });

    it('renders the DAO proposal list with a button to redirect to the proposals page when DAO has supported plugins', () => {
        hasSupportedPluginsSpy.mockReturnValue(true);
        const daoId = 'my-dao';
        const daoNetwork = Network.ETHEREUM_MAINNET;
        const daoAddress = '0x12345';
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: generateDao({ address: daoAddress, network: daoNetwork }) }),
        );

        render(createTestComponent({ daoId }));

        const proposalList = screen.getByTestId('proposal-list-mock');
        expect(proposalList).toBeInTheDocument();
        const proposalPageLink = within(proposalList).getByRole<HTMLAnchorElement>('link', {
            name: /daoDashboardPage.main.viewAll/,
        });
        expect(proposalPageLink).toBeInTheDocument();
        expect(proposalPageLink.href).toMatch(new RegExp(`dao/${daoNetwork}/${daoAddress}/proposals`));
    });

    it('does not render the DAO proposal list when DAO has no supported plugins', () => {
        hasSupportedPluginsSpy.mockReturnValue(false);
        render(createTestComponent());
        expect(screen.queryByTestId('proposal-list-mock')).not.toBeInTheDocument();
    });

    it('renders the DAO asset list with a button to redirect to the asset page', () => {
        const daoId = 'my-dao';
        const daoNetwork = Network.ETHEREUM_MAINNET;
        const daoAddress = '0x12345';
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: generateDao({ address: daoAddress, network: daoNetwork }) }),
        );

        render(createTestComponent({ daoId }));
        const assetList = screen.getByTestId('asset-list-mock');
        expect(assetList).toBeInTheDocument();
        const assetPageLink = within(assetList).getByRole<HTMLAnchorElement>('link', {
            name: /daoDashboardPage.main.viewAll/,
        });
        expect(assetPageLink).toBeInTheDocument();
        expect(assetPageLink.href).toMatch(new RegExp(`dao/${daoNetwork}/${daoAddress}/assets`));
    });

    it('renders the DAO member list with a button to redirect to the members page when DAO has supported plugins', () => {
        hasSupportedPluginsSpy.mockReturnValue(true);
        const daoId = 'my-dao';
        const daoNetwork = Network.ETHEREUM_MAINNET;
        const daoAddress = '0x12345';
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: generateDao({ address: daoAddress, network: daoNetwork }) }),
        );

        render(createTestComponent({ daoId }));

        const memberList = screen.getByTestId('member-list-mock');
        expect(memberList).toBeInTheDocument();
        const memberPageLink = within(memberList).getByRole<HTMLAnchorElement>('link', {
            name: /daoDashboardPage.main.viewAll/,
        });
        expect(memberPageLink).toBeInTheDocument();
        expect(memberPageLink.href).toMatch(new RegExp(`dao/${daoNetwork}/${daoAddress}/members`));
    });

    it('does not render the DAO member list when DAO has no supported plugins', () => {
        hasSupportedPluginsSpy.mockReturnValue(false);
        render(createTestComponent());
        expect(screen.queryByTestId('member-list-mock')).not.toBeInTheDocument();
    });

    it('renders the dao information', () => {
        const dao = generateDao({
            network: Network.POLYGON_MAINNET,
            address: '0xeed34C7B9B9A7B16B26125650C0f7202D4018620',
            subdomain: 'aa-dao',
            blockTimestamp: 1702526946,
            transactionHash: '0x978465132',
        });
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));
        render(createTestComponent());

        expect(screen.getByText(/daoDashboardPage.aside.details.title/)).toBeInTheDocument();
        expect(screen.getByText(/daoDashboardPage.aside.details.chain/)).toBeInTheDocument();
        expect(screen.getByText(networkDefinitions[dao.network].name)).toBeInTheDocument();

        expect(screen.getByText(/daoDashboardPage.aside.details.address/)).toBeInTheDocument();
        const daoAddressLink = screen.getByRole('link', { name: addressUtils.truncateAddress(dao.address) });
        expect(daoAddressLink).toBeInTheDocument();
        expect(daoAddressLink).toHaveAttribute('href', expect.stringMatching(dao.address));

        expect(screen.getByText(/daoDashboardPage.aside.details.ens/)).toBeInTheDocument();
        const daoEnsLink = screen.getByRole('link', { name: daoUtils.getDaoEns(dao) });
        expect(daoEnsLink).toBeInTheDocument();
        expect(daoEnsLink).toHaveAttribute('href', expect.stringMatching(dao.address));

        expect(screen.getByText(/daoDashboardPage.aside.details.launched/)).toBeInTheDocument();
        const daoCreationLink = screen.getByRole('link', { name: 'December 2023' });
        expect(daoCreationLink).toBeInTheDocument();
        expect(daoCreationLink).toHaveAttribute('href', expect.stringMatching(dao.transactionHash));
    });

    it('supports dao address and ens copy', async () => {
        const dao = generateDao({ address: '0xeed34C7B9B9A7B16B26125650C0f7202D4018620', subdomain: 'test-dao' });
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));
        render(createTestComponent());
        const clipboards = screen.getAllByTestId(IconType.COPY);
        expect(clipboards.length).toBe(2);
        await userEvent.click(clipboards[0]);
        expect(clipboardCopySpy).toHaveBeenCalledWith(dao.address);
        await userEvent.click(clipboards[1]);
        expect(clipboardCopySpy).toHaveBeenCalledWith(daoUtils.getDaoEns(dao));
    });

    it('renders the dao links', () => {
        const links = [
            { name: 'link-1', url: 'link-1-url' },
            { name: 'link-2', url: 'link-2-url' },
        ];
        const dao = generateDao({ links });
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));
        render(createTestComponent());

        links.forEach((link) => {
            const linkElement = screen.getByRole<HTMLAnchorElement>('link', { name: `${link.name} ${link.url}` });
            expect(linkElement).toBeInTheDocument();
            expect(linkElement.href).toMatch(link.url);
        });
    });
});
