import type {
    IAppContext,
    IDebugTransaction,
} from '@aragon/assistant-contracts';
import { useParams, usePathname } from 'next/navigation';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import type { IDaoPageParams } from '@/shared/types';
import { pendingTransactionManager } from '@/shared/utils/pendingTransactionManager';

// The contract caps this; keep the most recent handful — enough to debug with, small in the ticket.
const maxDebugTransactions = 5;

// Active (pending/submitted) transactions, captured silently for debugging. Attached to the ticket
// only — never shown back to the user.
const collectRecentTransactions = (): IDebugTransaction[] =>
    pendingTransactionManager
        .getActive()
        .slice(-maxDebugTransactions)
        .map(([, state]) => ({
            hash: state.hash,
            status: state.status,
            type: state.type,
        }));

/**
 * Builds the app context sent alongside every support chat request. DAO information comes from
 * the current route (the addressOrEns segment may be an ENS name), so it is only set on DAO pages.
 * Everything here is collected silently and attached to the ticket for debugging — it is never
 * shown to the user in chat.
 */
export const useSupportAppContext = (): IAppContext => {
    const pathname = usePathname();
    const params = useParams<Partial<IDaoPageParams>>();
    const { address, chainId } = useWalletAccount();

    const recentTransactions = collectRecentTransactions();

    return {
        daoAddress: params?.addressOrEns,
        network: params?.network,
        route: pathname,
        appVersion: process.env.version ?? 'unknown',
        walletAddress: address,
        chainId,
        recentTransactions:
            recentTransactions.length > 0 ? recentTransactions : undefined,
    };
};
