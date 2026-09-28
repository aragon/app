'use client';

import {
    addressUtils,
    ChainEntityType,
    DefinitionList,
    formatterUtils,
    useBlockExplorer,
} from '@aragon/gov-ui-kit';
import { formatUnits } from 'viem';
import type { IDaoPermissionCondition } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { stringUtils } from '@/shared/utils/stringUtils';

const EMPTY_VALUE = '—';

// TODO(APP-953): source decimals from the token metadata (useToken) once the
// condition slot receives the token's chainId. Governance tokens are 18-decimal
// by convention, so default to that for now.
const DEFAULT_TOKEN_DECIMALS = 18;

interface IVotingPowerConditionSlotProps extends IDaoPermissionCondition {
    chainId?: number;
}

const formatMinVotingPower = (value: unknown): string => {
    if (
        typeof value !== 'string' &&
        typeof value !== 'number' &&
        typeof value !== 'bigint'
    ) {
        return EMPTY_VALUE;
    }

    if (typeof value === 'string' && value.length === 0) {
        return EMPTY_VALUE;
    }

    try {
        const amount = formatUnits(BigInt(value), DEFAULT_TOKEN_DECIMALS);

        return formatterUtils.formatNumber(amount) ?? amount;
    } catch {
        return EMPTY_VALUE;
    }
};

export const VotingPowerConditionSlot: React.FC<
    IVotingPowerConditionSlotProps
> = (props) => {
    const { chainId, token, minVotingPower } = props;
    const { t } = useTranslations();
    const { buildEntityUrl } = useBlockExplorer({ chainId });

    const tokenAddress =
        stringUtils.isNonEmptyString(token) && addressUtils.isAddress(token)
            ? token
            : undefined;
    const tokenUrl =
        tokenAddress != null
            ? buildEntityUrl({
                  type: ChainEntityType.ADDRESS,
                  id: tokenAddress,
              })
            : undefined;
    const minVotingPowerLabel = formatMinVotingPower(minVotingPower);

    return (
        <DefinitionList.Container>
            <DefinitionList.Item
                link={
                    tokenUrl != null
                        ? {
                              href: tokenUrl,
                              isExternal: true,
                              isOnchainEntity: true,
                          }
                        : undefined
                }
                term={t('app.settings.votingPowerConditionSlot.token')}
            >
                {tokenAddress ?? EMPTY_VALUE}
            </DefinitionList.Item>
            <DefinitionList.Item
                term={t('app.settings.votingPowerConditionSlot.minVotingPower')}
            >
                {minVotingPowerLabel}
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
