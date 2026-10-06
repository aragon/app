import { ValueObject } from 'ddd-core-ts';
import { z } from 'zod';

const UUIDPropsSchema = z.object({
    uuidValue: z.string().uuid('uuidValue must be a valid UUID string'),
});

type UUIDProps = z.infer<typeof UUIDPropsSchema>;

export class UUID extends ValueObject<UUIDProps> {
    /**
     * @returns A lower case string representation of the UUID.
     */
    toString(): string {
        return this.props.uuidValue.toLowerCase();
    }

    equals(other: UUID): boolean {
        return (
            this.props.uuidValue.toLowerCase() ===
            other.props.uuidValue.toLowerCase()
        );
    }

    static create(props: UUIDProps): UUID {
        const validatedProps = UUIDPropsSchema.parse(props);
        return new UUID(validatedProps);
    }
}
