import { useDao } from '@/shared/api/daoService';
import { useFeatureFlags } from '@/shared/components/featureFlagsProvider';
import { useCallback, useMemo } from 'react';
import { useFilterUrlParam, type IUseFilterUrlParamParams } from '../useFilterUrlParam';

export interface IDaoFilterOption {
    /**
     * Unique identifier for this option (used for URL params and comparison).
     */
    id: string;
    /**
     * Human-readable label for the tab.
     */
    label: string;
    /**
     * The DAO ID to query (parent or SubDAO ID).
     * Undefined for "All" option.
     */
    daoId?: string;
    /**
     * Whether this is the "All" option (aggregates all DAOs).
     */
    isAll: boolean;
    /**
     * Whether this is the parent DAO option.
     */
    isParent: boolean;
    /**
     * Whether to only query parent DAO data (used with isParent).
     */
    onlyParent?: boolean;
}

export interface IUseDaoFilterUrlParamParams extends Omit<IUseFilterUrlParamParams, 'validValues'> {
    /**
     * Parent DAO ID.
     */
    daoId: string;
    /**
     * Include "All" option when DAO has SubDAOs.
     */
    includeAllOption?: boolean;
}

export interface IUseDaoFilterUrlParamReturn {
    /**
     * Currently active filter option.
     */
    activeOption?: IDaoFilterOption;
    /**
     * Set the active filter option.
     */
    setActiveOption: (option: IDaoFilterOption) => void;
    /**
     * All available filter options.
     */
    options?: IDaoFilterOption[];
}

export const useDaoFilterUrlParam = (params: IUseDaoFilterUrlParamParams): IUseDaoFilterUrlParamReturn => {
    const { daoId, includeAllOption = true, name, fallbackValue: fallbackValueProp, enableUrlUpdate = true } = params;

    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const { isEnabled } = useFeatureFlags();
    const isSubDaoEnabled = isEnabled('subDao');

    const options = useMemo<IDaoFilterOption[] | undefined>(() => {
        if (!dao) {
            return undefined;
        }

        const result: IDaoFilterOption[] = [];
        const hasSubDaos = isSubDaoEnabled && (dao.subDaos?.length ?? 0) > 0;

        // Add "All" option if requested and has SubDAOs
        if (includeAllOption && hasSubDaos) {
            result.push({
                id: 'all',
                label: '', // Will be set by consumer with translation
                daoId: dao.id,
                isAll: true,
                isParent: false,
            });
        }

        // Add parent DAO
        result.push({
            id: dao.id,
            label: dao.name ?? dao.id,
            daoId: dao.id,
            isAll: false,
            isParent: true,
            onlyParent: hasSubDaos ? true : undefined,
        });

        // Add SubDAOs if feature enabled
        if (isSubDaoEnabled && dao.subDaos) {
            dao.subDaos.forEach((subDao) => {
                result.push({
                    id: subDao.id,
                    label: subDao.name ?? subDao.id,
                    daoId: subDao.id,
                    isAll: false,
                    isParent: false,
                });
            });
        }

        return result;
    }, [dao, isSubDaoEnabled, includeAllOption]);

    const fallbackValue = fallbackValueProp ?? options?.[0]?.id;
    const validValues = options?.map((option) => option.id);
    const [activeFilter, setActiveFilter] = useFilterUrlParam({ name, fallbackValue, enableUrlUpdate, validValues });

    const activeOption = useMemo(
        () => options?.find((option) => option.id === activeFilter) ?? options?.[0],
        [options, activeFilter],
    );

    const setActiveOption = useCallback((option: IDaoFilterOption) => setActiveFilter(option.id), [setActiveFilter]);

    return { activeOption, setActiveOption, options };
};
