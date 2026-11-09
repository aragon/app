'use client';

import {
    AlertInline,
    Button,
    Card,
    CardEmptyState,
    IconType,
} from '@aragon/gov-ui-kit';
import { ApplicationDialogId } from '@/modules/application/constants/applicationDialogId';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IWorkspaceAccountInfo } from '../../api/workspaceQueryService';
import type { IWorkspaceAccount } from '../../api/workspaceService';
import { useWorkspaceTodoData } from '../../hooks/useWorkspaceTodoData';
import { workspaceUtils } from '../../utils/workspaceUtils';
import { WorkspaceTodoItemSkeleton } from './workspaceTodoItem';
import { WorkspaceTodoProposalItem } from './workspaceTodoProposalItem';
import { WorkspaceTodoSafeTransactionItem } from './workspaceTodoSafeTransactionItem';

export enum WorkspaceTodoFilter {
    ALL = 'all',
    PROPOSALS = 'proposals',
    TRANSACTIONS = 'transactions',
}

export interface IWorkspaceTodoContentProps {
    /**
     * Accounts to read the to-dos of.
     */
    accounts: IWorkspaceAccount[];
    /**
     * Accounts as resolved by the accounts API, used to name the Safe of each transaction row.
     */
    accountInfos?: IWorkspaceAccountInfo[];
    /**
     * ID of the workspace, used to link each proposal row to the proposal details page of its account.
     */
    workspaceId: string;
    /**
     * Name of the workspace, named when asking to connect a wallet.
     */
    workspaceName: string;
    /**
     * Kind of to-dos displayed.
     * @default WorkspaceTodoFilter.ALL
     */
    filter?: WorkspaceTodoFilter;
    /**
     * Whether the accounts are still being resolved, in which case the rows load rather than read as empty.
     */
    isAccountsPending?: boolean;
    /**
     * Rows displayed before the rest is left to `viewAllHref`. Every row is displayed when unset.
     */
    previewSize?: number;
    /**
     * Page holding every row, linked below a preview that cut some.
     */
    viewAllHref?: string;
}

/**
 * The to-dos of the connected wallet across the given accounts: the proposals it can still vote on and the Safe
 * transactions it can still sign, as one list of rows, proposals first.
 *
 * To-dos belong to the wallet, so without one the content asks to connect it; and when nothing is waiting, it says
 * so, so a member learns that nobody is waiting on them. The overview previews a few rows and links the rest to the
 * to-dos page, which displays them all with a filter on their kind.
 */
export const WorkspaceTodoContent: React.FC<IWorkspaceTodoContentProps> = (
    props,
) => {
    const {
        accounts,
        accountInfos,
        workspaceId,
        workspaceName,
        filter = WorkspaceTodoFilter.ALL,
        isAccountsPending = false,
        previewSize,
        viewAllHref,
    } = props;

    const { t } = useTranslations();
    const { address } = useWalletAccount();
    const { open } = useDialogContext();

    const {
        proposals,
        transactions,
        isPending,
        isError,
        hasUnreadableAccounts,
    } = useWorkspaceTodoData({ accounts, address });

    const showProposals = filter !== WorkspaceTodoFilter.TRANSACTIONS;
    const showTransactions = filter !== WorkspaceTodoFilter.PROPOSALS;

    const rows = [
        ...(showProposals
            ? proposals.map(({ proposal, dao }) => (
                  <WorkspaceTodoProposalItem
                      dao={dao}
                      key={proposal.id}
                      proposal={proposal}
                      workspaceId={workspaceId}
                  />
              ))
            : []),
        ...(showTransactions
            ? transactions.map((item) => (
                  <WorkspaceTodoSafeTransactionItem
                      accountInfo={workspaceUtils.findAccountInfo(
                          accountInfos,
                          item.account,
                      )}
                      key={`${item.account.id}-${item.transaction.safeTxHash}`}
                      {...item}
                  />
              ))
            : []),
    ];
    const visibleRows = previewSize == null ? rows : rows.slice(0, previewSize);

    const renderContent = () => {
        if (address == null) {
            return (
                <CardEmptyState
                    description={t(
                        'app.workspace.workspaceTodoList.connect.description',
                        { workspace: workspaceName },
                    )}
                    heading={t(
                        'app.workspace.workspaceTodoList.connect.heading',
                    )}
                    isStacked={false}
                    objectIllustration={{ object: 'WALLET' }}
                    primaryButton={{
                        label: t(
                            'app.workspace.workspaceTodoList.connect.action',
                        ),
                        iconLeft: IconType.BLOCKCHAIN_WALLET,
                        onClick: () => open(ApplicationDialogId.CONNECT_WALLET),
                    }}
                />
            );
        }

        if (isAccountsPending || isPending) {
            return (
                <Card className="flex flex-col border border-neutral-100">
                    <WorkspaceTodoItemSkeleton />
                    <WorkspaceTodoItemSkeleton />
                </Card>
            );
        }

        // The read fails as a whole, so its error replaces the rows; a Safe that could not be read is reported by
        // the endpoint and warned about above instead.
        if (isError) {
            return (
                <CardEmptyState
                    description={t(
                        'app.workspace.workspaceTodoList.errorState.description',
                    )}
                    heading={t(
                        'app.workspace.workspaceTodoList.errorState.heading',
                    )}
                    isStacked={false}
                    objectIllustration={{ object: 'ERROR' }}
                />
            );
        }

        if (rows.length === 0) {
            return (
                <CardEmptyState
                    description={t(
                        'app.workspace.workspaceTodoList.emptyState.description',
                    )}
                    heading={t(
                        'app.workspace.workspaceTodoList.emptyState.heading',
                    )}
                    isStacked={false}
                    objectIllustration={{ object: 'SUCCESS' }}
                />
            );
        }

        return (
            <>
                <Card className="flex flex-col border border-neutral-100">
                    {visibleRows}
                </Card>
                {viewAllHref != null && rows.length > visibleRows.length && (
                    <Button
                        className="self-start"
                        href={viewAllHref}
                        iconRight={IconType.CHEVRON_RIGHT}
                        size="md"
                        variant="tertiary"
                    >
                        {t('app.workspace.workspaceTodoList.viewAll')}
                    </Button>
                )}
            </>
        );
    };

    return (
        <>
            {hasUnreadableAccounts && (
                <AlertInline
                    message={t('app.workspace.workspaceTodoList.partial')}
                    variant="warning"
                />
            )}
            {renderContent()}
        </>
    );
};
