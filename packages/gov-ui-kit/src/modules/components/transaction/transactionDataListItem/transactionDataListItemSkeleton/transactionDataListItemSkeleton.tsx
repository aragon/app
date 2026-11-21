import classNames from 'classnames';
import { DataList, type IDataListItemProps, StateSkeletonBar, StateSkeletonCircular } from '../../../../../core';

export type ITransactionDataListItemSkeletonProps = IDataListItemProps;

export const TransactionDataListItemSkeleton: React.FC<ITransactionDataListItemSkeletonProps> = (props) => {
    const { className, ...otherProps } = props;

    return (
        <DataList.Item
            aria-busy="true"
            aria-label="loading"
            className={classNames(
                'flex min-h-[67.5px] w-full items-center justify-between gap-x-related border border-neutral-0 py-inset-item-flat--fixed-16 md:min-h-[88.5px]',
                className,
            )}
            tabIndex={0}
            {...otherProps}
        >
            <StateSkeletonCircular responsiveSize={{ md: 'md' }} size="sm" />
            <div className="flex w-full items-center gap-x-related--12-16">
                <div className="flex w-full flex-col items-start gap-y-tight md:w-3/4">
                    <StateSkeletonBar responsiveSize={{ md: 'xl' }} width="100%" />
                    <StateSkeletonBar responsiveSize={{ md: 'lg' }} width="50%" />
                </div>
            </div>

            <div className="flex w-3/4 flex-col items-end gap-y-tight md:w-1/3">
                <StateSkeletonBar responsiveSize={{ md: 'xl' }} width="70%" />
                <StateSkeletonBar responsiveSize={{ md: 'lg' }} width="50%" />
            </div>
        </DataList.Item>
    );
};
