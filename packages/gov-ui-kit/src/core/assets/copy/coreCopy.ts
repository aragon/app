/**
 * Object representing the structure of copy texts used in various parts of the GovKit Core package.
 * Each property in the object corresponds to a specific component or feature, containing the necessary
 * text labels or functions that return text strings.
 */
export const coreCopy = {
    inputContainer: {
        optionalLabel: 'Optional',
    },
    dataListFilter: {
        filter: 'Filter',
        sort: 'Sort',
        reset: 'Reset all filters',
    },
    dataListFilterStatus: {
        found: 'Found',
        loadingEntity: (entityLabel: string) => `Loading ${entityLabel}`,
        filteringEntity: (entityLabel: string) => `Filtering ${entityLabel}`,
    },
    dataListPagination: {
        more: 'More',
        outOf: ({ total, entityLabel }: { total: number; entityLabel: string }) =>
            `of ${total.toString()} ${entityLabel}`,
    },
    inputNumberMax: {
        max: 'Max',
    },
    clipboard: {
        copy: 'Copy',
    },
    addressOutput: {
        looksLikeAddress: 'This name starts with 0x. Check the address below.',
        invalidLabel: 'The name saved for this address is not shown because it is not safe.',
        sameNameAsYours: 'You saved this name for a different address or network. Check the address below.',
        warning: 'Warning',
        nameFrom: 'Name from:',
        sourceWorkspace: 'Your workspace',
        sourceOtherWorkspace: (name: string) => `Workspace “${name}”`,
        sourceKnownAccount: 'Known account',
        sourceEns: 'ENS',
        savedForAllNetworks: 'Saved for all networks',
        savedForNetwork: (network: string) => `Saved for ${network}`,
        showAddress: (parts: string[]) => `${parts.join(', ')}, show address`,
        nameThisAddress: (address: string) => `Name this address ${address}`,
        noNameSaved: 'No name saved',
        nameNotShown: 'Name not shown',
        copied: 'Copied',
    },
};

export type CoreCopy = typeof coreCopy;
