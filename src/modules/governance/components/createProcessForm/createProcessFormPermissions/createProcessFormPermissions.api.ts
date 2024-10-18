export type EligibleType = 'bodies' | 'any';

type BodyGovernanceType = 'tokenVoting' | 'multisig';

interface BaseBody {
    bodyNameField: string;
    bodySummaryField: string;
    bodyGovernanceTypeField: BodyGovernanceType;
}

interface TokenBody extends BaseBody {
    bodyGovernanceTypeField: 'tokenVoting';
    tokenNameField: string;
    tokenSymbolField: string;
    tokenTotalSupplyField: string;
}

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
    selectedBodies: Body[];
}

export interface IVotingBodyCheckboxCardProps {
    body: Body;
    values: Body[];
}
