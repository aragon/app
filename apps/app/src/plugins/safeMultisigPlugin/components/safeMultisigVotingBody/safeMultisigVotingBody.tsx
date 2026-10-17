import { type IDefinitionSetting, ProposalVoting } from '@aragon/gov-ui-kit';
import type { ReactNode } from 'react';

export interface ISafeMultisigVotingBodyProps {
    /** Shared Safe approval breakdown, including any body action. */
    breakdown: ReactNode;
    /** Shared Safe confirmation list. */
    votes: ReactNode;
    /** Shared Safe settings/details rows. */
    settings: IDefinitionSetting[];
}

/**
 * SPP-independent Safe voting body presentation.
 *
 * SPP supplies its slot adapters as content; native Safe transactions supply the same presentation
 * with their verified transaction state. Keeping the tab composition here prevents the two flows
 * from drifting while neither caller needs to construct an SPP proposal or stage.
 */
export const SafeMultisigVotingBody: React.FC<ISafeMultisigVotingBodyProps> = (
    props,
) => {
    const { breakdown, settings, votes } = props;

    return (
        <>
            {breakdown}
            <ProposalVoting.Votes>{votes}</ProposalVoting.Votes>
            <ProposalVoting.Details settings={settings} />
        </>
    );
};
