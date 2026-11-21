import classNames from 'classnames';
import type React from 'react';
import { DataList, type IDataListItemProps, StateSkeletonBar, StateSkeletonCircular } from '../../../../../core';

export type IDaoDataListItemSkeletonProps = IDataListItemProps;

export const DaoDataListItemSkeleton: React.FC<IDaoDataListItemSkeletonProps> = (props) => {
    const { className, ...otherProps } = props;

    return (
        <DataList.Item
            aria-busy="true"
            aria-label="loading"
            className={classNames(
                'flex min-h-[173.5px] w-full flex-col justify-center gap-y-related--12-16 py-inset-item--16-24 md:min-h-[207px]',
                className,
            )}
            tabIndex={0}
            {...otherProps}
        >
            <div className="flex w-full justify-between">
                <div className="flex w-2/3 flex-col gap-y-related--fixed-10 text-neutral-800">
                    <StateSkeletonBar responsiveSize={{ md: 'xl' }} size="lg" width="100%" />
                    <StateSkeletonBar responsiveSize={{ md: 'lg' }} width="50%" />
                </div>
                <StateSkeletonCircular responsiveSize={{ md: 'lg' }} size="md" />
            </div>
            <div className="flex w-full flex-col gap-y-related--fixed-8">
                <StateSkeletonBar responsiveSize={{ md: 'lg' }} width="100%" />
                <StateSkeletonBar responsiveSize={{ md: 'lg' }} width="85%" />
            </div>
            <div className="flex w-3/4 justify-between text-neutral-400 md:w-1/2">
                <StateSkeletonBar responsiveSize={{ md: 'lg' }} width="50%" />
            </div>
        </DataList.Item>
    );
};
