'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { SafeCreateTransactionWizard } from '@/modules/safe/components/safeCreateTransactionWizard';
import { Page } from '@/shared/components/page';
import type { IWorkspaceAccountPageParams } from '@/shared/types';
import { WorkspaceQueryServiceKey } from '../../api/workspaceQueryService';
import { WorkspaceAccountType } from '../../api/workspaceService';
import { useWorkspaceAccountOptions } from '../../hooks/useWorkspaceAccountOptions';
import { workspaceUtils } from '../../utils/workspaceUtils';

const translationKey = 'app.workspace.workspaceCreateTransactionPage';

/**
 * Resolves the account on the route and hands a Safe account to the Safe wizard. Once the transaction is created the
 * reader goes back to the transactions of the account, where it shows as queued.
 */
export const WorkspaceCreateTransactionPageClient: React.FC = () => {
    const { workspaceId, accountId } =
        useParams<
            Pick<IWorkspaceAccountPageParams, 'workspaceId' | 'accountId'>
        >();
    const router = useRouter();
    const queryClient = useQueryClient();

    const { activeOption, isPending } = useWorkspaceAccountOptions();

    const transactionsUrl = workspaceUtils.getAccountScopeUrl(
        workspaceId,
        accountId,
        'transactions',
    );

    const handleCreated = () => {
        void queryClient.invalidateQueries({
            queryKey: [WorkspaceQueryServiceKey.TRANSACTIONS],
        });
        router.push(transactionsUrl);
    };

    if (isPending) {
        return null;
    }

    const account = activeOption?.account;

    if (account?.type !== WorkspaceAccountType.SAFE) {
        return (
            <Page.Error
                actionLink={transactionsUrl}
                descriptionKey={`${translationKey}.unsupported.description`}
                errorNamespace={translationKey}
                titleKey={`${translationKey}.unsupported.title`}
            />
        );
    }

    return (
        <SafeCreateTransactionWizard
            network={account.network}
            onCreated={handleCreated}
            safeAddress={account.address}
        />
    );
};
