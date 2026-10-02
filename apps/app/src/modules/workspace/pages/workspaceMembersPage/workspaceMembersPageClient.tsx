'use client';

import { Card, EmptyState } from '@aragon/gov-ui-kit';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useWorkspaceAccountOptions } from '../../hooks/useWorkspaceAccountOptions';

/**
 * Members of a workspace, which are always the members of one of its accounts.
 *
 * There is no aggregated membership: members are read one DAO at a time, so this page — the aggregated one — can
 * only point at an account. The list itself lives on the account-scoped route, which is where the DAO is resolvable
 * from the path and can therefore be prefetched.
 */
export const WorkspaceMembersPageClient: React.FC = () => {
    const { t } = useTranslations();

    const { options } = useWorkspaceAccountOptions();
    const hasDaoAccounts = options.some((option) => !option.isAllAccounts);

    // A workspace with no DAO account has no body, so there is no membership to point at either. Both states are
    // spelled out rather than built from a variable key, so the translation keys stay searchable.
    const emptyState = hasDaoAccounts
        ? {
              description: t(
                  'app.workspace.workspaceMembersPage.selectAccount.description',
              ),
              heading: t(
                  'app.workspace.workspaceMembersPage.selectAccount.heading',
              ),
              object: 'USERS' as const,
          }
        : {
              description: t(
                  'app.workspace.workspaceMembersPage.emptyState.description',
              ),
              heading: t(
                  'app.workspace.workspaceMembersPage.emptyState.heading',
              ),
              object: 'MAGNIFYING_GLASS' as const,
          };

    return (
        <Page.Content>
            <Page.Main
                title={t('app.workspace.workspaceMembersPage.main.title')}
            >
                <Card className="border border-neutral-100 py-10">
                    <EmptyState
                        description={emptyState.description}
                        heading={emptyState.heading}
                        objectIllustration={{ object: emptyState.object }}
                    />
                </Card>
            </Page.Main>
        </Page.Content>
    );
};
