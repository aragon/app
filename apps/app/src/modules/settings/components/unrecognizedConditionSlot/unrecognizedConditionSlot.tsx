'use client';

import {
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
                    link={
                        conditionUrl != null
                            ? {
                                  href: conditionUrl,
                                  isExternal: true,
                                  isOnchainEntity: true,
                              }
                            : undefined
                    }
                    term={t('app.settings.permissionsList.details.condition')}
                >
                    {conditionAddress ?? '-'}
                </DefinitionList.Item>
            </DefinitionList.Container>
        </div>
    );
};
