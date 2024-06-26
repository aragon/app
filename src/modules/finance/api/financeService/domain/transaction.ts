import { type IAsset } from '@/modules/finance/api/financeService/domain/asset';
import { type TransactionType } from '@/modules/finance/api/financeService/domain/enum/transactionType';
import { type Network } from '@/shared/api/daoService';

/**
 * Interface representing a cryptocurrency transaction.
 */
export interface ITransaction {
  /**
   * The network identifier for the transaction.
   */
  network: Network;
  /**
   * The block number in which the transaction is included.
   */
  blockNumber: number;
  /**
   * The timestamp of the block in which the transaction is included.
   */
  blockTimestamp: number;
  /**
   * The address from which the transaction originates.
   */
  fromAddress: string;
  /**
   * The address to which the transaction is sent.
   */
  toAddress: string;
  /**
   * The token involved in the transaction.
   */
  token: IAsset;
  /**
   * The value of the transaction.
   */
  value: string;
  /**
   * The type of the transaction.
   */
  type: TransactionType;
  /**
   * The hash of the transaction.
   */
  transactionHash: `0x${string}`;
  /**
   * The id of the transaction.
   */
  id: string
  /**
   * The category of the transaction. Internal or external to the DAO.
   */
  category: string
  /**
   * If asset based, the token address for the asset in the transaction.
   */
  tokenAddress: string
  /**
   * The DAO address of the transaction.
   */
  daoAddress: string
}