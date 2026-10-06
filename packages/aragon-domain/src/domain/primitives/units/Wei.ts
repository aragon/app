import BigNumber from 'bignumber.js';
import { ValueObject } from 'ddd-core-ts';

import { Ether } from './Ether';
import type { EVMUnit } from './EVMUnit';
import { Gwei } from './Gwei';

interface WeiProps {
    weiValue: BigNumber;
}

export class Wei extends ValueObject<WeiProps> implements EVMUnit {
    toBigNumber(): BigNumber {
        return this.props.weiValue;
    }

    toWei(): Wei {
        return this;
    }

    toGwei(): Gwei {
        const { weiValue } = this.props;
        const conversionRate = new BigNumber(10).pow(-9);
        const gweiValue = weiValue.times(conversionRate);

        return Gwei.create(gweiValue);
    }

    toEther(): Ether {
        const { weiValue } = this.props;
        const conversionRate = new BigNumber(10).pow(-18);
        const etherValue = weiValue.times(conversionRate);

        return Ether.create(etherValue);
    }

    /**
     * Value-based equality: the inherited shallow props comparison would
     * compare the inner BigNumber by reference, so compare numerically.
     */
    equals(other?: Wei): boolean {
        if (!other) {
            return false;
        }
        return this.props.weiValue.isEqualTo(other.toBigNumber());
    }

    /**
     * Adds this value to another value.
     * @param other The other value to add to.
     */
    plus(other: Wei): Wei {
        const thisValue = this.props.weiValue;
        const otherValue = other.toBigNumber();
        const totalValue = thisValue.plus(otherValue);
        return Wei.create(totalValue);
    }

    /**
     * Multiplies our value in wei with a big number. Returns the value in Wei.
     * @param bigNumber The big number to multiply our value with.
     */
    times(bigNumber: BigNumber): Wei {
        const thisValue = this.props.weiValue;
        const totalValue = thisValue.times(bigNumber);
        return Wei.create(totalValue);
    }

    static create(weiValue: BigNumber): Wei {
        return new Wei({ weiValue });
    }
}
