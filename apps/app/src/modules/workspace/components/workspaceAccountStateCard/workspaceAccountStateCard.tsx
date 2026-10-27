'use client';

import {
    Card,
    EmptyState,
    type IEmptyStateBaseProps,
    type IllustrationObjectType,
} from '@aragon/gov-ui-kit';
import { useParams } from 'next/navigation';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IWorkspaceAccountPageParams } from '@/shared/types';
import { WorkspaceAccountState } from '../../constants/workspaceAccountState';
import {
    workspaceAllAccountsSegment,
    workspaceUtils,
} from '../../utils/workspaceUtils';

export interface IWorkspaceAccountStateCardProps {
    /**
     * What the accounts API says the account is, undefined when it could not tell. Selects the state rendered: the
     * DAO state and undefined both get the generic error.
     */
    accountState?: WorkspaceAccountState;
}

interface IWorkspaceAccountStateCardState {
    /**
     * Translation namespace of the heading and description.
     */
    namespace: string;
    /**
     * Illustration of the state.
     */
    illustration: IllustrationObjectType;
    /**
     * Primary action of the state, if any.
     */
    primaryButton?: IEmptyStateBaseProps['primaryButton'];
    /**
     * Secondary action of the state, if any.
     */
    secondaryButton?: IEmptyStateBaseProps['secondaryButton'];
}

const translationNamespace = 'app.workspace.workspaceAccountStateCard';

/**
 * Card standing in for the content of an account-scoped workspace page that cannot serve the account, picked by what
 * the account is (`workspaceUtils.resolveAccountState`): a Safe is pointed to the sections that serve it, an address
 * that is neither a DAO nor a Safe is not found, a lookup that could not be verified asks the user to try again
 * later (reloading the page retries it), and anything else is the generic error.
 *
 * Rendered by `WorkspaceAccountGate` for the DAO-only sections, and by the assets, transactions and proposals pages for an
 * account the workspace does not hold that the lookup could not place. The workspace and account IDs are read from
 * the route, which every caller sits under.
 */
export const WorkspaceAccountStateCard: React.FC<
    IWorkspaceAccountStateCardProps
> = (props) => {
    const { accountState } = props;

    const { t } = useTranslations();
    const { workspaceId, accountId } =
        useParams<
            Pick<IWorkspaceAccountPageParams, 'workspaceId' | 'accountId'>
        >();

    const getSectionUrl = (section: string) =>
        workspaceUtils.getAccountScopeUrl(workspaceId, accountId, section);

    const errorState: IWorkspaceAccountStateCardState = {
        namespace: 'error',
        illustration: 'WARNING',
    };

    const states: Partial<
        Record<WorkspaceAccountState, IWorkspaceAccountStateCardState>
    > = {
        [WorkspaceAccountState.SAFE]: {
            namespace: 'safe',
            illustration: 'WARNING',
            primaryButton: {
                label: t(`${translationNamespace}.safe.action.assets`),
                href: getSectionUrl('assets'),
            },
            secondaryButton: {
                label: t(`${translationNamespace}.safe.action.transactions`),
                href: getSectionUrl('transactions'),
            },
        },
        [WorkspaceAccountState.NOT_FOUND]: {
            namespace: 'notFound',
            illustration: 'NOT_FOUND',
            primaryButton: {
                label: t(`${translationNamespace}.notFound.action`),
                href: workspaceUtils.getAccountScopeUrl(
                    workspaceId,
                    workspaceAllAccountsSegment,
                    'overview',
                ),
            },
        },
        [WorkspaceAccountState.UNAVAILABLE]: {
            namespace: 'unavailable',
            illustration: 'WARNING',
        },
    };

    const { namespace, illustration, primaryButton, secondaryButton } =
        (accountState != null ? states[accountState] : undefined) ?? errorState;

    return (
        <Card className="border border-neutral-100 py-10">
            <EmptyState
                description={t(
                    `${translationNamespace}.${namespace}.description`,
                )}
                heading={t(`${translationNamespace}.${namespace}.heading`)}
                objectIllustration={{ object: illustration }}
                primaryButton={primaryButton}
                secondaryButton={secondaryButton}
            />
        </Card>
    );
};
