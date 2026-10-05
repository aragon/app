import type { Ether } from './Ether';
import type { Gwei } from './Gwei';
import type { Wei } from './Wei';

export interface EVMUnit {
  toWei: () => Wei;
  toGwei: () => Gwei;
  toEther: () => Ether;
}
