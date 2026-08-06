/**
 * Reasons returned by the canOverrideVote function of the Alchemix token-voting build when an account cannot
 * override its delegate's vote.
 */
export enum AlchemixOverrideErrReason {
    NONE = 0,
    PROPOSAL_NOT_OPEN = 1,
    VOTE_OPTION_NONE = 2,
    NO_VOTES = 3,
    CANNOT_OVERRIDE_SELF = 4,
    NO_DELEGATED_POWER = 5,
}
