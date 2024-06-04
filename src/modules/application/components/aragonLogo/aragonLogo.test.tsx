import { render, screen } from '@testing-library/react';
import { AragonLogo, type IAragonLogoProps } from './aragonLogo';

describe('<AragonLogo /> component', () => {
    const createTestComponent = (props?: Partial<IAragonLogoProps>) => {
        const completeProps: IAragonLogoProps = { ...props };

        return <AragonLogo {...completeProps} />;
    };

    it('renders the Aragon and AragonApp logos', () => {
        render(createTestComponent());
        expect(screen.getByRole('img', { name: 'Aragon logo' })).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'Aragon App logo' })).toBeInTheDocument();
    });
});
