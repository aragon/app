'use client';

import { DefinitionList } from '@aragon/gov-ui-kit';
import type { IConditionData } from '@/modules/settings/types';
import { useTranslations } from '@/shared/components/translationsProvider';

// TODO(APP-953): wire the real VotingPower condition data source. The spike
// confirmed no in-repo VotingPower payload exists yet, so this slot renders a
// placeholder until the data source lands.
export const VotingPowerConditionSlot: React.FC<IConditionData> = (props) => {
    const { conditionType } = props;
    const { t } = useTranslations();

    return (
        <DefinitionList.Container>
            <DefinitionList.Item
                term={t('app.settings.votingPowerConditionSlot.type')}
            >
                {conditionType}
            </DefinitionList.Item>
            <DefinitionList.Item
                term={t('app.settings.votingPowerConditionSlot.details')}
            >
                {t('app.settings.votingPowerConditionSlot.pending')}
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
