export type EligibleType = 'bodies' | 'any';

type BodyGovernanceType = 'tokenVoting' | 'multisig';

// Base interface for all body types
interface BaseBody {
    bodyNameField: string;
    bodySummaryField: string;
    bodyGovernanceTypeField: BodyGovernanceType;
}

// Interface for token-based body
interface TokenBody extends BaseBody {
    bodyGovernanceTypeField: 'tokenVoting';
    tokenNameField: string;
    tokenSymbolField: string;
    tokenTotalSupplyField: string;
}

// Interface for multisig body
interface MultisigBody extends BaseBody {
    bodyGovernanceTypeField: 'multisig';
    multisigMembersField: string[];
}

export type Body = TokenBody | MultisigBody;

export interface VotingBody extends TokenBody {
    minimumRequirement: number;
}

export interface PermissionsData {
    eligibleVoters: EligibleType;
    votingBodies: Body[];
}
