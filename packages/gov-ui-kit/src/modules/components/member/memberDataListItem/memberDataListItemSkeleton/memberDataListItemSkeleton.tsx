import classNames from 'classnames';
import { DataList, type IDataListItemProps, StateSkeletonBar, StateSkeletonCircular } from '../../../../../core';

export type IMemberDataListItemSkeletonProps = IDataListItemProps;

export const MemberDataListItemSkeleton: React.FC<IMemberDataListItemSkeletonProps> = (props) => {
    const { className, ...otherProps } = props;

    return (
        <DataList.Item
            aria-busy="true"
            aria-label="loading"
            className={classNames(
                'flex min-h-[147.5px] flex-col items-start justify-center gap-y-related--12-16 bg-neutral-0 py-inset-item--16-24 md:min-h-[179px] md:min-w-44',
                className,
            )}
            tabIndex={0}
            {...otherProps}
        >
            <StateSkeletonCircular responsiveSize={{ md: 'md' }} size="sm" />
            <div className="flex w-2/3">
                <StateSkeletonBar responsiveSize={{ md: 'xl' }} size="lg" width="100%" />
            </div>
            <div className="flex w-full flex-col gap-y-related--8-10 md:w-5/6">
                <StateSkeletonBar width="50%" />
                <StateSkeletonBar width="40%" />
            </div>
        </DataList.Item>
    );
};
