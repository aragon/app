import { addressUtils, type IDefinitionSetting } from '@aragon/gov-ui-kit';
import type { Network } from '@/shared/api/daoService';
import type { ISafeInfo } from '@/shared/api/safeService';
import type { TranslationFunction } from '@/shared/components/translationsProvider';
import { safeModuleUtils } from '../safeModuleUtils';

export const safeSettingsTranslationKey = 'app.safe.safeSettings';

export interface ISafeAddressRowParams {
    /**
     * Checksummed address of the Safe. Stated separately from `safeInfo` because the address is
     * known from the route or the body: the row states which Safe this is while the account read
     * is still in flight, and on a network Safe does not serve at all.
     */
    address: string;
    /**
     * Name the Safe is shown under - its ENS name, or the truncated address.
     */
    safeName: string;
    /**
     * Where the Safe's address resolves: the Safe web app from a governance body, the block
     * explorer from the account page. Absent when neither serves the network, in which case the
     * row states the Safe without linking anywhere.
     */
    safeHref?: string;
    /**
     * Deployed Safe contract version, absent until the account read resolves or where it never
     * will. The help text says so rather than leaving the address looking unversioned.
     */
    version?: string | null;
    t: TranslationFunction;
}

export interface ISafeSettingsRowsParams {
    /**
     * Live Safe state: owners, threshold and nonce.
     */
    safeInfo: ISafeInfo;
    /**
     * Where a contract address the rows state (the guard, each module) resolves, usually the block
     * explorer. Absent, or returning undefined, leaves those rows unlinked.
     */
    buildAddressHref?: (address: string) => string | undefined;
    t: TranslationFunction;
}

export interface ISafeContractRowsParams extends ISafeSettingsRowsParams {
    /**
     * Network the Safe is deployed on, which the module deployments are matched on.
     */
    network: Network;
}

const buildContractLink = (
    address: string,
    buildAddressHref?: (address: string) => string | undefined,
): IDefinitionSetting['link'] => {
    const href = buildAddressHref?.(address);

    return href == null
        ? undefined
        : { href, isExternal: true, isOnchainEntity: true };
};

/**
 * One description of a Safe, stated the same way wherever it appears: the body's Settings tab in a
 * proposal and the Safe's own account page are the same subject read from the same endpoint, so
 * they share these rows rather than each wording the account their own way.
 *
 * The rows a surface owns stay with that surface - the chain the account page states, the decided
 * configuration a reported body recovers from its transaction.
 */
class SafeSettingsUtils {
    /**
     * The Safe's identity. `isOnchainEntity` hands the row to the kit's address output, which owns
     * the reveal and copies the checksummed address rather than the shown label.
     *
     * Safe serves only the current version and a contract can be upgraded after a decision
     * executes, so the version can only ever mean "now" - which is why it sits under the live
     * address as help text rather than claiming a row of its own.
     */
    addressRow = (params: ISafeAddressRowParams): IDefinitionSetting => {
        const { address, safeName, safeHref, version, t } = params;

        return {
            term: t(`${safeSettingsTranslationKey}.safe`),
            definition: safeName,
            link:
                safeHref == null
                    ? undefined
                    : {
                          href: safeHref,
                          isExternal: true,
                          isOnchainEntity: true,
                      },
            copyValue: address,
            description: t(`${safeSettingsTranslationKey}.versionHelp`, {
                version:
                    version ??
                    t(`${safeSettingsTranslationKey}.unknownVersion`),
            }),
        };
    };

    /**
     * What the Safe requires and where its sequence stands. The nonce advances with every
     * transaction the Safe executes, including ones with nothing to do with Aragon, so it is said
     * as "current" and never as one proposal's nonce.
     */
    liveConfigurationRows = (
        params: ISafeSettingsRowsParams,
    ): IDefinitionSetting[] => {
        const { safeInfo, t } = params;

        return [
            {
                term: t(`${safeSettingsTranslationKey}.threshold`),
                definition: t(
                    `${safeSettingsTranslationKey}.thresholdOfOwners`,
                    {
                        threshold: safeInfo.threshold,
                        total: safeInfo.owners.length,
                    },
                ),
            },
            {
                term: t(`${safeSettingsTranslationKey}.currentNonce`),
                definition: safeInfo.nonce,
            },
        ];
    };

    /**
     * Owners and threshold alone are an incomplete authority picture: a guard can make an
     * otherwise-valid transaction unexecutable, and a module can move funds with no owner signature
     * at all. Both are already fetched and validated, so withholding them would be an active choice
     * to understate who can move this Safe. Disclosure only - managing either belongs to the Safe
     * app, and a Safe with neither gets no rows rather than two empty ones.
     */
    authorityRows = (params: ISafeSettingsRowsParams): IDefinitionSetting[] => {
        const { safeInfo, buildAddressHref, t } = params;
        const rows: IDefinitionSetting[] = [];

        if (safeInfo.guard != null) {
            rows.push({
                term: t(`${safeSettingsTranslationKey}.guard`),
                definition: addressUtils.truncateAddress(safeInfo.guard),
                link: buildContractLink(safeInfo.guard, buildAddressHref),
                copyValue: safeInfo.guard,
            });
        }

        if (safeInfo.modules.length > 0) {
            rows.push({
                term: t(`${safeSettingsTranslationKey}.modules`),
                definition: t(`${safeSettingsTranslationKey}.modulesValue`, {
                    count: safeInfo.modules.length,
                }),
            });
        }

        return rows;
    };

    /**
     * The contracts attached to the Safe besides the Safe itself - its guard and each enabled
     * module - as the DAO settings aside lists a DAO's plugins. `authorityRows` says that they
     * exist; these say which they are. A module found among Safe's official deployments is named
     * with its version; any other is still listed, as an unrecognised module, because it can act
     * on the Safe all the same.
     */
    contractRows = (params: ISafeContractRowsParams): IDefinitionSetting[] => {
        const { safeInfo, network, buildAddressHref, t } = params;

        const toRow = (
            address: string,
            term: string,
            description: string,
        ): IDefinitionSetting => ({
            term,
            definition: addressUtils.truncateAddress(address),
            link: buildContractLink(address, buildAddressHref),
            copyValue: address,
            description,
        });

        const rows: IDefinitionSetting[] = [];

        if (safeInfo.guard != null) {
            rows.push(
                toRow(
                    safeInfo.guard,
                    t(`${safeSettingsTranslationKey}.guard`),
                    t(`${safeSettingsTranslationKey}.guardHelp`),
                ),
            );
        }

        for (const module of safeInfo.modules) {
            const info = safeModuleUtils.getModuleInfo(network, module);

            rows.push(
                info == null
                    ? toRow(
                          module,
                          t(`${safeSettingsTranslationKey}.module`),
                          t(`${safeSettingsTranslationKey}.unknownModule`),
                      )
                    : toRow(
                          module,
                          t(
                              `${safeSettingsTranslationKey}.moduleNames.${info.name}`,
                          ),
                          t(`${safeSettingsTranslationKey}.moduleVersion`, {
                              version: info.version,
                          }),
                      ),
            );
        }

        return rows;
    };
}

export const safeSettingsUtils = new SafeSettingsUtils();
