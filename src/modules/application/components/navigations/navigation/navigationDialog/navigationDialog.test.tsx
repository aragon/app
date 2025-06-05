import { daoUtils } from '@/shared/utils/daoUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { testLogger } from '@/test/utils';
import { GukModulesProvider, IconType } from '@aragon/gov-ui-kit';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { Route } from 'next';
import * as NextNavigation from 'next/navigation';
import { NavigationDialog, type INavigationDialogProps } from './navigationDialog';

describe('<Navigation.Dialog /> component', () => {
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
        const completeProps: INavigationDialogProps<string> = { links: [], ...props };

        return (
            <GukModulesProvider>
                <NavigationDialog {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the children component when open', () => {
        const children = 'test-children';
        render(createTestComponent({ children, open: true }));
        expect(screen.getByText(children)).toBeInTheDocument();
    });

    it('does not render children when dialog is not open', () => {
        const children = 'closed-dialog';
        render(createTestComponent({ children, open: false }));
        expect(screen.queryByText(children)).not.toBeInTheDocument();
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

    it('renders the "Explore all DAOs" link with icon', () => {
        render(createTestComponent({ open: true }));
        const dialog = screen.getByRole('dialog');
        const withinDialog = within(dialog);
        const explore = withinDialog.getByRole('link', { name: /navigationDao.dialog.explore/ });
        expect(explore).toHaveAttribute('href', '/');
        expect(withinDialog.getByTestId(IconType.APP_EXPLORE)).toBeInTheDocument();
    });

    it('does not crash when onOpenChange property is not defined', async () => {
        testLogger.suppressErrors(); // suppress navigation not implemented error
        const links = [{ link: '/link' as Route, label: 'link', icon: IconType.APP_ASSETS }];
        render(createTestComponent({ links, open: true, onOpenChange: undefined }));
        await userEvent.click(screen.getByRole('link', { name: links[0].label }));
        expect(screen.getByTestId(IconType.APP_EXPLORE)).toBeInTheDocument();
    });
});
