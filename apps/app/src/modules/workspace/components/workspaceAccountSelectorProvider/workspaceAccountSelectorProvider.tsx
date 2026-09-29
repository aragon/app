'use client';

import { Spinner } from '@aragon/gov-ui-kit';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
    createContext,
    type ReactNode,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useWorkspaceAccounts } from '../../api/workspaceQueryService';
import {
    type IWorkspaceAccount,
    useWorkspace,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import { workspaceUtils } from '../../utils/workspaceUtils';

/**
 * URL parameter holding the selected account of a workspace page.
 */
export const workspaceAccountFilterParam = 'account';

/**
 * Value of the filter option aggregating every account of the workspace.
 */
export const workspaceAllAccountsOption = 'all';

export interface IWorkspaceAccountFilterOption {
    /**
     * Identifier of the option, used as the URL parameter value.
     */
    id: string;
    /**
     * Label of the tab.
     */
    label: string;
    /**
     * Account of the option, undefined for the "all accounts" option.
     */
    account?: IWorkspaceAccount;
    /**
     * Whether this is the option aggregating every account of the workspace.
     */
    isAllAccounts: boolean;
}

export interface IWorkspaceAccountSelectorContext {
    /**
     * Currently selected option.
     */
    activeOption?: IWorkspaceAccountFilterOption;
    /**
     * Selects the given option.
     */
    setActiveOption: (option: IWorkspaceAccountFilterOption) => void;
    /**
     * Every available option, the aggregated one first.
     */
    options: IWorkspaceAccountFilterOption[];
}

export interface IWorkspaceAccountSelectorProviderProps {
    /**
     * ID of the workspace.
     */
    workspaceId: string;
    /**
     * Children of the provider.
     */
    children?: ReactNode;
}

const WorkspaceAccountSelectorContext =
    createContext<IWorkspaceAccountSelectorContext | null>(null);

const pathSegments = (pathname?: string | null): string[] =>
    pathname?.toLowerCase().split('/') ?? [];

const setAccountUrlParam = (accountId: string) => {
    const newParams = new URLSearchParams(window.location.search);
    newParams.set(workspaceAccountFilterParam, accountId);

    window.history.replaceState(
        null,
        '',
        `${window.location.pathname}?${newParams}`,
    );
};

export const WorkspaceAccountSelectorProvider: React.FC<
    IWorkspaceAccountSelectorProviderProps
> = (props) => {
    const { children, workspaceId } = props;

    const { t } = useTranslations();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const urlOptionId = searchParams.get(workspaceAccountFilterParam);

    // Last selection, kept while navigating to tabs whose links carry no param.
    const [savedOptionId, setSavedOptionId] = useState(urlOptionId);

    // Retrying is pointless as the registry is read from local storage and fails the same way every time. Set here
    // and not on the other useWorkspace calls, as this is the fetch that loads the workspace for the whole layout.
    const {
        data: workspace,
        isPending: isWorkspacePending,
        error: workspaceError,
    } = useWorkspace({ urlParams: { id: workspaceId } }, { retry: false });

    const accounts = workspace?.accounts ?? [];
    const accountRefs = accounts.map(({ network, address }) => ({
        network,
        address,
    }));
    const { data: accountInfos } = useWorkspaceAccounts(
        { body: { accounts: accountRefs } },
        { enabled: accounts.length > 0 },
    );

    const options = useMemo<IWorkspaceAccountFilterOption[]>(() => {
        const accountOptions = accounts
            .filter((account) => account.type === WorkspaceAccountType.DAO)
            .map((account) => {
                const accountInfo = workspaceUtils.findAccountInfo(
                    accountInfos,
                    account,
                );

                return {
                    id: account.id,
                    // Same precedence as the workspace overview rows, so a tab and its row never disagree.
                    label: workspaceUtils.getAccountLabel(account, accountInfo),
                    account,
                    isAllAccounts: false,
                };
            });

        return [
            {
                id: workspaceAllAccountsOption,
                label: t(
                    'app.workspace.workspaceAccountSelectorProvider.allAccounts',
                ),
                isAllAccounts: true,
            },
            ...accountOptions,
        ];
    }, [accounts, accountInfos, t]);

    // A page addressing one account carries it in its path, e.g. the details of a proposal, whose slug only means
    // something within one account. That is the account being looked at, so it outranks both the parameter and the
    // memory — and needs no parameter of its own, which would be the same fact written on the URL twice.
    const pathOptionId = options.find(
        (option) =>
            option.account != null &&
            pathSegments(pathname).includes(option.account.id.toLowerCase()),
    )?.id;

    // The path wins over the parameter, which wins over memory.
    const activeOptionId = pathOptionId ?? urlOptionId ?? savedOptionId;
    const activeOption =
        options.find((option) => option.id === activeOptionId) ?? options[0];

    const setActiveOption = (option: IWorkspaceAccountFilterOption) => {
        setSavedOptionId(option.id);

        // The page addresses one account, so it cannot show another one: the proposal of an account does not exist
        // under its neighbour. Selecting one leaves for the closest page that can show it, which is the section the
        // account segment sits in — the proposals of the workspace, for the details of a proposal.
        if (pathOptionId != null && option.id !== pathOptionId) {
            const segments = pathSegments(pathname);
            const accountIndex = segments.indexOf(pathOptionId.toLowerCase());
            const sectionUrl = segments.slice(0, accountIndex).join('/');

            router.push(
                `${sectionUrl}?${workspaceAccountFilterParam}=${option.id}`,
            );

            return;
        }

        setAccountUrlParam(option.id);
    };

    // A link, the path or back/forward brought an account: remember it for the next tab.
    useEffect(() => {
        const selectedId = pathOptionId ?? urlOptionId;

        if (selectedId != null) {
            setSavedOptionId(selectedId);
        }
    }, [pathOptionId, urlOptionId]);

    // Landed on a tab whose link carried no param: put the selection back on the URL. Skipped when the path
    // already names the account, as the parameter would only duplicate it.
    useEffect(() => {
        if (
            pathOptionId == null &&
            urlOptionId == null &&
            savedOptionId != null &&
            savedOptionId !== workspaceAllAccountsOption
        ) {
            setAccountUrlParam(savedOptionId);
        }
    }, [pathOptionId, urlOptionId, savedOptionId]);

    if (isWorkspacePending) {
        return (
            <div className="flex grow items-center justify-center py-20">
                <Spinner size="lg" variant="neutral" />
            </div>
        );
    }

    // TODO: remove loading/error logic from individual pages + maybe this goes to a separate wrapper?
    if (workspaceError != null) {
        return (
            <Page.Error
                descriptionKey="app.workspace.workspaceAccountSelectorProvider.error.description"
                titleKey="app.workspace.workspaceAccountSelectorProvider.error.title"
            />
        );
    }

    if (!workspace) {
        throw new Error('No workspace - redirect');
    }

    return (
        <WorkspaceAccountSelectorContext
            value={{ activeOption, setActiveOption, options }}
        >
            {children}
        </WorkspaceAccountSelectorContext>
    );
};

export const useWorkspaceAccountSelectorContext =
    (): IWorkspaceAccountSelectorContext => {
        const values = useContext(WorkspaceAccountSelectorContext);

        if (values == null) {
            throw new Error(
                'useWorkspaceAccountSelectorContext: hook must be used inside a WorkspaceAccountSelectorContext provider to work properly.',
            );
        }

        return values;
    };
