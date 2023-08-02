export type CovalentToken = CovalentBaseToken & {
  prices: CovalentTokenPrice[];
};

export type CovalentBaseToken = {
  contract_decimals: number;
  contract_name: string;
  contract_ticker_symbol: string;
  contract_address: string;
  logo_url: string;
};

export type CovalentTokenPrice = {
  date: string;
  price: number;
};

export type CovalentTokenBalance = {
  updated_at: string;
  items: Array<
    CovalentBaseToken & {
      native_token: boolean;
      nft_data: CovalentNFTData;

      // this is BigInt value that needs to be adjusted using the
      // decimals for human-friendly display
      balance: string;
    }
  >;
};

// TODO: flesh this out when NFT support
// has been added
type CovalentNFTData = {
  token_id: string;
};

export type CovalentTokenTransfer = {
  address: string;
  items: Array<{
    transfers: CovalentTransferInfo[];
  }>;
};

export type CovalentTransferInfo = {
  block_signed_at: string;
  tx_hash: string;
  from_address: string;
  to_address: string;
  contract_decimals: number;
  contract_name: string;
  contract_ticker_symbol: string;
  contract_address: string;
  logo_url: string;
  transfer_type: 'IN' | 'OUT';
  balance: null | string;
  delta: 'string';
};
