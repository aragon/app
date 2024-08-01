import { render, screen } from '@testing-library/react';
import { ApplicationVersion, getApplicationVersion } from './applicationVersion';

describe('getApplicationVersion', () => {
    it('should return version with environment', () => {
        process.env.version = '1.0.0';
        process.env.NEXT_PUBLIC_ENV = 'development';

        const result = getApplicationVersion();
        expect(result).toBe('v1.0.0 (DEV)');
    });

    it('should return version without environment', () => {
        process.env.version = '1.0.0';
        process.env.NEXT_PUBLIC_ENV = '';

        const result = getApplicationVersion();
        expect(result).toBe('v1.0.0');
    });

    it('should return version with unknown environment', () => {
        process.env.version = '1.0.0';
        process.env.NEXT_PUBLIC_ENV = 'unknown_env';

        const result = getApplicationVersion();
        expect(result).toBe('v1.0.0');
    });

    it('should handle missing version', () => {
        process.env.version = '';
        process.env.NEXT_PUBLIC_ENV = 'development';

        const result = getApplicationVersion();
        expect(result).toBe('v (DEV)');
    });
});

describe('<ApplicationVersion /> component', () => {
    it('should render version with environment', () => {
        process.env.version = '1.0.0';
        process.env.NEXT_PUBLIC_ENV = 'development';

        render(<ApplicationVersion />);
        expect(screen.getByText('v1.0.0 (DEV)')).toBeInTheDocument();
    });

    it('should render version without environment', () => {
        process.env.version = '1.0.0';
        process.env.NEXT_PUBLIC_ENV = '';

        render(<ApplicationVersion />);
        expect(screen.getByText('v1.0.0')).toBeInTheDocument();
    });

    it('should render version with unknown environment', () => {
        process.env.version = '1.0.0';
        process.env.NEXT_PUBLIC_ENV = 'unknown_env';

        render(<ApplicationVersion />);
        expect(screen.getByText('v1.0.0')).toBeInTheDocument();
    });

    it('should handle missing version', () => {
        process.env.version = '';
        process.env.NEXT_PUBLIC_ENV = 'development';

        render(<ApplicationVersion />);
        expect(screen.getByText('v (DEV)')).toBeInTheDocument();
    });
});
