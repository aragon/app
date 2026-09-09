'use client';

import {
    AddressOutput,
    ChainEntityType,
    useBlockExplorer,
} from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IAllowedActionView } from './executeSelectorConditionSlotUtils';
import { EMPTY_ALLOWED_ACTION_VALUE } from './executeSelectorConditionSlotUtils';

export interface IAllowedActionsListProps {
    actions: IAllowedActionView[];
    chainId?: number;
}

export const AllowedActionsList: React.FC<IAllowedActionsListProps> = ({
    actions,
    chainId,
}) => {
    const { t } = useTranslations();
    const { buildEntityUrl } = useBlockExplorer({ chainId });

    return (
        <div className="flex flex-col">
            {actions.map((action) => (
                <div
                    className="flex min-w-0 flex-col gap-1 border-neutral-100 border-b py-3 first:pt-0 last:border-b-0 last:pb-0"
                    key={action.id}
                >
                    <div className="flex min-w-0 items-center gap-2.5 leading-normal">
                        <span className="truncate text-neutral-800">
                            {action.functionName ??
                                action.selector ??
                                t(
                                    'app.settings.executeSelectorConditionSlot.anySelector',
                                )}
                        </span>
                        {action.selector != null && (
                            <span className="shrink-0 text-neutral-500">
                                {action.selector}
                            </span>
                        )}
                    </div>
                    <div className="flex min-w-0 items-center gap-2.5 text-neutral-500 leading-normal">
                        <span className="truncate">
                            {action.contractName ??
                                t(
                                    'app.settings.executeSelectorConditionSlot.unknownContract',
                                )}
                        </span>
                        {action.target === EMPTY_ALLOWED_ACTION_VALUE ? (
                            <span className="shrink-0">
                                {EMPTY_ALLOWED_ACTION_VALUE}
                            </span>
                        ) : (
                            <span className="w-fit shrink-0">
                                <AddressOutput
                                    address={action.target}
                                    href={buildEntityUrl({
                                        type: ChainEntityType.ADDRESS,
                                        id: action.target,
                                    })}
                                />
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
