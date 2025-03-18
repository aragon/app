import { Network } from "@/shared/api/daoService";
import { pluginRegistryUtils } from "@/shared/utils/pluginRegistryUtils";
import { zeroAddress } from "viem";
import { HeaderTest } from "./headerTest";

const eagleOpsPlugin = {
  id: 'ethereum-mainnet-0x9c25a6b1bf3F6Fd2F68a62169c043045C2460482',
  name: 'EagleOps',
  installVersion: { release: 1, build: 2 },
      repositoryAddresses: {
          [Network.ARBITRUM_MAINNET]: zeroAddress,
          [Network.BASE_MAINNET]: zeroAddress,
          [Network.ETHEREUM_MAINNET]: zeroAddress,
          [Network.ETHEREUM_SEPOLIA]: '0x152c9E28995E418870b85cbbc0AEE4e53020edb2',
          [Network.POLYGON_MAINNET]: zeroAddress,
          [Network.ZKSYNC_MAINNET]: zeroAddress,
          [Network.ZKSYNC_SEPOLIA]: zeroAddress,
          [Network.PEAQ_MAINNET]: '0x86C87Aa7C09a447048adf4197fec7C12eF62A07F',
      },

}

export enum DaoSlotId {
  DASHBOARD_HEADER = 'DASHBOARD_HEADER',
}




export const initialiseEagleOps = () => {
  pluginRegistryUtils.registerPlugin(eagleOpsPlugin)

  .registerSlotComponent({
    slotId: DaoSlotId.DASHBOARD_HEADER,
    pluginId: eagleOpsPlugin.id,
    component: HeaderTest,
  })
};
