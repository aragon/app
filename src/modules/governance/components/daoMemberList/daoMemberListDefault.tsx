import {
    DataListContainer,
    DataListPagination,
    DataListRoot,
    MemberDataListItem,
} from '@aragon/gov-ui-kit';
import { type ReactNode, useMemo } from 'react';
import type {
    IGetMemberListParams,
    IMember,
} from '@/modules/governance/api/governanceService';
import { useMemberListData } from '@/modules/governance/hooks/useMemberListData';
import {
    type IDaoPlugin,
    type IPluginSettings,
    useDao,
} from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';

export interface IDaoMemberListDefaultProps<
    TSettings extends IPluginSettings = IPluginSettings,
> {
    /**
     * Initial parameters to use for fetching the member list.
     */
    initialParams: IGetMemberListParams;
    /**
     * DAO plugin to display to members for.
     */
    plugin: IDaoPlugin<TSettings>;
    /**
     * Overrides the custom layout classes when set.
     */
    layoutClassNames?: string;
    /**
     * Callback called on member click. Replaces the default link to the member page when set.
     */
    onMemberClick?: (member: IMember) => void;
    /**
     * Hides the pagination when set to true.
     */
    hidePagination?: boolean;
    /**
     * Children of the component.
     */
    children?: ReactNode;
}

export const DaoMemberListDefault: React.FC<IDaoMemberListDefaultProps> = (
    props,
) => {
    const {
        initialParams,
        plugin,
        hidePagination,
        children,
        onMemberClick,
        layoutClassNames,
    } = props;
    const { daoId } = initialParams.queryParams;

    const { t } = useTranslations();

    // Always use the parent DAO for the UI context (member URLs, etc.).
    // The parent DAO is server-side prefetched → always a cache hit.
    const { data: dao } = useDao({ urlParams: { id: daoId } });

    // For subDAO plugins the API call must target the subDAO's own daoId so the
    // backend queries the correct DAO.
    const apiParams = useMemo(() => {
        const resolvedDaoId = daoUtils.resolvePluginDaoId(daoId, plugin, dao);

        if (resolvedDaoId === daoId) {
            return initialParams;
        }

        return {
            ...initialParams,
            queryParams: {
                ...initialParams.queryParams,
                daoId: resolvedDaoId,
            },
        };
    }, [initialParams, plugin, dao, daoId]);

    const {
        onLoadMore,
        state,
        pageSize,
        itemsCount,
        errorState,
        emptyState,
        memberList,
    } = useMemberListData(apiParams);

    const processedLayoutClassNames =
        layoutClassNames ?? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3';

    const getMemberLink = (member: IMember) =>
        onMemberClick != null
            ? undefined
            : daoUtils.getDaoUrl(dao, `members/${member.address}`);

    return (
        <DataListRoot
            entityLabel={t('app.governance.daoMemberList.entity')}
            itemsCount={itemsCount}
            onLoadMore={onLoadMore}
            pageSize={pageSize}
            state={state}
        >
            <DataListContainer
                emptyState={emptyState}
                errorState={errorState}
                layoutClassName={processedLayoutClassNames}
                SkeletonElement={MemberDataListItem.Skeleton}
            >
                {memberList?.map((member) => (
                    <MemberDataListItem.Structure
                        address={member.address}
                        className="min-w-0"
                        ensName={member.ens ?? undefined}
                        href={getMemberLink(member)}
                        key={member.address}
                        onClick={() => onMemberClick?.(member)}
                    />
                ))}
            </DataListContainer>
            {!hidePagination && <DataListPagination />}
            {children}
        </DataListRoot>
    );
};
