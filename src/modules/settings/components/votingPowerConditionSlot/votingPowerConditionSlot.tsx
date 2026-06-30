'use client';

import { addressUtils, DefinitionList } from '@aragon/gov-ui-kit';
import type { IConditionData } from '@/modules/settings/types';
import { useTranslations } from '@/shared/components/translationsProvider';

const EMPTY_VALUE = '—';

const isNonEmptyString = (value: unknown): value is string =>
    typeof value === 'string' && value.length > 0;

const resolveMinVotingPower = (value: unknown): string => {
    if (isNonEmptyString(value)) {
        return value;
    }

    if (typeof value === 'number' || typeof value === 'bigint') {
        return value.toString();
    }

    return EMPTY_VALUE;
};

export const VotingPowerConditionSlot: React.FC<IConditionData> = (props) => {
    const { token, minVotingPower } = props;
    const { t } = useTranslations();

    const tokenLabel = isNonEmptyString(token)
        ? addressUtils.truncateAddress(token)
        : EMPTY_VALUE;
    const minVotingPowerLabel = resolveMinVotingPower(minVotingPower);

    return (
        <DefinitionList.Container>
            <DefinitionList.Item
                term={t('app.settings.votingPowerConditionSlot.token')}
            >
                {tokenLabel}
            </DefinitionList.Item>
            <DefinitionList.Item
                term={t('app.settings.votingPowerConditionSlot.minVotingPower')}
            >
                {minVotingPowerLabel}
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
