import type { AragonDomain } from '@aragon/aragon-domain';

type AragonDomainController = ReturnType<typeof AragonDomain.load>;

type GetMemberProfileTextRecordsResult = Awaited<
    ReturnType<AragonDomainController['getMemberProfileTextRecords']>
>;

/**
 * TEMPORARY module augmentation — delete when the app is bumped to the next
 * published aragon-domain version (the joint app-667 / app-610 release).
 *
 * The pinned snapshot (0.0.0-20260626160332) predates the package-side
 * re-export of the member-profile DTOs (present upstream and in v0.3.1+),
 * while v0.3.1 lacks `getTokenVotingMembership` — no published version
 * currently serves both consumers. The missing types exist in the snapshot's
 * declarations, they are just not re-exported, so they are derived here from
 * the exported controller surface rather than hand-written.
 */
declare module '@aragon/aragon-domain' {
    export type GetMemberProfileTextRecordsRequestDTO = Parameters<
        AragonDomainController['getMemberProfileTextRecords']
    >[0];

    export type MemberProfileTextRecordDTO = Extract<
        GetMemberProfileTextRecordsResult,
        { success: true }
    >['result'][number];
}
