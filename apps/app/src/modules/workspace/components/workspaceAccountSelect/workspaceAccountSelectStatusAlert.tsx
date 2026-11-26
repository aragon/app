'use client';

import { AlertInline, Button } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useWorkspaceAccountSuggestions } from '../../hooks/useWorkspaceAccountSuggestions';

/**
 * Warns, with a retry, that the suggestions could not be read or are incomplete.
 */
export const WorkspaceAccountSelectStatusAlert: React.FC = () => {
    const { t } = useTranslations();
    const { address } = useWalletAccount();
    const { isPending, isError, isIncomplete, refetch } =
        useWorkspaceAccountSuggestions(address);

    // A failed read keeps the last list, which may be incomplete too: the failure is the one to report.
    if (isPending || !(isError || isIncomplete)) {
        return null;
    }

    return (
        <div
            className={classNames(
                'flex items-center justify-between gap-3 rounded-xl py-2.5 pr-3 pl-4',
                isError ? 'bg-critical-subtle' : 'bg-warning-subtle',
            )}
        >
            <AlertInline
                message={t(
                    isError
                        ? 'app.workspace.workspaceAccountSelect.error'
                        : 'app.workspace.workspaceAccountSelect.incomplete',
                )}
                variant={isError ? 'critical' : 'warning'}
            />
            <Button onClick={refetch} size="sm" variant="tertiary">
                {t('app.workspace.workspaceAccountSelect.retry')}
            </Button>
        </div>
    );
};
