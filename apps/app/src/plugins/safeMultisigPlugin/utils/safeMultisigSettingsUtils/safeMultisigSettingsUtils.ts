import type { IDefinitionSetting } from '@aragon/gov-ui-kit';
import type { ISafeInfo } from '@/shared/api/safeService';
import type { TranslationFunction } from '@/shared/components/translationsProvider';

export interface ISafeMultisigSettingsParseParams {
    safeInfo: ISafeInfo;
    isVeto?: boolean;
    t: TranslationFunction;
}

class SafeMultisigSettingsUtils {
    parseSettings = (
        params: ISafeMultisigSettingsParseParams,
    ): IDefinitionSetting[] => {
        const { safeInfo, isVeto, t } = params;
        const translationKey =
            'app.plugins.safeMultisig.safeMultisigGovernanceSettings';

        return [
            {
                term: t(
                    `${translationKey}.${isVeto ? 'vetoRule' : 'approvalRule'}`,
                ),
                definition: t(`${translationKey}.threshold`, {
                    min: safeInfo.threshold,
                    max: safeInfo.owners.length,
                }),
            },
            {
                term: t(`${translationKey}.owners`),
                definition: String(safeInfo.owners.length),
            },
            {
                term: t(`${translationKey}.version`),
                definition:
                    safeInfo.version ?? t(`${translationKey}.unknownVersion`),
            },
        ];
    };
}

export const safeMultisigSettingsUtils = new SafeMultisigSettingsUtils();
