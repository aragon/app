import { addressUtils } from '@aragon/gov-ui-kit';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
import type {
    IPermissionCheckGuardParams,
    IPermissionCheckGuardResult,
} from '@/modules/governance/types';
import { useSafeInfo } from '@/shared/api/safeService';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IUseSafeMultisigVotePermissionCheckParams
    extends IPermissionCheckGuardParams {}

const translationKey =
    'app.plugins.safeMultisig.safeMultisigVotePermissionCheck';

/**
 * Who may report this body's result: an owner of the Safe, as the Safe itself defines ownership
 * right now. Owners and the threshold can change while a report sits in the queue, so the answer
 * comes from live account data rather than anything captured when the proposal was created.
 *
 * Reported through the standard permission guard so an ineligible or disconnected wallet gets the
 * same dialog as every other body, instead of a plugin-specific message beside the action.
 */
export const useSafeMultisigVotePermissionCheck = (
    params: IUseSafeMultisigVotePermissionCheckParams,
): IPermissionCheckGuardResult => {
    const { plugin, proposal } = params;

    const { t } = useTranslations();
    const { address } = useWalletAccount();

    const { data: safeInfo, isLoading } = useSafeInfo({
        urlParams: { network: proposal!.network, address: plugin.address },
    });

    const isOwner =
        address != null &&
        safeInfo?.owners.some((owner) =>
            addressUtils.isAddressEqual(owner, address),
        ) === true;

    const settings = [
        {
            term: t(`${translationKey}.ownership`),
            definition: t(`${translationKey}.ownerOnly`),
        },
    ];

    return {
        hasPermission: isOwner,
        settings: [settings],
        isLoading,
        isRestricted: true,
    };
};
