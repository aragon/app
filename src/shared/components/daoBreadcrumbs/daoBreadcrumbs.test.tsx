import { render, screen } from '@testing-library/react';
import { DaoBreadcrumbs } from './daoBreadcrumbs';

describe('DaoBreadcrumbs', () => {
    it('renders nothing when path is missing or too short', () => {
        const { container } = render(<DaoBreadcrumbs path={undefined} />);
        expect(container).toBeEmptyDOMElement();

        const singlePath = [{ address: '0xparent', name: 'Parent', avatar: null }];
        const { container: singleContainer } = render(<DaoBreadcrumbs path={singlePath} />);
        expect(singleContainer).toBeEmptyDOMElement();
    });

    it('renders avatars and names for a breadcrumb chain', () => {
        const path = [
            { address: '0xparent', name: 'Parent DAO', avatar: null },
            { address: '0xchild', name: 'Child DAO', avatar: null },
        ];

        render(<DaoBreadcrumbs path={path} />);

        expect(screen.getByText('Parent DAO')).toBeInTheDocument();
        expect(screen.getByText('Child DAO')).toBeInTheDocument();
    });
});
