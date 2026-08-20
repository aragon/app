import { addressUtils, Card } from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IWorkspaceTarget } from '../../api/workspaceService';
import type { IWorkspaceAccount } from '../../types';

export interface IWorkspaceMatrixProps {
    /**
     * Accounts displayed as rows.
     */
    accounts: IWorkspaceAccount[];
    /**
     * Targets displayed as columns.
     */
    targets: IWorkspaceTarget[];
}

/**
 * Maximum number of accounts and targets the matrix stays readable at. Beyond this size the list
 * views are used instead.
 */
export const workspaceMatrixMaxSize = 12;

export const WorkspaceMatrix: React.FC<IWorkspaceMatrixProps> = (props) => {
    const { accounts, targets } = props;

    const { t } = useTranslations();

    const getCapabilityCount = (
        account: IWorkspaceAccount,
        target: IWorkspaceTarget,
    ) =>
        account.targets.find((accountTarget) =>
            addressUtils.isAddressEqual(accountTarget.address, target.address),
        )?.capabilityCount;

    return (
        <Card className="overflow-x-auto p-6">
            <table className="w-full border-collapse text-left">
                <thead>
                    <tr>
                        <th className="p-2 font-normal text-neutral-500 text-sm">
                            {t('app.workspace.workspaceMatrix.account')}
                        </th>
                        {targets.map((target) => (
                            <th
                                className="p-2 font-mono font-normal text-neutral-500 text-sm"
                                key={target.address}
                            >
                                {addressUtils.truncateAddress(target.address)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {accounts.map((account) => (
                        <tr key={account.address}>
                            <td className="p-2 font-mono text-neutral-800 text-sm">
                                {addressUtils.truncateAddress(account.address)}
                            </td>
                            {targets.map((target) => {
                                const capabilityCount = getCapabilityCount(
                                    account,
                                    target,
                                );

                                return (
                                    <td
                                        className={
                                            capabilityCount == null
                                                ? 'p-2 text-neutral-300 text-sm'
                                                : 'p-2 text-neutral-800 text-sm'
                                        }
                                        key={target.address}
                                    >
                                        {capabilityCount ??
                                            t(
                                                'app.workspace.workspaceMatrix.noAccess',
                                            )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </Card>
    );
};
