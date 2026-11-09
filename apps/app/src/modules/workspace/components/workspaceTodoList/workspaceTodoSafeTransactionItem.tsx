'use client';

import { Avatar } from '@aragon/gov-ui-kit';
import safeWallet from '@/assets/images/safeWallet.png';
import { SafeDialogId } from '@/modules/safe/constants';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import type { IWorkspaceAccountInfo } from '../../api/workspaceQueryService';
import type { IWorkspaceTodoTransactionItem } from '../../hooks/useWorkspaceTodoData';
import { workspaceUtils } from '../../utils/workspaceUtils';
import { WorkspaceTodoItem } from './workspaceTodoItem';

export interface IWorkspaceTodoSafeTransactionItemProps
    extends IWorkspaceTodoTransactionItem {
    /**
     * The Safe account as resolved by the accounts API, used to name it.
     */
    accountInfo?: IWorkspaceAccountInfo;
}

/**
 * A Safe transaction awaiting the wallet's signature: the Safe's avatar, its nonce, how many signatures it has of
 * the ones it needs, and a sign button opening the same review dialog as the Safe queue page.
 */
export const WorkspaceTodoSafeTransactionItem: React.FC<
    IWorkspaceTodoSafeTransactionItemProps
> = (props) => {
    const { account, accountInfo, safeInfo, transaction, hasNonceRival } =
        props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const accountLabel = workspaceUtils.getAccountLabel(account, accountInfo);

    // The threshold read from the Safe wins over the one the queue carries, as on the queue page.
    const required = safeInfo?.threshold ?? transaction.confirmationsRequired;
    const metaParts = [
        t('app.workspace.workspaceTodoList.transaction.meta', {
            account: accountLabel,
            count: transaction.confirmations.length,
            required,
        }),
    ];

    if (hasNonceRival) {
        metaParts.push(
            t('app.workspace.workspaceTodoList.transaction.nonceRival'),
        );
    }

    const handleSignClick = () =>
        open(SafeDialogId.TRANSACTION_REVIEW, {
            params: {
                transaction,
                safeAddress: account.address,
                network: account.network,
                safeVersion: safeInfo?.version ?? null,
            },
        });

    return (
        <WorkspaceTodoItem
            action={{
                label: t('app.workspace.workspaceTodoList.transaction.action'),
                variant: 'secondary',
                onClick: handleSignClick,
            }}
            avatar={
                <Avatar
                    alt={accountLabel}
                    className="shrink-0"
                    size="md"
                    src={
                        ipfsUtils.cidToSrc(account.metadata?.avatar) ??
                        safeWallet.src
                    }
                />
            }
            meta={metaParts.join(' · ')}
            title={t('app.workspace.workspaceTodoList.transaction.title', {
                nonce: transaction.nonce,
            })}
        />
    );
};
