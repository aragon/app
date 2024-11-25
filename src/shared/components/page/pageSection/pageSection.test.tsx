import { render, screen } from '@testing-library/react';
import { PageContextProvider, type IPageContext } from '../pageContext';
import { PageSection, type IPageSectionProps } from './pageSection';

describe('<PageSection /> component', () => {
    const originalOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight')!;

    beforeEach(() => {
        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: 500 });
    });

    afterEach(() => {
        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', originalOffsetHeight);
    });

    const createTestComponent = (props?: Partial<IPageSectionProps>, context?: Partial<IPageContext>) => {
        const completeProps: IPageSectionProps = {
            title: 'test-title',
            children: 'test',
            ...props,
        };

        const completeContext: IPageContext = {
            contentType: 'aside',
            ...context,
        };

        return (
            <PageContextProvider value={completeContext}>
                <PageSection {...completeProps} />
            </PageContextProvider>
        );
    };

    it('renders the children property', () => {
        const children = 'page-section-children';
        render(createTestComponent({ children }));
        expect(screen.getByText(children)).toBeInTheDocument();
    });

    it('renders the title as heading 2 on main context', () => {
        const title = 'main-title';
        const contentType = 'main' as const;
        render(createTestComponent({ title }, { contentType }));
        expect(screen.getByRole('heading', { name: title, level: 2 })).toBeInTheDocument();
    });

    it('renders the title as heading 3 on aside context', () => {
        const title = 'aside-title';
        const contentType = 'aside' as const;
        render(createTestComponent({ title }, { contentType }));
        expect(screen.getByRole('heading', { name: title, level: 3 })).toBeInTheDocument();
    });

    it('renders the description property when defined', () => {
        const description = 'test-description';
        render(createTestComponent({ description }));
        expect(screen.getByText(description)).toBeInTheDocument();
    });

    it('renders empty container when children height is zero', () => {
        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: 0 });
        const { container } = render(createTestComponent());
        expect(container).toBeEmptyDOMElement();
    });
});
