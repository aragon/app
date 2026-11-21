import type { ComponentProps } from 'react';
import { Accordion, invariant } from '../../../../../core';
import { useGukModulesContext } from '../../../gukModulesProvider';
import type { ProposalStatus } from '../../proposalUtils';
import { type IProposalVotingContextProviderProps, ProposalVotingContextProvider } from '../proposalVotingContext';
import { ProposalVotingStatus } from '../proposalVotingStatus';

export interface IProposalVotingStageProps
    extends Pick<IProposalVotingContextProviderProps, 'bodyList'>,
        ComponentProps<'div'> {
    /**
     * Status of the stage.
     */
    status: ProposalStatus;
    /**
     * Start date of the stage in timestamp or ISO format.
     */
    startDate?: number | string;
    /**
     * End date of the stage in timestamp or ISO format.
     */
    endDate?: number | string;
    /**
     * Name of the proposal stage.
     */
    name: string;
    /**
     * Index of the stage set automatically by the ProposalVotingStageContainer component.
     */
    index?: number;
    /**
     * Min advance date of the proposal in timestamp or ISO format.
     */
    minAdvance?: string | number;
    /**
     * Max advance date of the proposal in timestamp or ISO format.
     */
    maxAdvance?: string | number;
}

export const ProposalVotingStage: React.FC<IProposalVotingStageProps> = (props) => {
    const {
        name,
        status,
        startDate,
        endDate,
        index,
        children,
        className,
        bodyList,
        minAdvance,
        maxAdvance,
        ...otherProps
    } = props;

    const { copy } = useGukModulesContext();

    invariant(
        index != null,
        'ProposalVotingStage: component must be used inside a ProposalVotingStageContainer to work properly.',
    );

    return (
        <ProposalVotingContextProvider bodyList={bodyList}>
            <Accordion.Item value={index.toString()} {...otherProps}>
                <Accordion.ItemHeader>
                    <div className="flex grow flex-row justify-between gap-group-stepped">
                        <div className="flex flex-col items-start gap-tight">
                            <p className="text-lg leading-tight font-normal text-neutral-800">{name}</p>
                            <ProposalVotingStatus
                                endDate={endDate}
                                isMultiStage={true}
                                maxAdvance={maxAdvance}
                                minAdvance={minAdvance}
                                status={status}
                            />
                        </div>
                        <p className="mt-tight text-sm leading-tight font-normal text-neutral-500">
                            {copy.proposalVotingStage.stage(index + 1)}
                        </p>
                    </div>
                </Accordion.ItemHeader>
                <Accordion.ItemContent>{children}</Accordion.ItemContent>
            </Accordion.Item>
        </ProposalVotingContextProvider>
    );
};
