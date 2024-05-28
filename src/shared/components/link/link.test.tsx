import { render, screen } from '@testing-library/react';
import { Link, type ILinkProps } from './link';

describe('<Link /> component', () => {
    const createTestComponent = (props?: Partial<ILinkProps>) => {
        const completeProps: ILinkProps = { ...props };

        return <Link {...completeProps} />;
    };

    it('renders a NextJs link', () => {
        const href = '/test';
        render(createTestComponent({ href }));
        const link = screen.getByRole<HTMLAnchorElement>('link');
        expect(link).toBeInTheDocument();
        expect(link.href).toMatch(href);
    });

    it('sets default href when relative property is not defined', () => {
        expect(() => render(createTestComponent())).not.toThrow();
    });

    it('appends noopener and noreferrer rel to rel property when target is _blank', () => {
        const target = '_blank';
        const href = 'https://google.com';
        const rel = 'search';
        render(createTestComponent({ target, href, rel }));
        expect(screen.getByRole<HTMLAnchorElement>('link').rel).toEqual(`noopener noreferrer ${rel}`);
    });

    it('does not change rel property when target is not blank', () => {
        const rel = 'next';
        const href = '/test';
        render(createTestComponent({ rel, href }));
        expect(screen.getByRole<HTMLAnchorElement>('link').rel).toEqual(rel);
    });
});
