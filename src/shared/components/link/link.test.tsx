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
});
