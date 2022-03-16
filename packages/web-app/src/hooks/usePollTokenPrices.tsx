import {useCallback, useMemo, useState} from 'react';

import type {
  PollTokenOptions,
  TokenWithMarketData,
  TokenWithMetadata,
} from 'utils/types';

import useInterval from 'hooks/useInterval';
import useIsMounted from 'hooks/useIsMounted';
import {TimeFilter} from 'utils/constants';
import {formatUnits} from 'utils/library';
import {fetchTokenMarketData, TokenPrices} from 'services/prices';

/**
 * Hook for fetching token prices at specified intervals
 * @param tokenList List of token ids to fetch USD  value for
 * @param options.filter TimeFilter for market data
 * @param options.interval Delay in milliseconds
 * @returns Object with key value pairs corresponding to token address and USD value respectively.
 * If USD value isn't found, returns null for token price.
 */
export const usePollTokenPrices = (
  tokenList: TokenWithMetadata[] = [],
  options: PollTokenOptions = {filter: TimeFilter.day, interval: 300000}
) => {
  const isMounted = useIsMounted();
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchedMarketData, setFetchedMarketData] = useState<TokenPrices>();

  // fetch token pricing and market data
  const fetchPrices = useCallback(async () => {
    setIsLoading(true);

    try {
      const tokenIds = tokenList.map(token => token.metadata.apiId).join(',');
      const response = await fetchTokenMarketData(tokenIds);

      if (isMounted()) {
        setFetchedMarketData(response);
      }
    } catch (error) {
      setError(error as Error);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [isMounted, tokenList]);

  const pricing = useMemo((): {
    tokens: TokenWithMarketData[];
    totalAssetValue: number;
    totalAssetChange: number;
  } => {
    if (!fetchedMarketData)
      return {
        tokens: tokenList as TokenWithMarketData[],
        totalAssetValue: 0,
        totalAssetChange: 0,
      };

    let sum = 0;
    let intervalChange = 0;
    let treasuryShare: number;
    let valueChangeDuringInterval: number;
    let tokenMarketData;

    // map tokens
    const tokens: TokenWithMarketData[] = tokenList.map(token => {
      if (!token.metadata.apiId) return token;

      tokenMarketData = fetchedMarketData[token.metadata.apiId];

      // update total change during interval and total volume
      treasuryShare =
        tokenMarketData.price *
        Number(formatUnits(token.balance, token.metadata.decimals));

      valueChangeDuringInterval =
        treasuryShare * (tokenMarketData.percentages[options.filter] / 100);

      sum += treasuryShare;
      intervalChange += valueChangeDuringInterval;

      return {
        ...token,
        marketData: {
          price: tokenMarketData.price,
          treasuryShare,
          valueChangeDuringInterval,
          percentageChangedDuringInterval:
            tokenMarketData.percentages[options.filter],
        },
      };
    });

    return {
      tokens,
      totalAssetValue: sum,
      totalAssetChange: intervalChange,
    };
  }, [fetchedMarketData, options.filter, tokenList]);

  useInterval(() => fetchPrices(), options.interval, tokenList.length > 0);

  return {
    data: pricing,
    error,
    isLoading,
  };
};
