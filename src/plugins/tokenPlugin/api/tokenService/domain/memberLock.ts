import type { Network } from "@/shared/api/daoService"
import type { Hex } from "viem"

export interface IMemberLock {
  /**
   * Unique identifier for the member lock.
   */
  id: string
  /**
   * Network of the member lock.
   */
  network: Network
  /**
   * Transaction hash of the member lock creation.
   */
  transactionHash: Hex
  /**
   * Block number where the member lock was created.
   */
  blockNumber: number | null
  /**
   * Timestamp of the block where the member lock was created.
   */
  blockTimestamp: number | null
  /**
   * Address of the plugin related to the member lock.
   */
  pluginAddress: Hex
  /**
   * Address of the member.
   */
  memberAddress: Hex
  token: {
    network: Network
    address: Hex
    symbol: string
    name: string
    decimals: number
    logo: string | null
    isGovernance: boolean
    hasDelegate: boolean
    underlying: string | null
    type: string
    totalSupply: string
    mintableByDao: boolean
  } | null
  nft: {
    network: Network
    address: Hex
    symbol: string
    name: string
    decimals: number
    logo: string | null
    isGovernance: boolean
    hasDelegate: boolean
    underlying: string | null
    type: string
    totalSupply: string
    mintableByDao: boolean
  } | null
  tokenId: string
  amount: string
  epochStartAt: number
  lockExit: {
    status: boolean
    transactionHash: Hex | null
    blockNumber: number | null
    blockTimestamp: number | null
    exitDateAt: number | null
  }
  lockWithdraw: {
    status: boolean
    transactionHash: Hex | null
    blockNumber: number | null
    blockTimestamp: number | null
    amount: string
    epochEndAt: number | null
  }
}
