import { AragonBackendService } from '@/shared/api/aragonBackendService';
import type { IEstimateGasLimitParams } from './crossChainControllerService.api';
import type { IGasLimitEstimation } from './domain';

class CrossChainControllerService extends AragonBackendService {
    private urls = {
        estimateGasLimit:
            '/v2/simulations/:network/cross-chain/:controllerAddress/gas-limit',
    };

    /**
     * Simulates the inbound delivery on the destination chain and returns the `_gasLimit` the
     * forwarded message needs.
     *
     * Runs on the backend because the answer cannot be obtained from `eth_estimateGas`: the
     * controller wraps the payload in a `try/catch`, so the node's binary search settles on the
     * cost of the catch branch and never measures the actions at all.
     */
    estimateGasLimit = async (
        params: IEstimateGasLimitParams,
    ): Promise<IGasLimitEstimation> => {
        const result = await this.request<IGasLimitEstimation>(
            this.urls.estimateGasLimit,
            params,
            { method: 'POST' },
        );

        return result;
    };
}

export const crossChainControllerService = new CrossChainControllerService();
