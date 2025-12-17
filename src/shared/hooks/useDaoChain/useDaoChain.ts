import { useBlockExplorer } from '@aragon/gov-ui-kit';
import { useDao } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import type { IUseDaoChainParams, IUseDaoChainReturn } from './useDaoChain.api';

export const useDaoChain = (params: IUseDaoChainParams): IUseDaoChainReturn => {
    const { daoId, network, chainId: providedChainId } = params;

    const shouldFetchDao = daoId != null && providedChainId == null && network == null;

    const { data: dao, isLoading } = useDao({ urlParams: { id: daoId ?? '' } }, { enabled: shouldFetchDao });

    const resolvedNetwork = network ?? dao?.network;
    const networkDefinition = resolvedNetwork != null ? networkDefinitions[resolvedNetwork] : undefined;
    const chainId = providedChainId ?? networkDefinition?.id;

    const { buildEntityUrl } = useBlockExplorer({ chainId });

    return {
        chainId,
        network: resolvedNetwork,
        networkDefinition,
        buildEntityUrl,
        isLoading: shouldFetchDao ? isLoading : false,
    };
};
