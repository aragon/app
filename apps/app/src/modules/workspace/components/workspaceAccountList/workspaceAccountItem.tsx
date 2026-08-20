import { Card, Tag } from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';
import { workspaceGovernedAccountTypes } from '../../constants/workspaceHolderType';
import type { IWorkspaceAccount } from '../../types';
import { WorkspaceAddress } from '../workspaceAddress';
import { WorkspaceGateList } from '../workspaceGateList';

export interface IWorkspaceAccountItemProps {
    /**
     * Account to display.
     */
    account: IWorkspaceAccount;
    /**
     * Chain ID used to build the block explorer links.
     */
    chainId?: number;
}

export const WorkspaceAccountItem: React.FC<IWorkspaceAccountItemProps> = (
    props,
) => {
    const { account, chainId } = props;

    const { t } = useTranslations();

    const isGoverned = workspaceGovernedAccountTypes.includes(account.type);

    return (
        <Card className="flex flex-col gap-4 p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <WorkspaceAddress
                        address={account.address}
                        chainId={chainId}
                    />
                    <Tag
                        label={account.type}
                        variant={isGoverned ? 'primary' : 'critical'}
                    />
                </div>
                <p className="text-neutral-500 text-sm">
                    {t('app.workspace.workspaceAccountList.summary', {
                        targets: account.targets.length,
                        capabilities: account.capabilityCount,
                    })}
                </p>
            </div>
            <div className="flex flex-col gap-4">
                {account.targets.map((target) => (
                    <div className="flex flex-col gap-2" key={target.address}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <WorkspaceAddress
                                address={target.address}
                                chainId={chainId}
                            />
                            <p className="text-neutral-500 text-sm">
                                {t(
                                    'app.workspace.workspaceAccountList.targetSummary',
                                    { capabilities: target.capabilityCount },
                                )}
                            </p>
                        </div>
                        <WorkspaceGateList
                            chainId={chainId}
                            gates={target.gates}
                            hideHolders={true}
                            idPrefix={`${account.address}-${target.address}`}
                        />
                    </div>
                ))}
            </div>
        </Card>
    );
};
