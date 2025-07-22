'use client';

import {
    SetupBodyType,
    type ISetupBodyFormExisting,
    type ISetupBodyFormNew,
} from '@/modules/createDao/dialogs/setupBodyDialog';
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
    /**
     * If the component field is read-only.
     * @default false
     */
    readOnly?: boolean;
}

export const MultisigProcessBodyField = (props: IMultisigProcessBodyFieldProps) => {
    const { body, daoId, readOnly } = props;

    const { t } = useTranslations();
    const { membership, governance } = body;

    const { minApprovals } = governance;
    const baseTranslationKey = 'app.plugins.multisig.multisigProcessBodyField';

    const initialParams = {
        queryParams: { daoId, pluginAddress: body.type === SetupBodyType.EXISTING ? body.address : '' },
    };
    const { data: memberList } = useMemberList(initialParams, { enabled: body.type === SetupBodyType.EXISTING });

    const membersCount = readOnly ? (memberList?.pages[0].metadata.totalRecords ?? '-') : membership.members.length;

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
