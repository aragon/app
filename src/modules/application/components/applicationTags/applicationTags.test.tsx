import { render, screen } from '@testing-library/react';
import { ApplicationTags, type IApplicationTagsProps } from './applicationTags';

describe('<ApplicationTags /> component', () => {
    const originalProcessEnv = process.env;

    const createTestComponent = (props?: Partial<IApplicationTagsProps>) => {
        const completeProps: IApplicationTagsProps = { ...props };

        return <ApplicationTags {...completeProps} />;
    };

    afterEach(() => {
        process.env = originalProcessEnv;
    });

    it('renders the beta tag', () => {
        render(createTestComponent());
        expect(screen.getByText(/applicationTags.beta/)).toBeInTheDocument();
    });

    it('renders current version and DEV label on development environment', () => {
        process.env.version = '1.0.2';
        process.env.NEXT_PUBLIC_ENV = 'development';
        render(createTestComponent());
        expect(
            screen.getByText(/shared.useApplicationVersion.versionEnv \(version=1.0.2,env=DEV\)/),
        ).toBeInTheDocument();
    });

    it('renders current version and STG label on staging environment', () => {
        process.env.version = '0.0.1';
        process.env.NEXT_PUBLIC_ENV = 'staging';
        render(createTestComponent());
        expect(
            screen.getByText(/shared.useApplicationVersion.versionEnv \(version=0.0.1,env=STG\)/),
        ).toBeInTheDocument();
    });

    it('only renders current version of production environment', () => {
        process.env.version = '1.5.0';
        process.env.NEXT_PUBLIC_ENV = 'production';
        render(createTestComponent());
        expect(screen.getByText(/shared.useApplicationVersion.version \(version=1.5.0\)/)).toBeInTheDocument();
    });
});
