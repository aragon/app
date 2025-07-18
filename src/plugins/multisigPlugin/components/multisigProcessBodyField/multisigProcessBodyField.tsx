'use client';

import type { ISetupBodyFormNew } from '@/modules/createDao/dialogs/setupBodyDialog';
import { useMemberListData } from '@/modules/governance/hooks/useMemberListData';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoPlugins } from '@/shared/hooks/useDaoPlugins';
import { PluginType } from '@/shared/types';
import { DefinitionList, type ICompositeAddress } from '@aragon/gov-ui-kit';
import type { IMultisigPluginSettings } from '../../types';
import type { IMultisigSetupGovernanceForm } from '../multisigSetupGovernance';
import type { IMultisigSetupMembershipForm } from '../multisigSetupMembership';

export interface IMultisigProcessBodyFieldProps {
    /**
     * The body to display the details for.
     */
    body: ISetupBodyFormNew<IMultisigSetupGovernanceForm, ICompositeAddress, IMultisigSetupMembershipForm>;
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Address of the plugin.
     */
    pluginAddress: string;
    /**
     * If the component field is read-only.
     * @default false
     */
    readOnly?: boolean;
}

export const MultisigProcessBodyField = (props: IMultisigProcessBodyFieldProps) => {
    const { body, daoId, pluginAddress, readOnly } = props;

    const { t } = useTranslations();
    const { membership, governance } = body;
    const baseTranslationKey = 'app.plugins.multisig.multisigProcessBodyField';

    const plugin = useDaoPlugins({ daoId, pluginAddress, type: PluginType.BODY, includeSubPlugins: true })![0];

    const { itemsCount } = useMemberListData({ queryParams: { daoId, pluginAddress } });

    const resolveGovernance = () => {
        if (readOnly) {
            return {
                minApprovals: (plugin.meta.settings as IMultisigPluginSettings).minApprovals,
            };
        }
        return {
            minApprovals: governance.minApprovals,
        };
    };

    const membersCount = readOnly ? (itemsCount ?? '-') : membership.members.length;
    const { minApprovals } = resolveGovernance();

    return (
        <DefinitionList.Container className="w-full">
            <DefinitionList.Item term={t(`${baseTranslationKey}.membersTerm`)}>
                {t(`${baseTranslationKey}.membersDefinition`, { count: membersCount })}
            </DefinitionList.Item>
            <DefinitionList.Item term={t(`${baseTranslationKey}.thresholdTerm`)}>
                {t(`${baseTranslationKey}.thresholdDefinition`, {
                    threshold: minApprovals,
                    count: membersCount,
                })}
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
