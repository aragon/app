import {AssetBalance, Deposit, TransferType} from '@aragon/sdk-client';
import {TokenType} from '@aragon/sdk-client-common';
import {BigNumber} from '@ethersproject/bignumber';
import {AddressZero} from '@ethersproject/constants';

import {constants} from 'ethers';
import request, {gql} from 'graphql-request';
import {
  CHAIN_METADATA,
  COVALENT_API_KEY,
  SupportedNetworks,
} from 'utils/constants';
import {TOP_ETH_SYMBOL_ADDRESSES} from 'utils/constants/topSymbolAddresses';
import {isNativeToken} from 'utils/tokens';
import {Token} from './domain';
import {CovalentResponse} from './domain/covalent-response';
import {TokenBalanceResponse} from './domain/covalent-token';
import {
  CovalentTokenTransfer,
  CovalentTransferInfo,
} from './domain/covalent-transfer';
import {
  IFetchTokenBalancesParams,
  IFetchTokenParams,
  IFetchTokenTransfersParams,
} from './token-service.api';

const REPLACEMENT_BASE_ETHER_LOGO_URL =
  'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880';

type tokenType = TokenType.NATIVE | TokenType.ERC20;

class TokenService {
  private defaultCurrency = 'USD';
  private baseUrl = {
    coingecko: 'https://api.coingecko.com/api/v3',
    covalent: 'https://api.covalenthq.com/v1',
  };

  /**
   * Fetch token data from external api.
   * @param address Address of the token
   * @param network Network of the token
   * @param symbol Symbol of the token (optional)
   * @returns Basic information about the token or undefined if token data cannot be fetched
   */
  fetchToken = async ({
    address,
    network,
    symbol,
  }: IFetchTokenParams): Promise<Token | null> => {
    // Use token data from ethereum mainnet when trying to fetch a testnet
    // token that is one of the top ERC20 tokens
    const useEthereumMainnet =
      CHAIN_METADATA[network].isTestnet &&
      symbol != null &&
      TOP_ETH_SYMBOL_ADDRESSES[symbol.toLowerCase()] != null;

    // Fetch the price from the mainnet when network is a testnet for native tokens
    const useNativeMainnet =
      CHAIN_METADATA[network].isTestnet && isNativeToken(address);

    const processedNetwork = useEthereumMainnet
      ? 'ethereum'
      : useNativeMainnet
      ? CHAIN_METADATA[network].mainnet!
      : network;
    const processedAddress = useEthereumMainnet
      ? TOP_ETH_SYMBOL_ADDRESSES[symbol.toLowerCase()]
      : address;

    const token = await this.fetchTokenFromBackend(
      processedNetwork,
      processedAddress
    );

    return token;
  };

  tokenQueryDocument = gql`
    query Token($network: Network!, $tokenAddress: String!) {
      token(network: $network, tokenAddress: $tokenAddress) {
        checkDate
        contractAddress
        decimals
        imageUrl
        name
        network
        priceUsd
        priceChangeOnDayUsd
        symbol
        totalHolders
        totalSupply
      }
    }
  `;

  private fetchTokenFromBackend = async (
    network: SupportedNetworks,
    tokenAddress: string
  ) => {
    let token: Token | null = null;
    try {
      const {token: resp} = await request(
        `${import.meta.env.VITE_BACKEND_URL}/graphql`,
        this.tokenQueryDocument,
        {network: network, tokenAddress}
      );
      const currPriceUsd = resp.priceUsd || 0;
      const prevPriceUsd = currPriceUsd - (resp.priceChangeOnDayUsd || 0);
      const priceChangePc =
        currPriceUsd === 0 && prevPriceUsd === 0
          ? 0
          : (currPriceUsd / prevPriceUsd - 1) * 100;
      token = {
        name: resp.name,
        symbol: resp.symbol,
        imgUrl: resp.imageUrl,
        address: resp.contractAddress,
        price: resp.priceUsd || null,
        priceChange: {
          day: priceChangePc,
          week: 0,
          month: 0,
          year: 0,
        },
      };

      if (network === 'base' && token.address === constants.AddressZero) {
        token.imgUrl = REPLACEMENT_BASE_ETHER_LOGO_URL;
      }
    } catch {
      console.error('failed to fetch token');
    }
    return token;
  };

  tokenBalanceQueryDocument = gql`
    query TokensBalances(
      $currency: String!
      $network: Network!
      $address: String!
    ) {
      tokensBalances(
        currency: $currency
        network: $network
        address: $address
      ) {
        updatedAt
        items {
          contractAddress
          contractName
          contractTickerSymbol
          contractDecimals
          logoUrl
          nativeToken
          balance
        }
      }
    }
  `;

  fetchTokenBalances = async ({
    address,
    network,
    ignoreZeroBalances = true,
    nativeTokenBalance,
  }: IFetchTokenBalancesParams): Promise<AssetBalance[] | null> => {
    if (!network) {
      console.info(
        `fetchTokenBalances - network ${network} not supported by Covalent`
      );
      return null;
    }

    const {nativeCurrency} = CHAIN_METADATA[network];

    const {tokensBalances: data} = await request(
      `${import.meta.env.VITE_BACKEND_URL}/graphql`,
      this.tokenBalanceQueryDocument,
      {
        network: network,
        address,
        currency: this.defaultCurrency,
      }
    );

    if (data.error || data == null) {
      console.info(
        `fetchTokenBalances - Covalent returned error: ${data.error_message}`
      );
      return null;
    }

    return (data as TokenBalanceResponse).items.flatMap(
      ({nativeToken, ...item}) => {
        if (
          ignoreZeroBalances &&
          ((nativeToken && nativeTokenBalance === BigInt(0)) ||
            BigNumber.from(item.balance).isZero())
        )
          // ignore zero balances if indicated
          return [];

        return {
          id: nativeToken ? AddressZero : item.contractAddress,
          address: nativeToken ? AddressZero : item.contractAddress,
          name: nativeToken ? nativeCurrency.name : item.contractName,
          symbol: nativeToken
            ? nativeCurrency.symbol
            : item.contractTickerSymbol?.toUpperCase(),
          decimals: nativeToken
            ? nativeCurrency.decimals
            : item.contractDecimals,
          type: (nativeToken ? TokenType.NATIVE : TokenType.ERC20) as tokenType,
          balance: nativeToken
            ? (nativeTokenBalance as bigint)
            : BigInt(item.balance),
          updateDate: new Date(data.updatedAt),
        };
      }
    );
  };

  fetchErc20Deposits = async ({
    address,
    network,
    assets,
  }: IFetchTokenTransfersParams) => {
    const {networkId} = CHAIN_METADATA[network].covalent ?? {};

    // check if network is supported
    if (!networkId) {
      console.info(
        `fetchCovalentErc20Deposits - network ${network} not supported by Covalent`
      );
      return null;
    }
    // fetch all balances
    if (!assets || assets.length === 0) {
      return [];
    }

    // fetch all transfers for the previously fetched assets
    const authToken = window.btoa(`${COVALENT_API_KEY}:`);
    const headers = {Authorization: `Basic ${authToken}`};

    const assetTransfers = await Promise.all(
      assets
        // filter out the native deposit
        .filter(asset => asset.type !== TokenType.NATIVE)
        .map(async asset => {
          // this cast is necessary because filtering native tokens first
          // means we only have tokens with actual addresses left.
          const tokenAddress = (asset as AssetBalance & {address: string})
            .address;

          // fetch and parse transfers
          const endpoint = `/${networkId}/address/${address}/transfers_v2/?contract-address=${tokenAddress}`;
          const url = `${this.baseUrl.covalent}${endpoint}`;
          const response = await fetch(url, {headers});
          const parsed: CovalentResponse<CovalentTokenTransfer> =
            await response.json();
          return parsed;
        })
    );

    // flatten and transform the deposits
    return assetTransfers
      .flatMap(
        t =>
          t.data?.items.flatMap(
            item =>
              item.transfers?.map(t => this.transformDeposit(address, t)) ?? []
          ) ?? []
      )
      .filter(Boolean) as Deposit[];
  };

  private transformDeposit = (
    address: string,
    deposit: CovalentTransferInfo
  ): Deposit | null => {
    if (deposit.transfer_type === 'OUT') {
      return null;
    }

    return {
      type: TransferType.DEPOSIT,
      tokenType: TokenType.ERC20,
      amount: BigInt(deposit.delta),
      creationDate: new Date(deposit.block_signed_at),
      from: deposit.from_address,
      to: address,
      token: {
        address: deposit.contract_address,
        decimals: deposit.contract_decimals,
        name: deposit.contract_name,
        symbol: deposit.contract_ticker_symbol,
      },
      transactionId: deposit.tx_hash,
    };
  };
}

export const tokenService = new TokenService();
