import { type IGetMemberListParams } from '@/modules/governance/api/governanceService';
import { useMemberListData } from '@/modules/governance/hooks/useMemberListData';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { DataListContainer, DataListRoot, Dialog, invariant, MemberDataListItem } from '@aragon/gov-ui-kit';

export interface IRemoveMemberDialogParams {
    /**
     * Initial params to fetch the members list.
     */
    initialParams: IGetMemberListParams;
    /**
     * Callback called on token click.
     */
    onMemberClick: (address: string) => void;
    /**
     * Callback called on dialog close.
     */
    close: () => void;
}

export interface IRemoveMemberDialogProps extends IDialogComponentProps<IRemoveMemberDialogParams> {}

export const RemoveMembersDialog: React.FC<IRemoveMemberDialogProps> = (props) => {
    const { location } = props;

    const { t } = useTranslations();

    invariant(location.params != null, 'RemoveMembersDialog: required parameters must be set.');

    const { initialParams, onMemberClick, close } = location.params;

    const { daoId, pluginAddress } = initialParams.queryParams;

    const memberParams = { daoId, pluginAddress };
    const { onLoadMore, state, pageSize, itemsCount, errorState, emptyState, memberList } = useMemberListData({
        queryParams: memberParams,
    });

    const handleMemberClicked = (address: string) => {
        onMemberClick(address);
        close();
    };

    return (
        <>
            <Dialog.Header title={t('app.plugins.multisig.multisigRemoveMembersDialog.heading')} onCloseClick={close} />
            <Dialog.Content className="flex flex-col gap-6 py-7">
                <DataListRoot
                    entityLabel={t('app.plugins.multisig.multisigRemoveMembersDialog.entity')}
                    onLoadMore={onLoadMore}
                    state={state}
                    pageSize={pageSize}
                    itemsCount={itemsCount}
                >
                    <DataListContainer
                        SkeletonElement={MemberDataListItem.Skeleton}
                        emptyState={emptyState}
                        errorState={errorState}
                        layoutClassName="grid grid-cols-2 gap-2"
                    >
                        {memberList?.map((member) => (
                            <MemberDataListItem.Structure
                                key={member.address}
                                className="w-1/2 cursor-pointer"
                                address={member.address}
                                ensName={member.ens ?? undefined}
                                hideLabelTokenVoting={true}
                                onClick={() => handleMemberClicked(member.address)}
                            />
                        ))}
                    </DataListContainer>
                </DataListRoot>
            </Dialog.Content>
        </>
    );
};
