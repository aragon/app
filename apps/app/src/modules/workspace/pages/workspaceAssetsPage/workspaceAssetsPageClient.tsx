'use client';

import { Card, EmptyState } from '@aragon/gov-ui-kit';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IWorkspaceAssetsPageClientProps {}

/**
 * Placeholder body of the workspace assets page. Laid out like `daoAssetsPageClient` — the asset list will replace
 * the empty state inside `Page.Main` — so that wiring the aggregated assets up does not move anything around.
 */
export const WorkspaceAssetsPageClient: React.FC<
    IWorkspaceAssetsPageClientProps
> = () => {
    const { t } = useTranslations();

    return (
        <Page.Content>
            <Page.Main
                title={t('app.workspace.workspaceAssetsPage.main.title')}
            >
                <Card className="border border-neutral-100 py-10">
                    <EmptyState
                        description={t(
                            'app.workspace.workspaceAssetsPage.placeholder.description',
                        )}
                        heading={t(
                            'app.workspace.workspaceAssetsPage.placeholder.title',
                        )}
                        objectIllustration={{ object: 'WALLET' }}
                    />
                </Card>
            </Page.Main>
        </Page.Content>
    );
};
