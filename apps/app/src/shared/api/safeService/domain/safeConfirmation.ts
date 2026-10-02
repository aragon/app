import { isRecord } from './safeDomainUtils';

export interface ISafeConfirmation {
    /**
     * Checksummed address of the owner that confirmed the transaction.
     */
    owner: string;
    /**
     * Signature produced by the owner. Assembling these into an execution payload is out of
     * scope for the read path — never hand-roll the byte layout.
     */
    signature: string;
    /**
     * Transaction-service signature classification. Contract signatures carry a dynamic part and
     * must be identified before protocol-kit assembles execution bytes.
     */
    signatureType?: string;
    /**
     * ISO date the confirmation was submitted.
     */
    submissionDate: string;
}

export const isSafeConfirmation = (
    value: unknown,
): value is ISafeConfirmation =>
    isRecord(value) &&
    typeof value.owner === 'string' &&
    typeof value.signature === 'string' &&
    (typeof value.signatureType === 'string' ||
        value.signatureType === undefined) &&
    typeof value.submissionDate === 'string';
