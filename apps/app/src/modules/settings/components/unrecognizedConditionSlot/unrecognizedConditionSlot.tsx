'use client';

import {
    addressUtils,
    ChainEntityType,
    Clipboard,
    Icon,
    IconType,
    Link,
    useBlockExplorer,
} from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IUnrecognizedConditionSlotProps {
    chainId?: number;
    conditionAddress?: string;
}

export const UnrecognizedConditionSlot: React.FC<
    IUnrecognizedConditionSlotProps
> = (props) => {
    const { chainId, conditionAddress } = props;
    const { t } = useTranslations();
    const { buildEntityUrl } = useBlockExplorer({ chainId });

    const conditionUrl =
        conditionAddress != null
            ? buildEntityUrl({
                  type: ChainEntityType.ADDRESS,
                  id: conditionAddress,
              })
            : undefined;

    return (
        <div className="flex flex-col gap-4 rounded-xl border border-neutral-100 bg-neutral-0 p-6 shadow-neutral-sm">
            <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 flex-col gap-2">
                    <p className="text-neutral-800 text-xl leading-tight">
                        {t('app.settings.unrecognizedConditionSlot.heading')}
                    </p>
                    <p className="text-neutral-500 leading-normal">
                        {t(
                            'app.settings.unrecognizedConditionSlot.description',
                        )}
                    </p>
                </div>
                <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-neutral-50">
                    <Icon
                        className="text-primary-500"
                        icon={IconType.SETTINGS}
                        size="lg"
                    />
                </div>
            </div>
            {conditionAddress != null && (
                <div className="flex min-w-0 items-center justify-between gap-3 border-neutral-100 border-t pt-4">
                    <span className="shrink-0 text-neutral-800">
                        {t('app.settings.permissionsList.details.condition')}
                    </span>
                    <div className="min-w-0">
                        <Clipboard copyValue={conditionAddress}>
                            <Link
                                className="w-fit"
                                href={conditionUrl}
                                isExternal={conditionUrl != null}
                            >
                                {addressUtils.truncateAddress(conditionAddress)}
                            </Link>
                        </Clipboard>
                    </div>
                </div>
            )}
        </div>
    );
};
