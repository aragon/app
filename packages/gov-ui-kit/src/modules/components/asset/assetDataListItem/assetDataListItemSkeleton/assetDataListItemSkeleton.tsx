import classNames from 'classnames';
import type React from 'react';
import { DataList, type IDataListItemProps } from '../../../../../core';
import { StateSkeletonBar } from '../../../../../core/components/states/stateSkeletonBar';
import { StateSkeletonCircular } from '../../../../../core/components/states/stateSkeletonCircular';

export type IAssetDataListItemSkeletonProps = IDataListItemProps;

export const AssetDataListItemSkeleton: React.FC<IAssetDataListItemSkeletonProps> = (props) => {
    const { className, ...otherProps } = props;

    return (
        <DataList.Item
            aria-busy="true"
            aria-label="loading"
            className={classNames(
                'flex min-h-[70px] w-full items-center gap-x-related gap-y-group bg-surface-primary py-inset-item md:min-h-[88.5px]',
                className,
            )}
            tabIndex={0}
            {...otherProps}
        >
            <StateSkeletonCircular responsiveSize={{ md: 'lg' }} />
            <div className="flex w-full justify-between">
                <div className="flex w-full flex-col gap-y-tight--4-6">
                    <StateSkeletonBar className="shrink-0" responsiveSize={{ md: 'lg' }} width="100%" />
                    <div className="flex size-full items-center justify-start md:w-1/2">
                        <StateSkeletonBar responsiveSize={{ md: 'lg' }} width="50%" />
                    </div>
                </div>
                <div className="flex w-full flex-col items-end gap-y-tight--4-6">
                    <StateSkeletonBar responsiveSize={{ md: 'lg' }} width="40%" />
                    <StateSkeletonBar responsiveSize={{ md: 'lg' }} width="33%" />
                </div>
            </div>
        </DataList.Item>
    );
};
