import type { IGetMemberListParams, IMember } from '@/modules/governance/api/governanceService';
import { useMemberListData } from '@/modules/governance/hooks/useMemberListData';
import { type IDaoPlugin, type IPluginSettings, useDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { daoUtils } from '@/shared/utils/daoUtils';
import { DataListContainer, DataListPagination, DataListRoot, MemberDataListItem } from '@aragon/gov-ui-kit';
import type { ReactNode } from 'react';

export interface IDaoMemberListDefaultProps<TSettings extends IPluginSettings = IPluginSettings> {
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

export const DaoMemberListDefault: React.FC<IDaoMemberListDefaultProps> = (props) => {
    const { initialParams, hidePagination, children, onMemberClick, layoutClassNames } = props;
    const { daoId } = initialParams.queryParams;

    const { t } = useTranslations();

    const { onLoadMore, state, pageSize, itemsCount, errorState, emptyState, memberList } =
        useMemberListData(initialParams);
    const { data: dao } = useDao({ urlParams: { id: daoId } });

    if (dao == null) {
        return null;
    }

    const processedLayoutClassNames = layoutClassNames ?? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3';

    const getMemberLink = (member: IMember) =>
        onMemberClick != null ? undefined : daoUtils.getDaoUrl(dao, `members/${member.address}`);

    return (
        <DataListRoot
            entityLabel={t('app.governance.daoMemberList.entity')}
            onLoadMore={onLoadMore}
            state={state}
            pageSize={pageSize}
            itemsCount={itemsCount}
        >
            <DataListContainer
                SkeletonElement={MemberDataListItem.Skeleton}
                layoutClassName={processedLayoutClassNames}
                errorState={errorState}
                emptyState={emptyState}
            >
                {memberList?.map((member) => (
                    <MemberDataListItem.Structure
                        key={member.address}
                        address={member.address}
                        ensName={member.ens ?? undefined}
                        className="min-w-0"
                        href={getMemberLink(member)}
                        onClick={() => onMemberClick?.(member)}
                    />
                ))}
            </DataListContainer>
            {!hidePagination && <DataListPagination />}
            {children}
        </DataListRoot>
    );
};
