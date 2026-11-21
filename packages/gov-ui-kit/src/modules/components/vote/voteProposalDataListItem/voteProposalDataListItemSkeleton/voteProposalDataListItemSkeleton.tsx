import { DataList, type IDataListItemProps, StateSkeletonBar } from '../../../../../core';

export type IVoteProposalDataListItemSkeletonProps = IDataListItemProps;

export const VoteProposalDataListItemSkeleton: React.FC<IVoteProposalDataListItemSkeletonProps> = (props) => {
    const { ...otherProps } = props;

    return (
        <DataList.Item
            aria-busy="true"
            aria-label="loading"
            className="flex min-h-[68px] items-center gap-x-related--12-16 py-inset-tight--4-2 md:min-h-[93px]"
            tabIndex={0}
            {...otherProps}
        >
            <div className="flex w-full flex-col gap-y-tight--4-6">
                <StateSkeletonBar responsiveSize={{ md: 'lg' }} width="60%" />
                <div className="flex w-full gap-x-tight">
                    <StateSkeletonBar responsiveSize={{ md: 'lg' }} width="8%" />
                    <StateSkeletonBar responsiveSize={{ md: 'lg' }} width="8%" />
                    <StateSkeletonBar className="ml-group--fixed-20" responsiveSize={{ md: 'lg' }} width="10%" />
                </div>
            </div>
        </DataList.Item>
    );
};
