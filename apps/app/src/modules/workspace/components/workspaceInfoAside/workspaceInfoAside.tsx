'use client';

import { AddressOutput, Collapsible, DefinitionList } from '@aragon/gov-ui-kit';
import { ResourceLink } from '@/shared/components/resourceLink';
import { StatCard } from '@/shared/components/statCard';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IWorkspace } from '../../api/workspaceService';

export interface IWorkspaceInfoAsideProps {
    /**
     * Workspace to display the metadata of.
     */
    workspace: IWorkspace;
    /**
     * Precomputed stats to display; empty array hides the stats grid.
     */
    stats: Array<{ label: string; value: string | number }>;
}

/**
 * Metadata of a workspace laid out for an aside card: the workspace counterpart of the finance `DaoInfoAside`, which
 * the aside cards render instead when a single DAO account is selected.
 */
export const WorkspaceInfoAside: React.FC<IWorkspaceInfoAsideProps> = (
    props,
) => {
    const { workspace, stats } = props;
    const { owner, accounts, links } = workspace;

    const { t } = useTranslations();

    const description = workspace.description.trim();

    return (
        <>
            {description && (
                <Collapsible
                    buttonLabelClosed={t('app.shared.page.header.readMore')}
                    buttonLabelOpened={t('app.shared.page.header.readLess')}
                    collapsedLines={2}
                >
                    {description}
                </Collapsible>
            )}
            {stats.length > 0 && (
                <div className="grid w-full grid-cols-2 gap-3">
                    {stats.map((stat) => (
                        <StatCard
                            key={stat.label}
                            label={stat.label}
                            value={stat.value}
                        />
                    ))}
                </div>
            )}
            <DefinitionList.Container>
                <DefinitionList.Item
                    term={t('app.workspace.workspaceInfoAside.owner')}
                >
                    <AddressOutput address={owner} />
                </DefinitionList.Item>
                <DefinitionList.Item
                    term={t('app.workspace.workspaceInfoAside.accounts')}
                >
                    {accounts.length}
                </DefinitionList.Item>
            </DefinitionList.Container>
            {links.length > 0 && (
                <div className="flex flex-col gap-3">
                    {links.map((link) => (
                        <ResourceLink
                            isExternal={true}
                            key={link.url}
                            name={link.name}
                            url={link.url}
                        />
                    ))}
                </div>
            )}
        </>
    );
};
