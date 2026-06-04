import BigNumber from 'bignumber.js';
import { ValueObject } from 'ddd-core-ts';

import { Ether } from './Ether';
import type { EVMUnit } from './EVMUnit';
import { Gwei } from './Gwei';

interface WeiProps {
  weiValue: BigNumber;
}

export class Wei extends ValueObject<WeiProps> implements EVMUnit {
  public toBigNumber(): BigNumber {
    return this.props.weiValue;
  }

  public toWei(): Wei {
    return this;
  }

  public toGwei(): Gwei {
    const { weiValue } = this.props;
    const conversionRate = new BigNumber(10).pow(-9);
    const gweiValue = weiValue.times(conversionRate);

    return Gwei.create(gweiValue);
  }

  public toEther(): Ether {
    const { weiValue } = this.props;
    const conversionRate = new BigNumber(10).pow(-18);
    const etherValue = weiValue.times(conversionRate);

    return Ether.create(etherValue);
  }

  /**
   * Adds this value to another value.
   * @param other The other value to add to.
   */
  public plus(other: Wei): Wei {
    const thisValue = this.props.weiValue;
    const otherValue = other.toBigNumber();
    const totalValue = thisValue.plus(otherValue);
    return Wei.create(totalValue);
  }

  /**
   * Multiplies our value in wei with a big number. Returns the value in Wei.
   * @param bigNumber The big number to multiply our value with.
   */
  public times(bigNumber: BigNumber): Wei {
    const thisValue = this.props.weiValue;
    const totalValue = thisValue.times(bigNumber);
    return Wei.create(totalValue);
  }

  public static create(weiValue: BigNumber): Wei {
    return new Wei({ weiValue });
  }
}
