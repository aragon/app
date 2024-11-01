import { type IGetMemberListParams } from '@/modules/governance/api/governanceService';
import { useMemberListData } from '@/modules/governance/hooks/useMemberListData';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    DataListContainer,
    DataListRoot,
    Dialog,
    invariant,
    MemberAvatar,
    MemberDataListItem,
} from '@aragon/gov-ui-kit';
import { mainnet } from 'viem/chains';

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
                        layoutClassName="flex flex-col gap-2"
                    >
                        {memberList?.map((member) => (
                            <div
                                key={member.address}
                                onClick={() => handleMemberClicked(member.address)}
                                className="cursor-pointer"
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        handleMemberClicked(member.address);
                                    }
                                }}
                            >
                                <div className="flex w-full items-center gap-2">
                                    <MemberAvatar address={member.address} chainId={mainnet.id} size="md" />
                                    <p className="truncate text-sm text-neutral-500">{member.ens ?? member.address}</p>
                                </div>
                            </div>
                        ))}
                    </DataListContainer>
                </DataListRoot>
            </Dialog.Content>
        </>
    );
};
