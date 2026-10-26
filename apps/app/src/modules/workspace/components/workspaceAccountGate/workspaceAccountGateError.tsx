'use client';

import {
    Card,
    EmptyState,
    type IEmptyStateBaseProps,
    type IllustrationObjectType,
} from '@aragon/gov-ui-kit';
import { useParams, useRouter } from 'next/navigation';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IWorkspaceAccountPageParams } from '@/shared/types';
import { WorkspaceAccountState } from '../../constants/workspaceAccountState';
import {
    workspaceAllAccountsSegment,
    workspaceUtils,
} from '../../utils/workspaceUtils';

export interface IWorkspaceAccountGateErrorProps {
    /**
     * What the accounts API says the account is, undefined when it could not tell. Selects the state rendered: the
     * DAO state and undefined both get the generic error, as the DAO read failed for another reason.
     */
    accountState?: WorkspaceAccountState;
}

interface IWorkspaceAccountGateErrorState {
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

const translationNamespace = 'app.workspace.workspaceAccountGate';

/**
 * State rendered by `WorkspaceAccountGate` in place of the page when the DAO of the account cannot be read, picked by
 * what the account is: a Safe is pointed to the sections that serve it, an address that is neither a DAO nor a Safe
 * is not found, a lookup that could not be verified offers a retry, and anything else is the generic error.
 *
 * A client component of its own because translations are only available client side. The workspace and account IDs
 * are read from the route, which every gated page sits under, rather than threaded through each page.
 */
export const WorkspaceAccountGateError: React.FC<
    IWorkspaceAccountGateErrorProps
> = (props) => {
    const { accountState } = props;

    const { t } = useTranslations();
    const router = useRouter();
    const { workspaceId, accountId } =
        useParams<
            Pick<IWorkspaceAccountPageParams, 'workspaceId' | 'accountId'>
        >();

    const getSectionUrl = (section: string) =>
        workspaceUtils.getAccountScopeUrl(workspaceId, accountId, section);

    const errorState: IWorkspaceAccountGateErrorState = {
        namespace: 'error',
        illustration: 'WARNING',
    };

    const states: Partial<
        Record<WorkspaceAccountState, IWorkspaceAccountGateErrorState>
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
            // Re-runs the gate on the server, which is where the lookup happens.
            primaryButton: {
                label: t(`${translationNamespace}.unavailable.action`),
                onClick: router.refresh,
            },
        },
    };

    const { namespace, illustration, primaryButton, secondaryButton } =
        (accountState != null ? states[accountState] : undefined) ?? errorState;

    return (
        <Page.Container>
            <Page.Content>
                <Page.Main>
                    <Card className="border border-neutral-100 py-10">
                        <EmptyState
                            description={t(
                                `${translationNamespace}.${namespace}.description`,
                            )}
                            heading={t(
                                `${translationNamespace}.${namespace}.heading`,
                            )}
                            objectIllustration={{ object: illustration }}
                            primaryButton={primaryButton}
                            secondaryButton={secondaryButton}
                        />
                    </Card>
                </Page.Main>
            </Page.Content>
        </Page.Container>
    );
};
