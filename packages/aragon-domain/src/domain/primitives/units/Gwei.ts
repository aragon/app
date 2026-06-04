import BigNumber from 'bignumber.js';
import { ValueObject } from 'ddd-core-ts';
import { Ether } from './Ether';
import type { EVMUnit } from './EVMUnit';
import { Wei } from './Wei';

interface GweiProps {
  gweiValue: BigNumber;
}

export class Gwei extends ValueObject<GweiProps> implements EVMUnit {
  public toBigNumber(): BigNumber {
    return this.props.gweiValue;
  }

  public toWei(): Wei {
    const { gweiValue } = this.props;
    const conversionRate = new BigNumber(10).pow(9);
    const weiValue = gweiValue.times(conversionRate);
    return Wei.create(weiValue);
  }

  public toGwei(): Gwei {
    return this;
  }

  public toEther(): Ether {
    const { gweiValue } = this.props;
    const conversionRate = new BigNumber(10).pow(-9);
    const etherValue = gweiValue.times(conversionRate);
    return Ether.create(etherValue);
  }

  /**
   * Adds this value to another value.
   * @param other The other value to add to.
   */
  public plus(other: Gwei): Gwei {
    const thisValue = this.props.gweiValue;
    const otherValue = other.toBigNumber();
    const totalValue = thisValue.plus(otherValue);
    return Gwei.create(totalValue);
  }

  /**
   * Multiplies our value in gwei with a big number. Returns the value in Gwei.
   * @param bigNumber The big number to multiply our value with.
   */
  public times(bigNumber: BigNumber): Gwei {
    const thisValue = this.props.gweiValue;
    const totalValue = thisValue.times(bigNumber);
    return Gwei.create(totalValue);
  }

  public static create(gweiValue: BigNumber): Gwei {
    return new Gwei({ gweiValue });
  }
}
