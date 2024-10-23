import { testLogger } from '@/test/utils';
import { IconType } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { Route } from 'next';
import * as NextNavigation from 'next/navigation';
import { NavigationDialog, type INavigationDialogProps } from './navigationDialog';

jest.mock('../../../aragonLogo', () => ({ AragonLogo: () => <div data-testid="aragon-logo-mock" /> }));
jest.mock('../../../applicationTags', () => ({ ApplicationTags: () => <div data-testid="app-tags-mock" /> }));

describe('<Navigation.Dialog /> component', () => {
    const usePathnameSpy = jest.spyOn(NextNavigation, 'usePathname');

    beforeEach(() => {
        usePathnameSpy.mockReturnValue('');
    });

    const createTestComponent = (props?: Partial<INavigationDialogProps<string>>) => {
        const completeProps: INavigationDialogProps<string> = { links: [], ...props };

        return <NavigationDialog {...completeProps} />;
    };

    it('renders the Aragon logo and app tags', () => {
        render(createTestComponent({ open: true }));
        expect(screen.getByTestId('aragon-logo-mock')).toBeInTheDocument();
        expect(screen.getByTestId('app-tags-mock')).toBeInTheDocument();
    });

    it('renders the children component when open', () => {
        const children = 'test-children';
        render(createTestComponent({ children, open: true }));
        expect(screen.getByText(children)).toBeInTheDocument();
    });

    it('does not render logo or children when dialog is not open', () => {
        const children = 'closed-dialog';
        render(createTestComponent({ children, open: false }));
        expect(screen.queryByText(children)).not.toBeInTheDocument();
        expect(screen.queryByTestId('aragon-logo-mock')).not.toBeInTheDocument();
    });

    it('renders the defined links', () => {
        const links = [{ link: '/test' as Route<string>, label: 'testLink', icon: IconType.APP_ASSETS }];
        render(createTestComponent({ links, open: true }));
        expect(screen.getByRole('link', { name: links[0].label })).toBeInTheDocument();
    });

    it('closes the dialog on link click', async () => {
        testLogger.suppressErrors(); // suppress navigation not implemented error
        const onOpenChange = jest.fn();
        const links = [{ link: '/link' as Route<string>, label: 'link', icon: IconType.APP_ASSETS }];
        render(createTestComponent({ links, open: true, onOpenChange }));
        await userEvent.click(screen.getByRole('link'));
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('does not crash when onOpenChange property is not defined', async () => {
        testLogger.suppressErrors(); // suppress navigation not implemented error
        const links = [{ link: '/link' as Route<string>, label: 'link', icon: IconType.APP_ASSETS }];
        render(createTestComponent({ links, open: true, onOpenChange: undefined }));
        await userEvent.click(screen.getByRole('link'));
        expect(screen.getByTestId('app-tags-mock')).toBeInTheDocument();
    });
});
