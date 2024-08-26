import { render, screen } from '@testing-library/react';
import { NavigationWizard, type INavigationProcessProps } from './navigationWizard';

describe('<NavigationWizard /> component', () => {
    const createTestComponent = (props?: Partial<INavigationProcessProps>) => {
        const completeProps: INavigationProcessProps = { ...props };

        return <NavigationWizard {...completeProps} />;
    };

    it('renders the process title and subtitle', () => {
        render(createTestComponent());
        expect(screen.getByText('Title')).toBeInTheDocument();
        expect(screen.getByText('Subtitle')).toBeInTheDocument();
    });
});
