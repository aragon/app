'use client';

import { DefinitionList, Tag } from '@aragon/gov-ui-kit';
import type { IConditionData } from '@/modules/settings/types';
import { useTranslations } from '@/shared/components/translationsProvider';

/**
 * Renders the detail for a multisig `membership` condition (ListedCheckCondition).
 * The condition only gates proposal creation to listed members when the multisig
 * `onlyListed` setting is enabled, so that boolean is surfaced as
 * "Member of multisig".
 */
export const MembershipConditionSlot: React.FC<IConditionData> = (props) => {
    const { onlyListed } = props;
    const { t } = useTranslations();

    const isMemberGated = onlyListed === true;

    return (
        <DefinitionList.Container>
            <DefinitionList.Item
                term={t(
                    'app.settings.membershipConditionSlot.memberOfMultisig',
                )}
            >
                <span className="flex">
                    <Tag
                        label={t(
                            isMemberGated
                                ? 'app.settings.membershipConditionSlot.true'
                                : 'app.settings.membershipConditionSlot.false',
                        )}
                        variant="primary"
                    />
                </span>
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
