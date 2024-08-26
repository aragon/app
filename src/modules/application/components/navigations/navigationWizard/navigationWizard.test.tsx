import { render, screen } from '@testing-library/react';
import { NavigationWizard, type INavigationWizardProps } from './navigationWizard';

describe('<NavigationWizard /> component', () => {
    const createTestComponent = (props?: Partial<INavigationWizardProps>) => {
        const completeProps: INavigationWizardProps = { id: 'test-id', ...props };

        return <NavigationWizard {...completeProps} />;
    };

    it('renders the process title and subtitle of the wizard', () => {
        render(createTestComponent());
        expect(screen.getByText('Title')).toBeInTheDocument();
        expect(screen.getByText('Subtitle')).toBeInTheDocument();
    });
});
