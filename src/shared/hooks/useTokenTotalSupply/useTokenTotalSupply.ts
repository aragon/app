import { erc20Abi } from 'viem';
import { useReadContract } from 'wagmi';
import { useTranslations } from '@/shared/components/translationsProvider';
import type {
    IUseTokenTotalSupplyParams,
    IUseTokenTotalSupplyResult,
} from './useTokenTotalSupply.api';

export const useTokenTotalSupply = (
    params: IUseTokenTotalSupplyParams,
): IUseTokenTotalSupplyResult => {
    const { address, chainId, enabled = true } = params;
    const { t } = useTranslations();

    const { data, isError, isLoading } = useReadContract({
        chainId,
        address,
        abi: erc20Abi,
        functionName: 'totalSupply',
        query: { enabled },
    });

    const error = isError
        ? t('app.shared.useTokenTotalSupply.error')
        : undefined;

    return { data, error, isError, isLoading };
};
