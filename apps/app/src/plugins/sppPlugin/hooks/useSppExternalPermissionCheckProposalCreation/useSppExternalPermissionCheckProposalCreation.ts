import { addressUtils, ChainEntityType } from '@aragon/gov-ui-kit';
import type {
    IPermissionCheckGuardParams,
    IPermissionCheckGuardResult,
} from '@/modules/governance/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import type { ISppStagePluginExternal } from '../../types';
import { VotingBodyBrandIdentity } from '../../types';

export interface IUseSppExternalPermissionCheckProposalCreationParams
    extends IPermissionCheckGuardParams {}

/**
 * Fallback for the GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION slot used for external SPP bodies,
 * which are not DAO plugins and therefore have no registered slot function.
 *
 * A Safe body can create proposals only when a SafeOwnerCondition was wired at process creation,
 * surfaced as `proposalCreationConditionAddress` on the stage body. When set, the body contributes a
 * Safe-multisig eligibility group; otherwise it contributes nothing.
 */
export const useSppExternalPermissionCheckProposalCreation = (
    params: IUseSppExternalPermissionCheckProposalCreationParams,
): IPermissionCheckGuardResult | undefined => {
    const { plugin, daoId } = params;

    const { t } = useTranslations();

    const externalBody = plugin as unknown as ISppStagePluginExternal;

    const isSafeProposalCreator =
        externalBody.brandId === VotingBodyBrandIdentity.SAFE &&
        externalBody.proposalCreationConditionAddress != null;

    const { buildEntityUrl } = useDaoChain({ daoId });
    const addressLink = buildEntityUrl({
        type: ChainEntityType.ADDRESS,
        id: externalBody.address,
    });

    if (!isSafeProposalCreator) {
        return undefined;
    }

    return {
        hasPermission: true,
        isLoading: false,
        isRestricted: true,
        settings: [
            [
                {
                    term: t(
                        'app.plugins.spp.sppExternalPermissionCheckProposalCreation.pluginLabelName',
                    ),
                    definition: addressUtils.truncateAddress(
                        externalBody.address,
                    ),
                    link: {
                        href: addressLink,
                        isExternal: true,
                    },
                },
                {
                    term: t(
                        'app.plugins.spp.sppExternalPermissionCheckProposalCreation.function',
                    ),
                    definition: t(
                        'app.plugins.spp.sppExternalPermissionCheckProposalCreation.requirement',
                    ),
                },
            ],
        ],
    };
};
