import classNames from 'classnames';
import type { ComponentProps } from 'react';
import { Card } from '../../../../../core';
import type { ProposalStatus } from '../../proposalUtils';
import { type IProposalVotingContextProviderProps, ProposalVotingContextProvider } from '../proposalVotingContext';
import { ProposalVotingStatus } from '../proposalVotingStatus';

export interface IProposalVotingContainerProps
    extends Pick<IProposalVotingContextProviderProps, 'bodyList'>,
        ComponentProps<'div'> {
    /**
     * Status of the proposal.
     */
    status: ProposalStatus;
    /**
     * End date of the proposal in timestamp or ISO format.
     */
    endDate?: number | string;
}

export const ProposalVotingContainer: React.FC<IProposalVotingContainerProps> = (props) => {
    const { status, bodyList, endDate, className, children, ...otherProps } = props;

    return (
        <ProposalVotingContextProvider bodyList={bodyList}>
            <Card
                className={classNames('flex w-full flex-col gap-group--12-16 overflow-hidden', className)}
                inset="surface"
                {...otherProps}
            >
                <ProposalVotingStatus endDate={endDate} isMultiStage={false} status={status} />
                {children}
            </Card>
        </ProposalVotingContextProvider>
    );
};
