import BigNumber from 'bignumber.js';
import { ValueObject } from 'ddd-core-ts';
import type { EVMUnit } from './EVMUnit';
import { Gwei } from './Gwei';
import { Wei } from './Wei';

interface EtherProps {
  etherValue: BigNumber;
}

export class Ether extends ValueObject<EtherProps> implements EVMUnit {
  public toBigNumber(): BigNumber {
    return this.props.etherValue;
  }

  public toWei(): Wei {
    const { etherValue } = this.props;
    const conversionRate = new BigNumber(10).pow(18);
    const weiValue = etherValue.times(conversionRate);
    return Wei.create(weiValue);
  }

  public toGwei(): Gwei {
    const { etherValue } = this.props;
    const conversionRate = new BigNumber(10).pow(9);
    const gweiValue = etherValue.times(conversionRate);
    return Gwei.create(gweiValue);
  }

  public toEther(): Ether {
    return this;
  }

  /**
   * Adds this value to another value.
   * @param other The other value to add to.
   */
  public plus(other: Ether): Ether {
    const thisValue = this.props.etherValue;
    const otherValue = other.toBigNumber();
    const totalValue = thisValue.plus(otherValue);
    return Ether.create(totalValue);
  }

  /**
   * Multiplies our value in ether with a big number. Returns the value in Ether.
   * @param bigNumber The big number to multiply our value with.
   */
  public times(bigNumber: BigNumber): Ether {
    const thisValue = this.props.etherValue;
    const totalValue = thisValue.times(bigNumber);
    return Ether.create(totalValue);
  }

  public static create(etherValue: BigNumber): Ether {
    return new Ether({ etherValue });
  }
}
