import { ProposalStatus, ProposalVotingStatus } from '@aragon/ods';

export enum SppStageStatus {
    VETOED = ProposalStatus.VETOED,
    REJECTED = ProposalStatus.REJECTED,
    EXPIRED = ProposalStatus.EXPIRED,
    ACCEPTED = ProposalStatus.ACCEPTED,
    PENDING = ProposalStatus.PENDING,
    ACTIVE = ProposalStatus.ACTIVE,
    INACTIVE = ProposalVotingStatus.UNREACHED, // map inactive to unreached until we change in ODS
}
