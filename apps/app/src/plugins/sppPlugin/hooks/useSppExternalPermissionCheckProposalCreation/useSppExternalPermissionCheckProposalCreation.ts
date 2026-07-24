import { addressUtils } from '@aragon/gov-ui-kit';
import type {
    IPermissionCheckGuardParams,
    IPermissionCheckGuardResult,
} from '@/modules/governance/types';
import { useTranslations } from '@/shared/components/translationsProvider';
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
    const { plugin } = params;

    const { t } = useTranslations();

    const externalBody = plugin as unknown as ISppStagePluginExternal;

    const isSafeProposalCreator =
        externalBody.brandId === VotingBodyBrandIdentity.SAFE &&
        externalBody.proposalCreationConditionAddress != null;

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
                        'app.plugins.spp.sppPermissionCheckProposalCreation.pluginLabelName',
                    ),
                    definition: addressUtils.truncateAddress(
                        externalBody.address,
                    ),
                },
                {
                    term: t(
                        'app.plugins.spp.sppPermissionCheckProposalCreation.function',
                    ),
                    definition: t(
                        'app.plugins.spp.sppPermissionCheckProposalCreation.requirement',
                    ),
                },
            ],
        ],
    };
};
