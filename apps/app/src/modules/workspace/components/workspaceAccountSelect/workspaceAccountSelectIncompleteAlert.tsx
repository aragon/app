'use client';

import { AlertInline, Button } from '@aragon/gov-ui-kit';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useWorkspaceAccountSuggestions } from '../../hooks/useWorkspaceAccountSuggestions';

/**
 * Warns, with a retry, that the suggestions are incomplete.
 */
export const WorkspaceAccountSelectIncompleteAlert: React.FC = () => {
    const { t } = useTranslations();
    const { address } = useWalletAccount();
    const { isPending, isIncomplete, refetch } =
        useWorkspaceAccountSuggestions(address);

    if (isPending || !isIncomplete) {
        return null;
    }

    return (
        <div className="flex items-center justify-between gap-3 rounded-xl bg-warning-100 py-2.5 pr-3 pl-4">
            <AlertInline
                message={t('app.workspace.workspaceAccountSelect.incomplete')}
                variant="warning"
            />
            <Button onClick={refetch} size="sm" variant="tertiary">
                {t('app.workspace.workspaceAccountSelect.retry')}
            </Button>
        </div>
    );
};
