import { IconType } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { NavigationTrigger, type INavigationTriggerProps } from './navigationTrigger';

describe('<Navigation.Trigger /> component', () => {
    const createTestComponent = (props?: Partial<INavigationTriggerProps>) => {
        const completeProps: INavigationTriggerProps = { ...props };

        return <NavigationTrigger {...completeProps} />;
    };

    it('renders a button with a menu icon', async () => {
        const onClick = jest.fn();
        render(createTestComponent({ onClick }));
        expect(screen.getByRole('button')).toBeInTheDocument();
        expect(screen.getByTestId(IconType.MENU)).toBeInTheDocument();
        await userEvent.click(screen.getByRole('button'));
        expect(onClick).toHaveBeenCalled();
    });
});
