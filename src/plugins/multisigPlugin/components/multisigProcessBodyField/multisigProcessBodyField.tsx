'use client';

import { type ISetupBodyFormExisting, type ISetupBodyFormNew } from '@/modules/createDao/dialogs/setupBodyDialog';
import { BodyType } from '@/modules/createDao/types/enum';
import { useMemberList } from '@/modules/governance/api/governanceService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { DefinitionList, type ICompositeAddress } from '@aragon/gov-ui-kit';
import type { IMultisigSetupGovernanceForm } from '../multisigSetupGovernance';
import type { IMultisigSetupMembershipForm } from '../multisigSetupMembership';

export interface IMultisigProcessBodyFieldProps {
    /**
     * The body to display the details for.
     */
    body:
        | ISetupBodyFormNew<IMultisigSetupGovernanceForm, ICompositeAddress, IMultisigSetupMembershipForm>
        | ISetupBodyFormExisting<IMultisigSetupGovernanceForm, ICompositeAddress, IMultisigSetupMembershipForm>;
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export const MultisigProcessBodyField = (props: IMultisigProcessBodyFieldProps) => {
    const { body, daoId } = props;

    const { t } = useTranslations();
    const { membership, governance } = body;
    const isExisting = body.type === BodyType.EXISTING;

    const { minApprovals } = governance;
    const baseTranslationKey = 'app.plugins.multisig.multisigProcessBodyField';

    const initialParams = {
        queryParams: { daoId, pluginAddress: isExisting ? body.address : '' },
    };
    const { data: memberList } = useMemberList(initialParams, { enabled: isExisting });

    const membersCount = isExisting ? (memberList?.pages[0].metadata.totalRecords ?? '-') : membership.members.length;

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
