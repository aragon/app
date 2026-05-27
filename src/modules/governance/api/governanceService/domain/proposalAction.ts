import type {
    IProposalAction as IGukProposalAction,
    IProposalActionUpdateMetadataDaoMetadata,
} from '@aragon/gov-ui-kit';

export interface IProposalAction extends IGukProposalAction {
    /**
     * Input data of the proposal action. Extends the gov-ui-kit definition with optional decoded sub-actions emitted
     * by the backend for one-level-deep wrappers like `createProposal` and `execute`.
     */
    inputData:
        | (NonNullable<IGukProposalAction['inputData']> & {
              /**
               * Decoded sub-actions of a wrapper action. Only populated for `createProposal`/`execute` outer actions.
               */
              actions?: IProposalAction[];
          })
        | null;
    /**
     * Resolved metadata object attached to outer `createProposal` actions (parsed from IPFS by the backend).
     */
    metadata?: IProposalActionUpdateMetadataDaoMetadata;
}
