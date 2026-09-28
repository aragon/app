import { ValueObject } from 'ddd-core-ts';
import { getAddress } from 'viem';
import { z } from 'zod';
import { HexNumber } from '../math/HexNumber';
import type { HexString } from '../validation/ZodHexString';

const AddressPropsSchema = z.object({
    addressValue: z
        .instanceof(HexNumber)
        .refine(
            (value) => value.hasByteLength(20),
            'addressValue must be 20 bytes',
        ),
});

type AddressProps = z.infer<typeof AddressPropsSchema>;

export class Address extends ValueObject<AddressProps> {
    toHexNumber(): HexNumber {
        return this.props.addressValue;
    }

    /**
     * @returns A 0x-prefixed checksum-based hex string of the address (EIP-55).
     */
    toHexString(): HexString {
        return getAddress(this.props.addressValue.toHexString());
    }

    equals(other: Address): boolean {
        return this.toHexString() === other.toHexString();
    }

    static create(props: AddressProps): Address {
        const validatedProps = AddressPropsSchema.parse(props);
        return new Address(validatedProps);
    }

    /**
     * Creates an Address from a 0x-prefixed hex string.
     */
    static fromHexString(hex: HexString): Address {
        return Address.create({
            addressValue: HexNumber.create({ hexNumberValue: hex }),
        });
    }
}
