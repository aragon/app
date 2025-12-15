import type { ISubDaoSummary } from '@/shared/api/daoService';
import { generateDao, generateSubDao } from '@/shared/testUtils';
import { daoBreadcrumbsUtils } from './daoBreadcrumbsUtils';

describe('buildDaoBreadcrumbPath', () => {
    it('returns undefined when no dao or target is provided', () => {
        expect(
            daoBreadcrumbsUtils.buildDaoBreadcrumbPath({ rootDao: undefined, targetAddress: undefined }),
        ).toBeUndefined();
    });

    it('returns the root DAO when target matches the root', () => {
        const dao = generateDao({ address: '0xparent', name: 'Parent DAO' });

        const path = daoBreadcrumbsUtils.buildDaoBreadcrumbPath({ rootDao: dao, targetAddress: '0xparent' });

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

        const path = daoBreadcrumbsUtils.buildDaoBreadcrumbPath({ rootDao: dao, targetAddress: '0xchild' });

        expect(path?.map((node) => node.name)).toEqual(['Parent DAO', 'Child DAO']);
    });

    it('returns a deep breadcrumb chain for nested SubDAOs', () => {
        const grandChild = generateSubDao({ address: '0xgrand', name: 'Grandchild DAO' });
        const child: ISubDaoSummary & { subDaos: ISubDaoSummary[] } = {
            ...generateSubDao({ address: '0xchild', name: 'Child DAO' }),
            subDaos: [grandChild],
        };
        const dao = generateDao({ address: '0xparent', name: 'Parent DAO', subDaos: [child] });

        const path = daoBreadcrumbsUtils.buildDaoBreadcrumbPath({ rootDao: dao, targetAddress: '0xgrand' });

        expect(path?.map((node) => node.name)).toEqual(['Parent DAO', 'Child DAO', 'Grandchild DAO']);
    });
});
