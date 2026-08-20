import { CardEmptyState } from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IWorkspaceAccount } from '../../types';
import { WorkspaceAccountItem } from './workspaceAccountItem';

export interface IWorkspaceAccountListProps {
    /**
     * Accounts to display, expected to be sorted by the number of capabilities they control.
     */
    accounts: IWorkspaceAccount[];
    /**
     * Chain ID used to build the block explorer links.
     */
    chainId?: number;
}

export const WorkspaceAccountList: React.FC<IWorkspaceAccountListProps> = (
    props,
) => {
    const { accounts, chainId } = props;

    const { t } = useTranslations();

    if (accounts.length === 0) {
        return (
            <CardEmptyState
                description={t(
                    'app.workspace.workspaceAccountList.empty.description',
                )}
                heading={t('app.workspace.workspaceAccountList.empty.heading')}
                objectIllustration={{ object: 'USERS' }}
            />
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {accounts.map((account) => (
                <WorkspaceAccountItem
                    account={account}
                    chainId={chainId}
                    key={account.address}
                />
            ))}
        </div>
    );
};
