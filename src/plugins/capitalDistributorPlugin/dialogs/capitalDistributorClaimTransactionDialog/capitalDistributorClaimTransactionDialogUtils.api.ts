import type { Hex } from "viem";

export interface IBuildClaimTransactionParams {
  /**
   * The ID of the campaign to claim.
   */
  campaignId: number;
  /**
   * The address of the recipient.
   */
  recipient: Hex;
  /**
   * The address of the plugin to use for the claim.
   */
  pluginAddress: Hex;
  /**
   * Additional data for the transaction.
   */
  auxData?: Hex;
}
