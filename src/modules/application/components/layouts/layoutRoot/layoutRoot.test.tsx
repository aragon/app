import { translations } from '@/shared/constants/translations';
import { testLogger } from '@/test/utils';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { LayoutRoot, type ILayoutRootProps } from './layoutRoot';

jest.mock('../../providers', () => ({
    Providers: (props: { translations: unknown; children: ReactNode }) => (
        <div data-testid="providers-mock" data-translations={JSON.stringify(props.translations)}>
            {props.children}
        </div>
    ),
}));

jest.mock('@/modules/application/components/errorBoundary/errorFallback', () => ({
    ErrorFallback: () => <div>Error fallback</div>,
}));

describe('<LayoutRoot /> component', () => {
    const createTestComponent = async (props?: Partial<ILayoutRootProps>) => {
        const completeProps: ILayoutRootProps = { ...props };
        const Component = await LayoutRoot(completeProps);

        return Component;
    };

    beforeEach(() => {
        // Suppress "<html> cannot appear as a child of <div>" warnings.
        // To be fixed by React 19 migration (see https://github.com/testing-library/react-testing-library/issues/1250)
        testLogger.suppressErrors();
    });

    it('renders the children property and the application footer', async () => {
        const children = 'test-children';
        render(await createTestComponent({ children }));
        expect(screen.getByText(children)).toBeInTheDocument();
        expect(screen.getByText(/footer.link.explore/)).toBeInTheDocument();
    });

    it('renders the providers components and passes the english translations', async () => {
        const assets = await translations['en']();
        render(await createTestComponent());
        const providers = screen.getByTestId('providers-mock');
        expect(providers).toBeInTheDocument();
        expect(providers.dataset.translations).toEqual(JSON.stringify(assets));
    });

    describe('error handling', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error');

        beforeEach(() => {
            consoleErrorSpy.mockImplementation(jest.fn());
        });

        afterEach(() => {
            consoleErrorSpy.mockReset();
        });

        it('displays an error feedback if an error is thrown by a children component', async () => {
            const ThrowErrorComponent = () => {
                throw new Error('Test error');
            };

            render(await createTestComponent({ children: <ThrowErrorComponent /> }));

            expect(screen.getByText('Error fallback')).toBeInTheDocument();
        });
    });
});
