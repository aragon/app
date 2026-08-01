'use client';

import { DefinitionList, Tag } from '@aragon/gov-ui-kit';
import type { IDaoPermissionCondition } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';

/**
 * Renders the detail for a multisig `membership` condition (ListedCheckCondition).
 * The condition only gates proposal creation to listed members when the multisig
 * `onlyListed` setting is enabled, so that boolean is surfaced as
 * "Member of multisig".
 */
export const MembershipConditionSlot: React.FC<IDaoPermissionCondition> = ({
    onlyListed,
    minApprovals,
}) => {
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
            {minApprovals != null && (
                <DefinitionList.Item
                    term={t(
                        'app.settings.membershipConditionSlot.minApprovals',
                    )}
                >
                    {minApprovals}
                </DefinitionList.Item>
            )}
        </DefinitionList.Container>
    );
};
