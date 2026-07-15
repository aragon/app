'use client';

import {
    addressUtils,
    CardEmptyState,
    ChainEntityType,
    DefinitionList,
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
        <div className="flex flex-col gap-3">
            <CardEmptyState
                description={t(
                    'app.settings.unrecognizedConditionSlot.description',
                )}
                heading={t('app.settings.unrecognizedConditionSlot.heading')}
                isStacked={false}
                objectIllustration={{ object: 'SETTINGS' }}
            />
            {conditionAddress != null && (
                <DefinitionList.Container>
                    <DefinitionList.Item
                        copyValue={conditionAddress}
                        term={t(
                            'app.settings.permissionsList.details.condition',
                        )}
                    >
                        <Link
                            className="w-fit"
                            href={conditionUrl}
                            isExternal={conditionUrl != null}
                        >
                            {addressUtils.truncateAddress(conditionAddress)}
                        </Link>
                    </DefinitionList.Item>
                </DefinitionList.Container>
            )}
        </div>
    );
};
