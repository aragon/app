'use client';

import {
    Button,
    Card,
    DaoAvatar,
    DefinitionList,
    IconType,
} from '@aragon/gov-ui-kit';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { ResourceLink } from '@/shared/components/resourceLink';
import { useTranslations } from '@/shared/components/translationsProvider';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { useWorkspace, workspaceService } from '../../api/workspaceService';
import { WorkspaceDialogId } from '../../constants/workspaceDialogId';
import type { IWorkspaceEditDetailsDialogParams } from '../../dialogs/workspaceEditDetailsDialog';
import { WorkspaceAdminAccounts } from './workspaceAdminAccounts';

export interface IWorkspaceAdminPageClientProps {
    /**
     * ID of the workspace to administer.
     */
    workspaceId: string;
}

export const WorkspaceAdminPageClient: React.FC<
    IWorkspaceAdminPageClientProps
> = (props) => {
    const { workspaceId } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const { data: workspace } = useWorkspace({
        urlParams: { id: workspaceId },
    });

    // Narrows the type only; the gate above has already resolved the workspace.
    if (workspace == null) {
        return null;
    }

    const { id, name, description, avatar, links } = workspace;

    const handleEditDetails = () => {
        const params: IWorkspaceEditDetailsDialogParams = { workspaceId: id };
        open(WorkspaceDialogId.EDIT_DETAILS, { params });
    };

    const handleExport = async () => {
        const rawExport = await workspaceService.exportWorkspace({
            urlParams: { id },
        });
        const url = URL.createObjectURL(
            new Blob([rawExport], { type: 'application/json' }),
        );

        const link = document.createElement('a');
        link.href = url;
        link.download = `${id}.json`;
        link.click();

        // Revoked later, as some browsers start the download after `click` returns.
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    return (
        <>
            <Page.Main title={t('app.workspace.workspaceAdminPage.title')}>
                <Page.MainSection
                    action={{
                        label: t(
                            'app.workspace.workspaceAdminPage.details.edit',
                        ),
                        iconLeft: IconType.PEN,
                        variant: 'secondary',
                        onClick: handleEditDetails,
                    }}
                    title={t('app.workspace.workspaceAdminPage.details.title')}
                >
                    <Card className="p-6">
                        <DefinitionList.Container>
                            <DefinitionList.Item
                                term={t(
                                    'app.workspace.workspaceAdminPage.details.name',
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <p className="text-neutral-500">{name}</p>
                                    <DaoAvatar
                                        name={name}
                                        size="md"
                                        src={ipfsUtils.cidToSrc(avatar)}
                                    />
                                </div>
                            </DefinitionList.Item>
                            <DefinitionList.Item
                                term={t(
                                    'app.workspace.workspaceAdminPage.details.description',
                                )}
                            >
                                <p className="text-neutral-500">
                                    {description !== ''
                                        ? description
                                        : t(
                                              'app.workspace.workspaceAdminPage.details.noDescription',
                                          )}
                                </p>
                            </DefinitionList.Item>
                            {links.length > 0 && (
                                <DefinitionList.Item
                                    term={t(
                                        'app.workspace.workspaceAdminPage.details.links',
                                    )}
                                >
                                    <div className="flex flex-col gap-3">
                                        {links.map((link, index) => (
                                            <ResourceLink
                                                isExternal={true}
                                                // Two links can share a URL, so the index keeps the key unique.
                                                key={`${link.url}-${index.toString()}`}
                                                name={link.name}
                                                url={link.url}
                                            />
                                        ))}
                                    </div>
                                </DefinitionList.Item>
                            )}
                        </DefinitionList.Container>
                    </Card>
                </Page.MainSection>
                <WorkspaceAdminAccounts workspace={workspace} />
            </Page.Main>
            <Page.Aside>
                <Page.AsideCard
                    title={t('app.workspace.workspaceAdminPage.storage.title')}
                >
                    <div className="flex w-full flex-col gap-y-4 md:gap-y-6">
                        {/* Fixed until workspaces can be published. */}
                        <DefinitionList.Container>
                            <DefinitionList.Item
                                term={t(
                                    'app.workspace.workspaceAdminPage.storage.published.term',
                                )}
                            >
                                <p className="text-neutral-500">
                                    {t(
                                        'app.workspace.workspaceAdminPage.storage.published.value',
                                    )}
                                </p>
                            </DefinitionList.Item>
                            <DefinitionList.Item
                                term={t(
                                    'app.workspace.workspaceAdminPage.storage.sync.term',
                                )}
                            >
                                <p className="text-neutral-500">
                                    {t(
                                        'app.workspace.workspaceAdminPage.storage.sync.value',
                                    )}
                                </p>
                            </DefinitionList.Item>
                        </DefinitionList.Container>
                        <Button
                            className="w-full"
                            iconLeft={IconType.DEPOSIT}
                            onClick={handleExport}
                            size="md"
                            variant="tertiary"
                        >
                            {t(
                                'app.workspace.workspaceAdminPage.storage.export',
                            )}
                        </Button>
                    </div>
                </Page.AsideCard>
            </Page.Aside>
        </>
    );
};
