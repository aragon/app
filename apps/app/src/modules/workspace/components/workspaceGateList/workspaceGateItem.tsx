import { Accordion, Tag } from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IWorkspaceGate } from '../../api/workspaceService';
import { workspaceGovernedAccountTypes } from '../../constants/workspaceHolderType';
import { workspaceUtils } from '../../utils/workspaceUtils';
import { WorkspaceAddress } from '../workspaceAddress';

export interface IWorkspaceGateItemProps {
    /**
     * Gate to display.
     */
    gate: IWorkspaceGate;
    /**
     * Value used by the parent accordion to track the expanded state.
     */
    value: string;
    /**
     * Chain ID used to build the block explorer links.
     */
    chainId?: number;
    /**
     * Hides the holders of the gate when set to true, e.g. on the account view where the holder is
     * the account itself.
     */
    hideHolders?: boolean;
}

export const WorkspaceGateItem: React.FC<IWorkspaceGateItemProps> = (props) => {
    const { gate, value, chainId, hideHolders } = props;

    const { t } = useTranslations();

    const capabilityCount = workspaceUtils.getGatesCapabilityCount([gate]);
    const label =
        gate.roleName ??
        t(`app.workspace.workspaceGateList.requirement.${gate.requirement}`, {
            requirement: gate.requirement,
        });

    return (
        <Accordion.Item value={value}>
            <Accordion.ItemHeader>
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 pr-2 text-left">
                    <p className="truncate font-mono text-base text-neutral-800">
                        {label}
                    </p>
                    {gate.inferred && (
                        <Tag
                            label={t(
                                'app.workspace.workspaceGateList.inferred',
                            )}
                            variant="warning"
                        />
                    )}
                    <p className="text-neutral-500 text-sm">
                        {t('app.workspace.workspaceGateList.summary', {
                            holders: gate.holders.length,
                            capabilities: capabilityCount,
                        })}
                    </p>
                </div>
            </Accordion.ItemHeader>
            <Accordion.ItemContent>
                <div className="flex flex-col gap-4">
                    {!hideHolders && (
                        <div className="flex flex-col gap-2">
                            <p className="text-neutral-500 text-sm">
                                {t('app.workspace.workspaceGateList.holders')}
                            </p>
                            {gate.holders.length === 0 && (
                                <p className="text-neutral-800 text-sm">
                                    {t(
                                        'app.workspace.workspaceGateList.noHolders',
                                    )}
                                </p>
                            )}
                            {gate.holders.map((holder) => (
                                <div
                                    className="flex items-center gap-2"
                                    key={holder.address}
                                >
                                    <WorkspaceAddress
                                        address={holder.address}
                                        chainId={chainId}
                                    />
                                    <Tag
                                        label={holder.type}
                                        variant={
                                            workspaceGovernedAccountTypes.includes(
                                                holder.type,
                                            )
                                                ? 'primary'
                                                : 'critical'
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex flex-col gap-2">
                        <p className="text-neutral-500 text-sm">
                            {t('app.workspace.workspaceGateList.selectors')}
                        </p>
                        {gate.selectors.map((selector) => (
                            <div
                                className="flex min-w-0 flex-col gap-0.5 md:flex-row md:items-baseline md:gap-3"
                                key={selector.selector}
                            >
                                <p className="shrink-0 font-mono text-neutral-300 text-sm">
                                    {selector.selector}
                                </p>
                                <p className="truncate font-mono text-neutral-800 text-sm">
                                    {selector.signature}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </Accordion.ItemContent>
        </Accordion.Item>
    );
};
