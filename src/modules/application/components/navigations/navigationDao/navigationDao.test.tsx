import * as DaoService from '@/shared/api/daoService';
import * as useDialogContext from '@/shared/components/dialogProvider';
import {
    generateDao,
    generateDialogContext,
    generateReactQueryResultError,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import { daoUtils } from '@/shared/utils/daoUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { GukModulesProvider, IconType, addressUtils, clipboardUtils, type ICompositeAddress } from '@aragon/gov-ui-kit';
import type * as GovUiKit from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as NextNavigation from 'next/navigation';
import * as wagmi from 'wagmi';
import { ApplicationDialogId } from '../../../constants/applicationDialogId';
import { NavigationDao, type INavigationDaoProps } from './navigationDao';
import { navigationDaoLinks } from './navigationDaoLinks';

jest.mock('@aragon/gov-ui-kit', () => ({
    ...jest.requireActual<typeof GovUiKit>('@aragon/gov-ui-kit'),
    DaoAvatar: (props: { src: string }) => <div data-testid="dao-avatar-mock" data-src={props.src} />,
    Wallet: (props: { user?: ICompositeAddress; onClick: () => void }) => (
        <button onClick={props.onClick}>{props.user ? props.user.address : 'connect-mock'}</button>
    ),
}));

jest.mock('../navigation/navigationTrigger', () => ({
    NavigationTrigger: (props: { onClick: () => void; className: string }) => (
        <button data-testid="nav-trigger-mock" onClick={props.onClick} className={props.className} />
    ),
}));

describe('<NavigationDao /> component', () => {
    const useDaoSpy = jest.spyOn(DaoService, 'useDao');
    const cidToSrcSpy = jest.spyOn(ipfsUtils, 'cidToSrc');
    const copySpy = jest.spyOn(clipboardUtils, 'copy');
    const hasSupportedPluginsSpy = jest.spyOn(daoUtils, 'hasSupportedPlugins');
    const usePathnameSpy = jest.spyOn(NextNavigation, 'usePathname');
    const useDialogContextSpy = jest.spyOn(useDialogContext, 'useDialogContext');
    const useAccountSpy = jest.spyOn(wagmi, 'useAccount');

    beforeEach(() => {
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao() }));
        usePathnameSpy.mockReturnValue('');
        useAccountSpy.mockReturnValue({} as wagmi.UseAccountReturnType);
        useDialogContextSpy.mockReturnValue(generateDialogContext());
    });

    afterEach(() => {
        useDaoSpy.mockReset();
        cidToSrcSpy.mockReset();
        hasSupportedPluginsSpy.mockReset();
        useDialogContextSpy.mockReset();
        useAccountSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<INavigationDaoProps>) => {
        const completeProps: INavigationDaoProps = {
            id: 'test-dao',
            ...props,
        };

        return (
            <GukModulesProvider>
                <NavigationDao {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the dao avatar and name', () => {
        const dao = generateDao({ avatar: 'ipfs://avatar-cid', name: 'MyDao' });
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));
        cidToSrcSpy.mockReturnValue(dao.avatar!);
        render(createTestComponent());
        const daoAvatar = screen.getByTestId('dao-avatar-mock');
        expect(daoAvatar).toBeInTheDocument();
        expect(daoAvatar.dataset.src).toEqual(dao.avatar);
        expect(screen.getByText(dao.name)).toBeInTheDocument();
    });

    it('renders the DAO links for the current DAO on desktop devices', () => {
        hasSupportedPluginsSpy.mockReturnValue(true);
        const dao = generateDao({ id: 'test' });
        const daoLinks = navigationDaoLinks(dao);
        render(createTestComponent({ id: dao.id }));
        daoLinks.forEach((link) => expect(screen.getByRole('link', { name: link.label })).toBeInTheDocument());
        // eslint-disable-next-line testing-library/no-node-access
        expect(screen.getByRole('link', { name: daoLinks[0].label }).parentElement?.className).toContain(
            'hidden md:flex',
        );
    });

    it('hides the members and proposals links when DAO has no supported plugin', () => {
        hasSupportedPluginsSpy.mockReturnValue(false);
        render(createTestComponent({ id: 'test' }));
        expect(screen.queryByRole('link', { name: /navigationDao.link.members/ })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /navigationDao.link.proposals/ })).not.toBeInTheDocument();
    });

    it('renders a button to open the navigation dialog on mobile devices', async () => {
        render(createTestComponent());
        const triggerButton = screen.getByTestId('nav-trigger-mock');
        expect(triggerButton).toBeInTheDocument();
        expect(triggerButton.className).toContain('md:hidden');
        await userEvent.click(triggerButton);
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('renders the dao information on the navigation dialog', async () => {
        const dao = generateDao({ name: 'dao name', subdomain: 'my-dao' });
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));
        render(createTestComponent());
        await userEvent.click(screen.getByTestId('nav-trigger-mock'));

        const withinDialog = within(screen.getByRole('dialog'));
        expect(withinDialog.getByTestId('dao-avatar-mock')).toBeInTheDocument();
        expect(withinDialog.getByText(dao.name)).toBeInTheDocument();
        expect(withinDialog.getByText(daoUtils.getDaoEns(dao)!)).toBeInTheDocument();
    });

    it('renders the truncated address on the navigation dialog when dao has no ENS', async () => {
        const dao = generateDao({ address: '0xDafBD7d63CEe88d73a51592b42f27f7FD6ab7722', subdomain: null });
        const truncatedAddress = addressUtils.truncateAddress(dao.address);
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));
        render(createTestComponent());
        await userEvent.click(screen.getByTestId('nav-trigger-mock'));
        expect(screen.getByText(truncatedAddress)).toBeInTheDocument();
    });

    it('renders a copy button to copy the DAO address on the navigation dialog', async () => {
        const dao = generateDao({ address: '0x1234' });
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));
        render(createTestComponent());
        await userEvent.click(screen.getByTestId('nav-trigger-mock'));

        const copyButton = screen.getByTestId(IconType.COPY);
        expect(copyButton).toBeInTheDocument();

        await userEvent.click(copyButton);
        expect(copySpy).toHaveBeenCalledWith(dao.address);
    });

    it('renders a explore button to navigate to the explore page on the navigation dialog', async () => {
        render(createTestComponent());
        await userEvent.click(screen.getByTestId('nav-trigger-mock'));

        const exploreButton = screen
            .getAllByRole<HTMLAnchorElement>('link')
            .find((link) => within(link).queryByTestId(IconType.APP_EXPLORE))!;
        expect(exploreButton).toBeInTheDocument();
        expect(exploreButton.href).toEqual('http://localhost/');
    });

    it('returns empty container when dao cannot be fetched', () => {
        useDaoSpy.mockReturnValue(generateReactQueryResultError({ error: new Error() }));
        const { container } = render(createTestComponent());
        expect(container).toBeEmptyDOMElement();
    });

    it('renders a connect button opening the connect-wallet dialog', async () => {
        const open = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ open }));
        render(createTestComponent());
        const button = screen.getByRole('button', { name: 'connect-mock' });
        expect(button).toBeInTheDocument();
        await userEvent.click(button);
        expect(open).toHaveBeenCalledWith(ApplicationDialogId.CONNECT_WALLET);
    });

    it('renders the user avatar on a button opening the user dialog', async () => {
        const open = jest.fn();
        useDialogContextSpy.mockReturnValue(generateDialogContext({ open }));
        const address = '0x097d5e2325C2a98d3Adb0FE771ef66584698c59e';
        useAccountSpy.mockReturnValue({ address, isConnected: true } as unknown as wagmi.UseAccountReturnType);
        render(createTestComponent());
        const button = screen.getByText(address);
        expect(button).toBeInTheDocument();
        await userEvent.click(button);
        expect(open).toHaveBeenCalledWith(ApplicationDialogId.USER);
    });
});
