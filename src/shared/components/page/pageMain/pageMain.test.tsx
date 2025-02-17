import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { PageMain, type IPageMainProps } from './pageMain';

describe('<Page.Main /> component', () => {
    const createTestComponent = (props?: Partial<IPageMainProps>) => {
        const completeProps: IPageMainProps = { ...props };

        return <PageMain {...completeProps} />;
    };

    it('renders the children property', () => {
        const children = 'test-children';
        render(createTestComponent({ children }));
        expect(screen.getByText(children)).toBeInTheDocument();
    });

    it('renders the title when defined', () => {
        const title = 'page title';
        render(createTestComponent({ title }));
        expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    });

    it('renders the action when title and action properties are defined', async () => {
        const title = 'test-title';
        const action = { label: 'action', onClick: jest.fn() };
        render(createTestComponent({ title, action }));
        const actionButton = screen.getByRole('button', { name: action.label });
        expect(actionButton).toBeInTheDocument();

        await userEvent.click(actionButton);
        expect(action.onClick).toHaveBeenCalled();
    });

    it('does not render the action when hidden property is set to true', () => {
        const action = { label: 'hidden-action', onClick: jest.fn(), hidden: true };
        render(createTestComponent({ action }));
        expect(screen.queryByRole('button', { name: action.label })).not.toBeInTheDocument();
    });
});
