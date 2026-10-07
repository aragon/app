import { QueryClient } from '@tanstack/react-query';
// biome-ignore lint/style/noRestrictedImports: Server route cannot call the UI-kit client shim; validation below disables strict checksums.
import { isAddress } from 'viem';
import { SafeDaoProposalDetails } from '@/plugins/safeMultisigPlugin/components/safeDaoProposalDetails';
import { safeDaoProposalOptions } from '@/plugins/safeMultisigPlugin/hooks/useSafeDaoProposals';
import {
    daoOptions,
    type IDao,
    type Network,
    PluginInterfaceType,
} from '@/shared/api/daoService';
import { safeInfoOptions } from '@/shared/api/safeService';
import { Page } from '@/shared/components/page';
import { daoUtils } from '@/shared/utils/daoUtils';
import { notFoundUtils } from '@/shared/utils/notFoundUtils';

interface ISafeDaoProposalRouteParams {
    addressOrEns: string;
    network: Network;
    safeTxHash: string;
}

interface ISafeDaoProposalRouteSearchParams {
    safeAddress?: string | string[];
}

interface ISafeDaoProposalRouteProps {
    params: Promise<ISafeDaoProposalRouteParams>;
    searchParams?: Promise<ISafeDaoProposalRouteSearchParams>;
}

export default async function SafeDaoProposalRoute({
    params,
    searchParams,
}: ISafeDaoProposalRouteProps) {
    const { addressOrEns, network, safeTxHash } = await params;
    const resolvedSearchParams =
        searchParams == null ? undefined : await searchParams;
    const safeAddress = Array.isArray(resolvedSearchParams?.safeAddress)
        ? resolvedSearchParams.safeAddress[0]
        : resolvedSearchParams?.safeAddress;
    const daoId = await notFoundUtils.fetchOrNotFound(() =>
        daoUtils.resolveDaoId({ addressOrEns, network }),
    );
    const queryClient = new QueryClient();
    const daoQuery = daoOptions({ urlParams: { id: daoId } });

    await queryClient.prefetchQuery(daoQuery);

    const dao = queryClient.getQueryData<IDao>(daoQuery.queryKey);
    const safePlugins =
        daoUtils.getDaoPlugins(dao, {
            includeLinkedAccounts: true,
            interfaceType: PluginInterfaceType.SAFE,
            includeUnsupported: true,
        }) ?? [];
    const canonicalSafePlugins = safePlugins.filter(
        (plugin) => !daoUtils.isLinkedAccountPlugin(plugin, dao),
    );
    const matchingSafePlugins =
        safeAddress == null
            ? []
            : canonicalSafePlugins.filter(
                  (plugin) =>
                      isAddress(plugin.address, { strict: false }) &&
                      isAddress(safeAddress, { strict: false }) &&
                      plugin.address.toLowerCase() ===
                          safeAddress.toLowerCase(),
              );
    const safePlugin =
        safeAddress != null
            ? matchingSafePlugins[0]
            : canonicalSafePlugins.length === 1
              ? canonicalSafePlugins[0]
              : undefined;
    const targetDaoAddress = safePlugin?.daoAddress ?? dao?.address;

    if (
        dao != null &&
        safePlugin != null &&
        targetDaoAddress != null &&
        isAddress(targetDaoAddress, { strict: false })
    ) {
        const safeProposalParams = {
            daoAddress: targetDaoAddress,
            network: dao.network,
            safeAddress: safePlugin.address,
            safeTxHash,
        };

        await Promise.all([
            queryClient.prefetchQuery(
                safeInfoOptions({
                    urlParams: {
                        address: safePlugin.address,
                        network: dao.network,
                    },
                }),
            ),
            queryClient.prefetchQuery(
                safeDaoProposalOptions(safeProposalParams),
            ),
        ]);
    }

    return (
        <Page.Container queryClient={queryClient}>
            <SafeDaoProposalDetails
                daoId={daoId}
                safeAddress={safeAddress}
                safeTxHash={safeTxHash}
            />
        </Page.Container>
    );
}
