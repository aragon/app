import classNames from 'classnames';
import { DataList, DateFormat, formatterUtils, type IDataListItemProps, Tag } from '../../../../../core';
import { getTagVariant, type VoteIndicator } from '../../voteUtils';

export type IVoteProposalDataListItemStructureProps = IDataListItemProps & {
    /**
     * The ID of proposal.
     */
    proposalId: string;
    /**
     * The title of the proposal the user voted on.
     */
    proposalTitle: string;
    /**
     * The vote of the user.
     */
    voteIndicator: VoteIndicator;
    /**
     * Additional description for the vote indicator, displayed after the tag.
     */
    voteIndicatorDescription?: string;
    /**
     *  Date of the vote on the proposal in ISO format or as a timestamp
     */
    date?: number | string;
    /**
     * Defines if the voting is for vetoing the proposal or not.
     * @default false
     */
    isVeto?: boolean;
};

export const VoteProposalDataListItemStructure: React.FC<IVoteProposalDataListItemStructureProps> = (props) => {
    const {
        proposalTitle,
        proposalId,
        voteIndicator,
        voteIndicatorDescription,
        date,
        className,
        isVeto = false,
        ...otherProps
    } = props;

    return (
        <DataList.Item
            className={classNames(
                'flex min-w-0 flex-col justify-center gap-x-related--12-16 gap-y-tight--4-6 py-inset-item md:text-lg',
                className,
            )}
            {...otherProps}
        >
            <div className="flex w-full items-center gap-x-tight--4-6 leading-tight md:text-lg">
                <p className="max-w-full shrink-0 truncate text-neutral-500">{proposalId}</p>
                <p className="truncate text-neutral-800">{proposalTitle}</p>
            </div>
            <div className="flex items-center gap-x-group-stepped text-sm leading-tight text-neutral-500 md:text-base">
                <div className="flex items-center gap-x-tight--4-8">
                    <Tag
                        className="capitalize"
                        data-testid="tag"
                        label={voteIndicator}
                        variant={getTagVariant(voteIndicator, isVeto)}
                    />
                    {voteIndicatorDescription && <span className="whitespace-nowrap">{voteIndicatorDescription}</span>}
                </div>
                {date && <p className="mx-tight">{formatterUtils.formatDate(date, { format: DateFormat.RELATIVE })}</p>}
            </div>
        </DataList.Item>
    );
};
