import { navigationDaoLinks } from '@/modules/application/components/navigations/navigationDao/navigationDaoLinks';
import { generateDao } from '@/shared/testUtils';
import { daoUtils } from '@/shared/utils/daoUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { testLogger } from '@/test/utils';
import type * as GovUiKit from '@aragon/gov-ui-kit';
import { GukModulesProvider, IconType, addressUtils } from '@aragon/gov-ui-kit';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { Route } from 'next';
import * as NextNavigation from 'next/navigation';
import { NavigationDialog, type INavigationDialogProps } from './navigationDialog';

jest.mock('@aragon/gov-ui-kit', () => ({
    ...jest.requireActual<typeof GovUiKit>('@aragon/gov-ui-kit'),
    DaoAvatar: (props: GovUiKit.IDaoAvatarProps) => (
        <div data-testid="dao-avatar-mock" data-src={props.src} data-name={props.name} />
    ),
    Icon: (props: GovUiKit.IIconProps) => <div data-testid={`icon-${props.icon}`} />,
}));

describe('<NavigationDialog /> component', () => {
    const usePathnameSpy = jest.spyOn(NextNavigation, 'usePathname');
    const cidToSrcSpy = jest.spyOn(ipfsUtils, 'cidToSrc');
    const getDaoEnsSpy = jest.spyOn(daoUtils, 'getDaoEns');

    beforeEach(() => {
        usePathnameSpy.mockReturnValue('');
        cidToSrcSpy.mockReturnValue('http://avatar-url');
        getDaoEnsSpy.mockReturnValue(undefined);
    });

    afterEach(() => {
        usePathnameSpy.mockReset();
        cidToSrcSpy.mockReset();
        getDaoEnsSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<INavigationDialogProps<string>>) => {
        const completeProps: INavigationDialogProps<string> = {
            links: [],
            dao: generateDao(),
            open: true,
            onOpenChange: jest.fn(),
            ...props,
        };
        return (
            <GukModulesProvider>
                <NavigationDialog {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the children when open', () => {
        render(createTestComponent({ children: 'test-children', open: true }));
        expect(screen.getByText('test-children')).toBeInTheDocument();
    });

    it('does not render anything when closed', () => {
        render(createTestComponent({ children: 'closed-dialog', open: false }));
        expect(screen.queryByText('closed-dialog')).not.toBeInTheDocument();
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('renders the defined links', () => {
        const links = [{ link: '/test' as Route, label: 'testLink', icon: IconType.APP_ASSETS }];
        render(createTestComponent({ links, open: true }));
        expect(screen.getByRole('link', { name: links[0].label })).toBeInTheDocument();
    });

    it('closes the dialog on link click', async () => {
        testLogger.suppressErrors(); // suppress navigation not implemented error
        const onOpenChange = jest.fn();
        const links = [{ link: '/link' as Route, label: 'link', icon: IconType.APP_ASSETS }];
        render(createTestComponent({ links, open: true, onOpenChange }));
        await userEvent.click(screen.getByRole('link', { name: links[0].label }));
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('renders DAO avatar, name and truncated address when no ENS', () => {
        const dao = generateDao({
            avatar: 'ipfs://cid',
            name: 'MyDAO',
            address: '0x1234567890123456789012345678901234567890',
            subdomain: null,
        });

        cidToSrcSpy.mockReturnValue('http://avatar-url');
        getDaoEnsSpy.mockReturnValue(undefined);

        const links = navigationDaoLinks(dao);
        render(createTestComponent({ dao, links, open: true }));

        const dlg = screen.getByRole('dialog');
        const w = within(dlg);

        const avatar = w.getByTestId('dao-avatar-mock');
        expect(avatar).toHaveAttribute('data-src', 'http://avatar-url');
        expect(avatar).toHaveAttribute('data-name', 'MyDAO');

        expect(w.getByText('MyDAO')).toBeInTheDocument();
        expect(w.getByText(addressUtils.truncateAddress(dao.address))).toBeInTheDocument();
    });

    it('renders the "Explore all DAOs" link with icon', () => {
        render(createTestComponent({ open: true }));
        const dlg = screen.getByRole('dialog');
        const w = within(dlg);

        const explore = w.getByRole('link', { name: /Explore all DAOs/ });
        expect(explore).toHaveAttribute('href', '/');
        expect(w.getByTestId(`icon-${IconType.APP_EXPLORE}`)).toBeInTheDocument();
    });

    it('does not crash when onOpenChange property is not defined', async () => {
        testLogger.suppressErrors(); // suppress navigation not implemented error
        const links = [{ link: '/link' as Route, label: 'link', icon: IconType.APP_ASSETS }];
        render(createTestComponent({ links, open: true, onOpenChange: undefined }));
        await userEvent.click(screen.getByRole('link', { name: links[0].label }));
        expect(screen.getByTestId('dao-avatar-mock')).toBeInTheDocument();
    });
});
