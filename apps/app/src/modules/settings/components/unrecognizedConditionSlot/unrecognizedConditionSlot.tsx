'use client';

import {
    addressUtils,
    ChainEntityType,
    DefinitionList,
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
        <div data-testid="unrecognized-condition">
            <DefinitionList.Container>
                <DefinitionList.Item
                    copyValue={conditionAddress}
                    link={
                        conditionUrl != null
                            ? { href: conditionUrl, isExternal: true }
                            : undefined
                    }
                    term={t('app.settings.permissionsList.details.condition')}
                >
                    {conditionAddress != null
                        ? addressUtils.truncateAddress(conditionAddress)
                        : '-'}
                </DefinitionList.Item>
            </DefinitionList.Container>
        </div>
    );
};
