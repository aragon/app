import { render, screen } from '@testing-library/react';
import { NavigationContainer, type INavigationContainerProps } from './navigationContainer';

describe('<Navigation.Container /> component', () => {
    const createTestComponent = (props?: Partial<INavigationContainerProps>) => {
        const completeProps: INavigationContainerProps = { ...props };

        return <NavigationContainer {...completeProps} />;
    };

    it('renders the children property', () => {
        const children = 'navigation-children';
        render(createTestComponent({ children }));
        expect(screen.getByText(children)).toBeInTheDocument();
    });
});
