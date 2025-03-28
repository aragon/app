import { erc20Abi } from 'viem';
import { useReadContracts } from 'wagmi';

export const useToken = () => {
    const result = useReadContracts({
        allowFailure: false,
        contracts: [
            {
                chainId: 1,
                address: '0x114B56ed5aEbad95176e33c39BefD444E90fe3Db',
                abi: erc20Abi,
                functionName: 'decimals',
            },
            {
                chainId: 1,
                address: '0x114B56ed5aEbad95176e33c39BefD444E90fe3Db',
                abi: erc20Abi,
                functionName: 'name',
            },
            {
                chainId: 1,
                address: '0x114B56ed5aEbad95176e33c39BefD444E90fe3Db',
                abi: erc20Abi,
                functionName: 'symbol',
            },
            {
                chainId: 1,
                address: '0x114B56ed5aEbad95176e33c39BefD444E90fe3Db',
                abi: erc20Abi,
                functionName: 'totalSupply',
            },
        ],
    });

    return result;
};
