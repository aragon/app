import BigNumber from 'bignumber.js';
import { ValueObject } from 'ddd-core-ts';
import { Ether } from './Ether';
import type { EVMUnit } from './EVMUnit';
import { Wei } from './Wei';

interface GweiProps {
    gweiValue: BigNumber;
}

export class Gwei extends ValueObject<GweiProps> implements EVMUnit {
    toBigNumber(): BigNumber {
        return this.props.gweiValue;
    }

    toWei(): Wei {
        const { gweiValue } = this.props;
        const conversionRate = new BigNumber(10).pow(9);
        const weiValue = gweiValue.times(conversionRate);
        return Wei.create(weiValue);
    }

    toGwei(): Gwei {
        return this;
    }

    toEther(): Ether {
        const { gweiValue } = this.props;
        const conversionRate = new BigNumber(10).pow(-9);
        const etherValue = gweiValue.times(conversionRate);
        return Ether.create(etherValue);
    }

    /**
     * Value-based equality: the inherited shallow props comparison would
     * compare the inner BigNumber by reference, so compare numerically.
     */
    equals(other?: Gwei): boolean {
        if (!other) {
            return false;
        }
        return this.props.gweiValue.isEqualTo(other.toBigNumber());
    }

    /**
     * Adds this value to another value.
     * @param other The other value to add to.
     */
    plus(other: Gwei): Gwei {
        const thisValue = this.props.gweiValue;
        const otherValue = other.toBigNumber();
        const totalValue = thisValue.plus(otherValue);
        return Gwei.create(totalValue);
    }

    /**
     * Multiplies our value in gwei with a big number. Returns the value in Gwei.
     * @param bigNumber The big number to multiply our value with.
     */
    times(bigNumber: BigNumber): Gwei {
        const thisValue = this.props.gweiValue;
        const totalValue = thisValue.times(bigNumber);
        return Gwei.create(totalValue);
    }

    static create(gweiValue: BigNumber): Gwei {
        return new Gwei({ gweiValue });
    }
}
