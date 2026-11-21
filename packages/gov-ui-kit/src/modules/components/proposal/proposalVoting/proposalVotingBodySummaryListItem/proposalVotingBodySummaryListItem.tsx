import classNames from 'classnames';
import type { ReactNode } from 'react';
import { Avatar, AvatarIcon, DataListItem, IconType, type IDataListItemProps } from '../../../../../core';
import { useProposalVotingContext } from '../proposalVotingContext';
import type { IProposalVotingBodyBrand } from '../proposalVotingDefinitions';

export type IProposalVotingBodySummaryListItemProps = IDataListItemProps & {
    /**
     * ID of the body.
     */
    id: string;
    /**
     * Brand definitions of the body.
     */
    bodyBrand?: IProposalVotingBodyBrand;
    /**
     * Children of the component.
     */
    children?: ReactNode;
};

export const ProposalVotingBodySummaryListItem: React.FC<IProposalVotingBodySummaryListItemProps> = (props) => {
    const { id, children, bodyBrand, className, ...otherProps } = props;

    const { setActiveBody } = useProposalVotingContext();

    return (
        <DataListItem
            className={classNames(
                'flex items-center justify-between gap-group-stepped p-inset-surface-wide',
                className,
            )}
            onClick={() => setActiveBody?.(id)}
            {...otherProps}
        >
            <div className="flex grow items-center gap-x-related--8-12">
                {bodyBrand != null && <Avatar responsiveSize={{ md: 'md' }} size="sm" src={bodyBrand.logo} />}
                {children}
            </div>
            <AvatarIcon icon={IconType.CHEVRON_RIGHT} />
        </DataListItem>
    );
};
