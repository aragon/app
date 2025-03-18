import { initialiseEagleOps } from "./ethereum-mainnet-0x9c25a6b1bf3F6Fd2F68a62169c043045C2460482"
import { initialiseAragonFoundation } from './ethereum-mainnet-0xB2EcFF866C75c640F335AFbE5b09D5B03d464362';

export const initialiseDaos = () => {
    initialiseAragonFoundation();
    initialiseEagleOps();
};
