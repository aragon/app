import { useCallback, useMemo } from 'react';
import { useDao } from '@/shared/api/daoService';
import { useFeatureFlags } from '@/shared/components/featureFlagsProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    type IUseFilterUrlParamParams,
    useFilterUrlParam,
} from '../useFilterUrlParam';

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
     * The DAO ID to query (parent or linked account ID).
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

export interface IUseDaoFilterUrlParamParams
    extends Omit<IUseFilterUrlParamParams, 'validValues'> {
    /**
     * Parent DAO ID.
     */
    daoId: string;
    /**
     * Include "All" option when DAO has linked accounts.
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

export const useDaoFilterUrlParam = (
    params: IUseDaoFilterUrlParamParams,
): IUseDaoFilterUrlParamReturn => {
    const {
        daoId,
        includeAllOption = true,
        name,
        fallbackValue: fallbackValueProp,
        enableUrlUpdate = true,
    } = params;

    const { t } = useTranslations();

    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const { isEnabled } = useFeatureFlags();
    const isLinkedAccountEnabled = isEnabled('linkedAccount');

    const options = useMemo<IDaoFilterOption[] | undefined>(() => {
        if (!dao) {
            return;
        }

        const result: IDaoFilterOption[] = [];
        const hasLinkedAccounts =
            isLinkedAccountEnabled && (dao.linkedAccounts?.length ?? 0) > 0;

        // Add "All" option if requested and has linked accounts
        if (includeAllOption && hasLinkedAccounts) {
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
            label: isLinkedAccountEnabled
                ? dao.name
                : t('app.finance.financeDetailsList.title'),
            daoId: dao.id,
            isAll: false,
            isParent: true,
            onlyParent: hasLinkedAccounts ? true : undefined,
        });

        // Add linked accounts if feature enabled
        if (isLinkedAccountEnabled && dao.linkedAccounts) {
            dao.linkedAccounts.forEach((linkedAccount) => {
                result.push({
                    id: linkedAccount.id,
                    label: linkedAccount.name,
                    daoId: linkedAccount.id,
                    isAll: false,
                    isParent: false,
                });
            });
        }

        return result;
    }, [dao, isLinkedAccountEnabled, includeAllOption, t]);

    const fallbackValue = fallbackValueProp ?? options?.[0]?.id;
    const validValues = options?.map((option) => option.id);
    const [activeFilter, setActiveFilter] = useFilterUrlParam({
        name,
        fallbackValue,
        enableUrlUpdate,
        validValues,
    });

    const activeOption = useMemo(
        () =>
            options?.find((option) => option.id === activeFilter) ??
            options?.[0],
        [options, activeFilter],
    );

    const setActiveOption = useCallback(
        (option: IDaoFilterOption) => setActiveFilter(option.id),
        [setActiveFilter],
    );

    return { activeOption, setActiveOption, options };
};
