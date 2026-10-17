'use client';

import { Card, EmptyState } from '@aragon/gov-ui-kit';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';

/**
 * Error state rendered by `WorkspaceAccountGate` in place of the page when the DAO of the account cannot be read.
 * A client component of its own because translations are only available client side.
 */
export const WorkspaceAccountGateError: React.FC = () => {
    const { t } = useTranslations();

    return (
        <Page.Container>
            <Page.Content>
                <Page.Main>
                    <Card className="border border-neutral-100 py-10">
                        <EmptyState
                            description={t(
                                'app.workspace.workspaceAccountGate.error.description',
                            )}
                            heading={t(
                                'app.workspace.workspaceAccountGate.error.heading',
                            )}
                            objectIllustration={{ object: 'WARNING' }}
                        />
                    </Card>
                </Page.Main>
            </Page.Content>
        </Page.Container>
    );
};
