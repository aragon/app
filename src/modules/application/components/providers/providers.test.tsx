import { type Translations } from '@/shared/utils/translationsUtils';
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

jest.mock('@aragon/ods', () => ({
    ...jest.requireActual('@aragon/ods'),
    OdsModulesProvider: (props: { children: ReactNode }) => (
        <div data-testid="ods-modules-context">{props.children}</div>
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

    it('renders the OdsModules provider', () => {
        render(createTestComponent());
        expect(screen.getByTestId('ods-modules-context')).toBeInTheDocument();
    });

    it('correctly renders the children property', () => {
        const children = 'test-child';
        render(createTestComponent({ children }));
        expect(screen.getByText(children)).toBeInTheDocument();
    });
});
