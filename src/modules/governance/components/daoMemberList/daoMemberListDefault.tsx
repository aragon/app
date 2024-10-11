import type { IGetMemberListParams } from '@/modules/governance/api/governanceService';
import { useMemberListData } from '@/modules/governance/hooks/useMemberListData';
import type { IDaoPlugin, IPluginSettings } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { DataListContainer, DataListPagination, DataListRoot, MemberDataListItem } from '@aragon/ods';
import type { IDaoMemberListContainerProps } from './daoMemberListContainer';

export interface IDaoMemberListDefaultProps<TSettings extends IPluginSettings = IPluginSettings>
    extends IDaoMemberListContainerProps {
    /**
     * Initial parameters to use for fetching the member list.
     */
    initialParams: IGetMemberListParams;
    /**
     * DAO plugin to display to members for.
     */
    plugin: IDaoPlugin<TSettings>;
}

export const DaoMemberListDefault: React.FC<IDaoMemberListDefaultProps> = (props) => {
    const { initialParams, hidePagination, children } = props;

    const { t } = useTranslations();

    const { onLoadMore, state, pageSize, itemsCount, errorState, emptyState, memberList } =
        useMemberListData(initialParams);

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
                layoutClassName="grid grid-cols-1 lg:grid-cols-3"
                errorState={errorState}
                emptyState={emptyState}
            >
                {memberList?.map((member) => (
                    <MemberDataListItem.Structure
                        key={member.address}
                        address={member.address}
                        ensName={member.ens ?? undefined}
                        className="min-w-0"
                        href={`/dao/${initialParams.queryParams.daoId}/members/${member.address}`}
                    />
                ))}
            </DataListContainer>
            {!hidePagination && <DataListPagination />}
            {children}
        </DataListRoot>
    );
};
