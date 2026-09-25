'use client';

import { useSearchParams } from 'next/navigation';
import {
    createContext,
    type ReactNode,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
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

    const searchParams = useSearchParams();
    const urlOptionId = searchParams.get(workspaceAccountFilterParam);

    // Last selection, kept while navigating to tabs whose links carry no param.
    const [savedOptionId, setSavedOptionId] = useState(urlOptionId);

    const { data: workspace } = useWorkspace({
        urlParams: { id: workspaceId },
    });

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
        const accountOptions = (accounts ?? [])
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
                label: 'All accounts', // TODO: add to en.json + clean up other "all account" labels
                isAllAccounts: true,
            },
            ...accountOptions,
        ];
    }, [accounts, accountInfos]);

    // URL wins when present, memory otherwise.
    const activeOptionId = urlOptionId ?? savedOptionId;
    const activeOption =
        options.find((option) => option.id === activeOptionId) ?? options[0];

    const setActiveOption = (option: IWorkspaceAccountFilterOption) => {
        setSavedOptionId(option.id);
        setAccountUrlParam(option.id);
    };

    // A link or back/forward brought a param: remember it for the next tab.
    useEffect(() => {
        if (urlOptionId != null) {
            setSavedOptionId(urlOptionId);
        }
    }, [urlOptionId]);

    // Landed on a tab whose link carried no param: put the selection back on the URL.
    useEffect(() => {
        if (
            urlOptionId == null &&
            savedOptionId != null &&
            savedOptionId !== workspaceAllAccountsOption
        ) {
            setAccountUrlParam(savedOptionId);
        }
    }, [urlOptionId, savedOptionId]);

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
