import { translations } from '@/shared/constants/translations';
import { testLogger } from '@/test/utils';
import { render, screen } from '@testing-library/react';
import { type ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';
import * as headers from 'next/headers';
import type { ReactNode } from 'react';
import * as wagmi from 'wagmi';
import { LayoutRoot, type ILayoutRootProps } from './layoutRoot';

jest.mock('../../providers', () => ({
    Providers: (props: { translations: unknown; wagmiInitialState: unknown; children: ReactNode }) => (
        <div
            data-testid="providers-mock"
            data-translations={JSON.stringify(props.translations)}
            data-wagmistate={props.wagmiInitialState}
        >
            {props.children}
        </div>
    ),
}));

describe('<LayoutRoot /> component', () => {
    const cookieToInitialStateSpy = jest.spyOn(wagmi, 'cookieToInitialState');
    const headersSpy = jest.spyOn(headers, 'headers');

    beforeEach(() => {
        // Suppress "<html> cannot appear as a child of <div>" warnings.
        // To be fixed by React 19 migration (see https://github.com/testing-library/react-testing-library/issues/1250)
        testLogger.suppressErrors();
        headersSpy.mockReturnValue({ get: jest.fn() } as unknown as ReadonlyHeaders);
    });

    afterEach(() => {
        cookieToInitialStateSpy.mockReset();
        headersSpy.mockReset();
    });

    const createTestComponent = async (props?: Partial<ILayoutRootProps>) => {
        const completeProps: ILayoutRootProps = { ...props };
        const Component = await LayoutRoot(completeProps);

        return Component;
    };

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

    it('displays an error feedback but displays the footer if an error is thrown by a children component', async () => {
        testLogger.suppressErrors();
        const Children = () => {
            throw new Error('Test error');
        };

        render(await createTestComponent({ children: <Children /> }));
        expect(screen.getByText(/footer.link.explore/)).toBeInTheDocument();
        expect(screen.getByText(/errorFeedback.title/)).toBeInTheDocument();
    });

    it('retrieves and passes the wagmi initial state to the providers component', async () => {
        const initialState = 'test' as unknown as wagmi.State;
        cookieToInitialStateSpy.mockReturnValue(initialState);
        render(await createTestComponent());
        const providers = screen.getByTestId('providers-mock');
        expect(providers.dataset.wagmistate).toEqual(initialState);
    });
});
