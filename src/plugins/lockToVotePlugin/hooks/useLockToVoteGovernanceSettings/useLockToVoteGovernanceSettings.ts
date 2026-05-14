import type { IDefinitionSetting } from '@aragon/gov-ui-kit';
import type { IUseGovernanceSettingsParams } from '@/modules/settings/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { ISppProposal } from '../../../sppPlugin/types';
import type {
    ILockToVotePluginSettings,
    ILockToVoteProposal,
} from '../../types';
import { lockToVoteSettingsUtils } from '../../utils/lockToVoteSettingsUtils';

export interface IUseLockToVoteGovernanceSettingsParams
    extends IUseGovernanceSettingsParams<ILockToVotePluginSettings> {
    /**
     * Proposal for which settings are being displayed. In the case of SPP, it's
     * the parent SPP proposal. Both contain token totalSupply values.
     */
    proposal: ILockToVoteProposal | ISppProposal;
}

export const useLockToVoteGovernanceSettings = (
    params: IUseLockToVoteGovernanceSettingsParams,
): IDefinitionSetting[] => {
    const { settings, isVeto, proposal } = params;

    const { t } = useTranslations();

    return lockToVoteSettingsUtils.parseSettings({
        settings,
        isVeto,
        t,
        realTimeTotalSupply:
            proposal?.tokensTotalSupply?.[
                settings.token.address.toLocaleLowerCase()
            ] ?? '0',
    });
};
