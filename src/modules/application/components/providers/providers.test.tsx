import { type Translations } from '@/shared/utils/translationsUtils';
import type * as GovUiKit from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Providers, type IProvidersProps } from './providers';

jest.mock('@/shared/components/translationsProvider', () => ({
    TranslationsProvider: (props: { translations: Translations; children: ReactNode }) => (
        <div data-testid="translations-context" data-translations={JSON.stringify(props.translations)}>
            {props.children}
        </div>
    ),
}));

jest.mock('@/shared/components/dialogProvider', () => ({
    DialogProvider: (props: { children: ReactNode }) => <div data-testid="dialog-provider-mock">{props.children}</div>,
}));

jest.mock('@/shared/components/dialogRoot', () => ({ DialogRoot: () => <div data-testid="dialog-root-mock" /> }));

jest.mock('@aragon/gov-ui-kit', () => ({
    ...jest.requireActual<typeof GovUiKit>('@aragon/gov-ui-kit'),
    GukModulesProvider: (props: { children: ReactNode }) => (
        <div data-testid="guk-modules-context">{props.children}</div>
    ),
}));

describe('<Providers /> component', () => {
    const createTestComponent = (props?: Partial<IProvidersProps>) => {
        const completeProps: IProvidersProps = {
            translations: {} as Translations,
            ...props,
        };

        return <Providers {...completeProps} />;
    };

    it('renders the TranslationsContext provider and sets the correct translations', () => {
        const translations = { app: 'test' } as unknown as Translations;
        render(createTestComponent({ translations }));
        const contextElement = screen.getByTestId('translations-context');
        expect(contextElement).toBeInTheDocument();
        expect(contextElement.dataset.translations).toEqual(JSON.stringify(translations));
    });

    it('renders the GukModules provider', () => {
        render(createTestComponent());
        expect(screen.getByTestId('guk-modules-context')).toBeInTheDocument();
    });

    it('correctly renders the children property', () => {
        const children = 'test-child';
        render(createTestComponent({ children }));
        expect(screen.getByText(children)).toBeInTheDocument();
    });

    it('renders the DialogProvider provider and DialogRoot component', () => {
        render(createTestComponent());
        expect(screen.getByTestId('dialog-provider-mock')).toBeInTheDocument();
        expect(screen.getByTestId('dialog-root-mock')).toBeInTheDocument();
    });
});
