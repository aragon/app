import * as useApplicationVersion from '@/shared/hooks/useApplicationVersion';
import { render, screen } from '@testing-library/react';
import { ApplicationTags, type IApplicationTagsProps } from './applicationTags';

describe('<ApplicationTags /> component', () => {
    const originalProcessEnv = process.env;
    const useApplicationVersionSpy = jest.spyOn(useApplicationVersion, 'useApplicationVersion');

    afterEach(() => {
        useApplicationVersionSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IApplicationTagsProps>) => {
        const completeProps: IApplicationTagsProps = { ...props };

        return <ApplicationTags {...completeProps} />;
    };

    afterEach(() => {
        process.env = originalProcessEnv;
    });

    it('renders the current application version', () => {
        const version = '1.0.2 (DEV)';
        useApplicationVersionSpy.mockReturnValue(version);
        render(createTestComponent());
        expect(screen.getByText(version)).toBeInTheDocument();
    });
});
