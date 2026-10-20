import { addressUtils, ChainEntityType } from '@aragon/gov-ui-kit';
import type {
    IPermissionCheckGuardParams,
    IPermissionCheckGuardResult,
} from '@/modules/governance/types';
import { type IDaoPlugin, PluginInterfaceType } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { VotingBodyBrandIdentity } from '../../types';

export interface IUseSppExternalPermissionCheckProposalCreationParams
    extends IPermissionCheckGuardParams {}

/**
 * Permission check for canonical and external Safe SPP stage descriptors.
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
    const body = plugin as IDaoPlugin & {
        brandId?: VotingBodyBrandIdentity;
    };
    const isSafeProposalCreator =
        (body.interfaceType === PluginInterfaceType.SAFE ||
            body.brandId === VotingBodyBrandIdentity.SAFE) &&
        body.proposalCreationConditionAddress != null;

    const { buildEntityUrl } = useDaoChain({ daoId });
    const addressLink = buildEntityUrl({
        type: ChainEntityType.ADDRESS,
        id: body.address,
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
                    definition: addressUtils.truncateAddress(body.address),
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
