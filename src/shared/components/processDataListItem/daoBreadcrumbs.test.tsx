import type { ISubDaoSummary } from '@/shared/api/daoService';
import { generateDao, generateSubDao } from '@/shared/testUtils';
import { render, screen } from '@testing-library/react';
import { buildDaoBreadcrumbPath, DaoBreadcrumbs } from './daoBreadcrumbs';

describe('buildDaoBreadcrumbPath', () => {
    it('returns undefined when no dao or target is provided', () => {
        expect(buildDaoBreadcrumbPath({ rootDao: undefined, targetAddress: undefined })).toBeUndefined();
    });

    it('returns the root DAO when target matches the root', () => {
        const dao = generateDao({ address: '0xparent', name: 'Parent DAO' });

        const path = buildDaoBreadcrumbPath({ rootDao: dao, targetAddress: '0xparent' });

        expect(path).toEqual([
            {
                address: '0xparent',
                name: 'Parent DAO',
                avatar: null,
            },
        ]);
    });

    it('returns a two-level breadcrumb chain for a direct SubDAO', () => {
        const child = generateSubDao({ address: '0xchild', name: 'Child DAO' });
        const dao = generateDao({ address: '0xparent', name: 'Parent DAO', subDaos: [child] });

        const path = buildDaoBreadcrumbPath({ rootDao: dao, targetAddress: '0xchild' });

        expect(path?.map((node) => node.name)).toEqual(['Parent DAO', 'Child DAO']);
    });

    it('returns a deep breadcrumb chain for nested SubDAOs', () => {
        const grandChild = generateSubDao({ address: '0xgrand', name: 'Grandchild DAO' });
        const child: ISubDaoSummary & { subDaos: ISubDaoSummary[] } = {
            ...generateSubDao({ address: '0xchild', name: 'Child DAO' }),
            subDaos: [grandChild],
        };
        const dao = generateDao({ address: '0xparent', name: 'Parent DAO', subDaos: [child] });

        const path = buildDaoBreadcrumbPath({ rootDao: dao, targetAddress: '0xgrand' });

        expect(path?.map((node) => node.name)).toEqual(['Parent DAO', 'Child DAO', 'Grandchild DAO']);
    });
});

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
