import { useResolveAddressText } from '@aragon/gov-ui-kit';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import type { IWorkspaceAccount } from '../../api/workspaceService';
import type { IWorkspaceAccountOption } from '../useWorkspaceAccountOptions';

export interface IUseWorkspaceAccountTextParams {
    /**
     * Name of the account, when it has one.
     */
    name?: string;
    /**
     * Account to show, when there is one.
     */
    account?: Pick<IWorkspaceAccount, 'address' | 'network'>;
    /**
     * Text of an option with no account, e.g. the aggregated one.
     */
    fallback?: string;
}

/**
 * The text of an account for places that cannot draw a component (titles, translated sentences): its name, else the
 * name the address book or ENS gives its address, else the short address.
 */
export const useWorkspaceAccountText = (
    params: IUseWorkspaceAccountTextParams,
): string => {
    const { name, account, fallback = '' } = params;

    const addressText = useResolveAddressText(
        account?.address,
        account == null ? undefined : networkDefinitions[account.network].id,
    );

    if (name != null) {
        return name;
    }

    return account == null ? fallback : addressText;
};

/**
 * `useWorkspaceAccountText` of an account option: the aggregated option has no account, so its own label stands.
 */
export const useWorkspaceOptionText = (
    option?: IWorkspaceAccountOption,
): string =>
    useWorkspaceAccountText({
        name: option?.hasName ? option.label : undefined,
        account: option?.account,
        fallback: option?.label,
    });
