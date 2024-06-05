import { render, screen } from '@testing-library/react';
import { NavigationProcess, type INavigationProcessProps } from './navigationProcess';

describe('<NavigationProcess /> component', () => {
    const createTestComponent = (props?: Partial<INavigationProcessProps>) => {
        const completeProps: INavigationProcessProps = { ...props };

        return <NavigationProcess {...completeProps} />;
    };

    it('renders the process title and subtitle', () => {
        render(createTestComponent());
        expect(screen.getByText('Title')).toBeInTheDocument();
        expect(screen.getByText('Subtitle')).toBeInTheDocument();
    });
});
