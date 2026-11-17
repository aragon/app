'use client';

import {
    addressUtils,
    CardEmptyState,
    useDebouncedValue,
} from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import type { IDao } from '@/shared/api/daoService';
import {
    DataListSelect,
    DataListSelectAddressView,
    type DataListSelectMode,
    type IDataListSelectAddressViewParams,
} from '@/shared/components/dataListSelect';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import {
    type IWorkspaceAccountInfo,
    WorkspaceAccountSuggestionRole,
} from '../../api/workspaceQueryService';
import type { IWorkspaceAccount } from '../../api/workspaceService';
import {
    WorkspaceSelectAccountDialogItem,
    WorkspaceSelectAccountDialogItemSkeleton,
} from '../../dialogs/workspaceSelectAccountDialog/workspaceSelectAccountDialogItem';
import {
    type IWorkspaceAccountLookupResult,
    useWorkspaceAccountLookup,
} from '../../hooks/useWorkspaceAccountLookup';
import { useWorkspaceAccountSuggestions } from '../../hooks/useWorkspaceAccountSuggestions';
import { useWorkspaceDaos } from '../../hooks/useWorkspaceDaos';
import { workspaceUtils } from '../../utils/workspaceUtils';

export interface IWorkspaceAccountSelectProps {
    /**
     * Selected accounts.
     */
    value: IWorkspaceAccount[];
    /**
     * Callback called with the new selection.
     */
    onChange: (accounts: IWorkspaceAccount[]) => void;
    /**
     * Accounts the workspace already holds: always listed, checked, not selectable and last.
     */
    workspaceAccounts?: IWorkspaceAccount[];
    /**
     * View shown on mount.
     * @default list
     */
    initialMode?: DataListSelectMode;
    /**
     * Called on a switch between the list and the address view.
     */
    onModeChange?: (mode: DataListSelectMode) => void;
}

// Rows shown per page before "More", as in the design.
const accountPageSize = 12;

// On network and address, whatever the casing of the address or of a stored ID.
const isSameAccount = workspaceUtils.isSameNetworkAddress;

const lookupDebounceDelay = 300;

// The `.eth` check spares the costly ENS normalisation on every keystroke of a name search.
const isAddressOrEnsName = (search: string) =>
    addressUtils.isAddress(search) ||
    (search.trim().toLowerCase().endsWith('.eth') &&
        workspaceUtils.normalizeEnsName(search) != null);

interface IAccountOption {
    account: IWorkspaceAccount;
    dao?: IDao;
    accountInfo?: IWorkspaceAccountInfo;
    role?: WorkspaceAccountSuggestionRole;
}

/**
 * Multi-select of accounts to add to a workspace: the accounts the connected wallet deployed or belongs to, plus
 * any account looked up by address or ENS name on every network.
 */
export const WorkspaceAccountSelect: React.FC<IWorkspaceAccountSelectProps> = (
    props,
) => {
    const {
        value,
        onChange,
        workspaceAccounts = [],
        initialMode,
        onModeChange,
    } = props;

    const { t } = useTranslations();
    const { address } = useWalletAccount();
    const { suggestions, isPending, isError } =
        useWorkspaceAccountSuggestions(address);

    // Accounts picked by address stay listed, so unchecking one does not make it disappear.
    const [addedOptions, setAddedOptions] = useState<IAccountOption[]>([]);

    const isSelected = (account: IWorkspaceAccount) =>
        value.some((selected) => isSameAccount(selected, account));
    const isInWorkspace = (account: IWorkspaceAccount) =>
        workspaceAccounts.some((held) => isSameAccount(held, account));

    // Read for their names and avatars, from the cache the workspace pages fill.
    const { daos: workspaceDaos } = useWorkspaceDaos(workspaceAccounts);

    const suggestedOptions: IAccountOption[] = suggestions;
    const heldOptions: IAccountOption[] = workspaceAccounts
        .filter(
            (account) =>
                !suggestedOptions.some((option) =>
                    isSameAccount(option.account, account),
                ),
        )
        .map((account) => ({ account, dao: workspaceDaos[account.id] }));
    // Suggestions arrive ranked: accounts in the workspace go last, keeping that order, then the unsuggested ones.
    const rankedOptions = [
        ...suggestedOptions.filter(({ account }) => !isInWorkspace(account)),
        ...suggestedOptions.filter(({ account }) => isInWorkspace(account)),
        ...heldOptions,
    ];
    // Accounts added by address lead, as the user just picked them.
    const options: IAccountOption[] = [
        ...addedOptions.filter(
            ({ account }) =>
                !rankedOptions.some((option) =>
                    isSameAccount(option.account, account),
                ),
        ),
        ...rankedOptions,
    ];

    const toggle = (account: IWorkspaceAccount) =>
        onChange(
            isSelected(account)
                ? value.filter((selected) => !isSameAccount(selected, account))
                : [...value, account],
        );

    const handleLookupSelect = (
        result: IWorkspaceAccountLookupResult,
        onBack: () => void,
    ) => {
        const { account, accountInfo } = result;

        if (!options.some((option) => isSameAccount(option.account, account))) {
            setAddedOptions((current) => [
                ...current,
                { account, accountInfo },
            ]);
        }

        if (!(isSelected(account) || isInWorkspace(account))) {
            onChange([...value, account]);
        }

        onBack();
    };

    const getNote = (
        account: IWorkspaceAccount,
        role?: WorkspaceAccountSuggestionRole,
    ) => {
        if (isInWorkspace(account)) {
            return t('app.workspace.workspaceAccountSelect.note.inWorkspace');
        }

        if (role === WorkspaceAccountSuggestionRole.MEMBER) {
            return t('app.workspace.workspaceAccountSelect.note.member');
        }

        return undefined;
    };

    const filterOption = (
        { account, dao, accountInfo }: IAccountOption,
        search: string,
    ) => {
        const lowerSearch = search.toLowerCase();
        const name =
            dao?.name ?? workspaceUtils.getAccountName(account, accountInfo);

        return (
            (name?.toLowerCase().includes(lowerSearch) ?? false) ||
            networkDefinitions[account.network].name
                .toLowerCase()
                .includes(lowerSearch) ||
            (addressUtils.isAddress(search) &&
                addressUtils.isAddressEqual(account.address, search))
        );
    };

    return (
        <DataListSelect
            errorState={{
                heading: t(
                    'app.workspace.workspaceAccountSelect.errorState.heading',
                ),
                description: t(
                    'app.workspace.workspaceAccountSelect.errorState.description',
                ),
            }}
            filterItem={filterOption}
            getItemKey={(option) => option.account.id}
            hasSearch={true}
            initialMode={initialMode}
            isAddressSearch={isAddressOrEnsName}
            items={options}
            itemsCount={options.length}
            labels={{
                entity: t('app.workspace.workspaceAccountSelect.entity'),
                searchPlaceholder: t(
                    'app.workspace.workspaceAccountSelect.searchPlaceholder',
                ),
                addAddress: t(
                    'app.workspace.workspaceAccountSelect.addAddress',
                ),
                addByAddress: t(
                    'app.workspace.workspaceAccountSelect.emptyState.addByAddress',
                ),
                emptyHeading: (search) =>
                    search === ''
                        ? t(
                              'app.workspace.workspaceAccountSelect.emptyState.noAccounts',
                          )
                        : t(
                              'app.workspace.workspaceAccountSelect.emptyState.heading',
                              { search },
                          ),
                emptyDescription: t(
                    'app.workspace.workspaceAccountSelect.emptyState.description',
                ),
            }}
            onModeChange={onModeChange}
            pageSize={accountPageSize}
            renderAddressView={(params) => (
                <WorkspaceAccountSelectAddressView
                    {...params}
                    getNote={(account) =>
                        getNote(account) ??
                        (isSelected(account)
                            ? t(
                                  'app.workspace.workspaceAccountSelect.note.selected',
                              )
                            : undefined)
                    }
                    isActive={(account) =>
                        isSelected(account) || isInWorkspace(account)
                    }
                    isInWorkspace={isInWorkspace}
                    isListed={(account) =>
                        options.some((option) =>
                            isSameAccount(option.account, account),
                        )
                    }
                    isListPending={isPending}
                    onSelect={handleLookupSelect}
                />
            )}
            renderItem={(option) => (
                <WorkspaceSelectAccountDialogItem
                    account={option.account}
                    accountInfo={option.accountInfo}
                    dao={option.dao}
                    isActive={
                        isSelected(option.account) ||
                        isInWorkspace(option.account)
                    }
                    isInWorkspace={isInWorkspace(option.account)}
                    isMultiSelect={true}
                    note={getNote(option.account, option.role)}
                    onClick={() => toggle(option.account)}
                />
            )}
            SkeletonElement={WorkspaceSelectAccountDialogItemSkeleton}
            state={
                isError
                    ? 'error'
                    : isPending
                      ? options.length > 0
                          ? 'fetchingNextPage'
                          : 'loading'
                      : 'idle'
            }
        />
    );
};

interface IWorkspaceAccountSelectAddressViewProps
    extends IDataListSelectAddressViewParams {
    /**
     * Note of a result, e.g. "Selected".
     */
    getNote: (account: IWorkspaceAccount) => string | undefined;
    /**
     * Whether a result is selected.
     */
    isActive: (account: IWorkspaceAccount) => boolean;
    /**
     * Whether the workspace already holds a result.
     */
    isInWorkspace: (account: IWorkspaceAccount) => boolean;
    /**
     * Whether a result is in the list already.
     */
    isListed: (account: IWorkspaceAccount) => boolean;
    /**
     * Whether the list is still incomplete: results wait for it, as one may be in the list.
     */
    isListPending: boolean;
    /**
     * Callback called when a result is picked.
     */
    onSelect: (
        result: IWorkspaceAccountLookupResult,
        onBack: () => void,
    ) => void;
}

const WorkspaceAccountSelectAddressView: React.FC<
    IWorkspaceAccountSelectAddressViewProps
> = (props) => {
    const {
        initialAddress,
        onBack,
        getNote,
        isActive,
        isInWorkspace,
        isListed,
        isListPending,
        onSelect,
    } = props;

    const { t } = useTranslations();
    const [searchValue, setSearchValue] = useState(initialAddress);
    // Each lookup costs requests, so typing is looked up once it pauses.
    const [debouncedSearch] = useDebouncedValue(searchValue, {
        delay: lookupDebounceDelay,
    });
    // Waits for the complete list, so a listed account on an unread page still shows as in the list.
    const lookup = useWorkspaceAccountLookup(
        isListPending ? undefined : debouncedSearch,
    );
    // Only an address or ENS name is looked up: anything else, e.g. while deleting, shows nothing at once.
    const isSearchable = searchValue != null && isAddressOrEnsName(searchValue);
    const isLoading =
        isSearchable &&
        (lookup.isLoading || isListPending || debouncedSearch !== searchValue);
    // Hidden unless settled, so they never show for a value no longer typed.
    const { results, isNotFound, isError } =
        isSearchable && !isLoading
            ? lookup
            : { results: [], isNotFound: false, isError: false };
    // The lookup names the accounts but has no avatars, so the DAOs found are read for them.
    const { daos } = useWorkspaceDaos(results.map(({ account }) => account));

    return (
        <DataListSelectAddressView
            backLabel={t(
                'app.workspace.workspaceAccountSelect.addressView.back',
            )}
            entity={t('app.workspace.workspaceAccountSelect.entity')}
            isLoading={isLoading}
            onBack={onBack}
            onSearchValueChange={setSearchValue}
            placeholder={t(
                'app.workspace.workspaceAccountSelect.addressView.placeholder',
            )}
            searchValue={searchValue}
        >
            {isLoading && <WorkspaceSelectAccountDialogItemSkeleton />}
            {results.map((result) => {
                const { account } = result;
                // Accounts in the workspace keep their own note.
                const isInList = !isInWorkspace(account) && isListed(account);

                return (
                    <WorkspaceSelectAccountDialogItem
                        account={account}
                        accountInfo={result.accountInfo}
                        dao={daos[account.id]}
                        hideCheckbox={isInList}
                        isActive={isActive(account)}
                        isInWorkspace={isInWorkspace(account)}
                        isMultiSelect={true}
                        key={account.id}
                        note={
                            isInList
                                ? t(
                                      'app.workspace.workspaceAccountSelect.note.inList',
                                  )
                                : getNote(account)
                        }
                        onClick={() => onSelect(result, onBack)}
                    />
                );
            })}
            {isNotFound && (
                <CardEmptyState
                    description={t(
                        'app.workspace.workspaceAccountSelect.addressView.notFound.description',
                    )}
                    heading={t(
                        'app.workspace.workspaceAccountSelect.addressView.notFound.heading',
                    )}
                    isStacked={false}
                    objectIllustration={{ object: 'NOT_FOUND' }}
                />
            )}
            {isError && (
                <CardEmptyState
                    description={t(
                        'app.workspace.workspaceAccountSelect.addressView.error.description',
                    )}
                    heading={t(
                        'app.workspace.workspaceAccountSelect.addressView.error.heading',
                    )}
                    isStacked={false}
                    objectIllustration={{ object: 'ERROR' }}
                />
            )}
        </DataListSelectAddressView>
    );
};
