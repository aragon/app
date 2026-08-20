import { AlertCard, Card, DefinitionList, Tag } from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IWorkspaceTarget } from '../../api/workspaceService';
import { workspaceUtils } from '../../utils/workspaceUtils';
import { WorkspaceAddress } from '../workspaceAddress';
import { WorkspaceGateList } from '../workspaceGateList';
import { WorkspaceStatusTag } from '../workspaceStatusTag';

export interface IWorkspaceTargetItemProps {
    /**
     * Target to display.
     */
    target: IWorkspaceTarget;
    /**
     * Chain ID used to build the block explorer links.
     */
    chainId?: number;
}

export const WorkspaceTargetItem: React.FC<IWorkspaceTargetItemProps> = (
    props,
) => {
    const { target, chainId } = props;

    const { t } = useTranslations();

    const capabilityCount = workspaceUtils.getTargetCapabilityCount(target);
    const hasOwnership =
        target.owner != null ||
        target.pendingOwner != null ||
        target.authority != null;

    return (
        <Card className="flex flex-col gap-4 p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <WorkspaceAddress
                        address={target.address}
                        chainId={chainId}
                    />
                    {target.schemes.map((scheme) => (
                        <Tag key={scheme} label={scheme} variant="neutral" />
                    ))}
                </div>
                <div className="flex items-center gap-3">
                    <p className="text-neutral-500 text-sm">
                        {t('app.workspace.workspaceTargetList.summary', {
                            gates: target.gates.length,
                            capabilities: capabilityCount,
                        })}
                    </p>
                    <WorkspaceStatusTag status={target.status} />
                </div>
            </div>
            {target.error != null && (
                <AlertCard
                    message={t('app.workspace.workspaceTargetList.error')}
                    variant="critical"
                >
                    {target.error}
                </AlertCard>
            )}
            {hasOwnership && (
                <DefinitionList.Container>
                    {target.owner != null && (
                        <DefinitionList.Item
                            copyValue={target.owner}
                            term={t('app.workspace.workspaceTargetList.owner')}
                        >
                            <WorkspaceAddress
                                address={target.owner}
                                chainId={chainId}
                            />
                        </DefinitionList.Item>
                    )}
                    {target.pendingOwner != null && (
                        <DefinitionList.Item
                            copyValue={target.pendingOwner}
                            term={t(
                                'app.workspace.workspaceTargetList.pendingOwner',
                            )}
                        >
                            <WorkspaceAddress
                                address={target.pendingOwner}
                                chainId={chainId}
                            />
                        </DefinitionList.Item>
                    )}
                    {target.authority != null && (
                        <DefinitionList.Item
                            copyValue={target.authority}
                            term={t(
                                'app.workspace.workspaceTargetList.authority',
                            )}
                        >
                            <WorkspaceAddress
                                address={target.authority}
                                chainId={chainId}
                            />
                        </DefinitionList.Item>
                    )}
                </DefinitionList.Container>
            )}
            {target.gates.length === 0 ? (
                <p className="text-neutral-500 text-sm">
                    {t('app.workspace.workspaceTargetList.noGates')}
                </p>
            ) : (
                <WorkspaceGateList
                    chainId={chainId}
                    gates={target.gates}
                    idPrefix={target.address}
                />
            )}
        </Card>
    );
};
