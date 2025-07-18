import type { IDaoPlugin } from '@/shared/api/daoService';
import { daoUtils } from '@/shared/utils/daoUtils';
import { DataList, type IDataListItemProps } from '@aragon/gov-ui-kit';
import classNames from 'classnames';

export type IProcessDataListItemProps = IDataListItemProps & {
    /**
     * Process to display the details for.
     */
    process: IDaoPlugin;
    /**
     * Renders the
     */
    isActive?: boolean;
};

export const ProcessDataListItem: React.FC<IProcessDataListItemProps> = (props) => {
    const { process, isActive, className, ...otherProps } = props;

    const { address, processKey, description } = process;

    return (
        <DataList.Item
            key={address}
            className={classNames('px-4 py-3 md:p-6', {
                'border-primary-400 shadow-primary hover:border-primary-400 hover:shadow-primary': isActive,
            })}
            {...otherProps}
        >
            <div className="flex flex-col gap-y-1">
                <div className="flex gap-x-4">
                    <p className="line-clamp-1">{daoUtils.getPluginName(process)}</p>
                    {processKey && <p className="text-right text-neutral-500 uppercase">{processKey}</p>}
                </div>
                {description && <p className="line-clamp-2 text-neutral-500">{description}</p>}
            </div>
        </DataList.Item>
    );
};
