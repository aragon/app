'use client';

import {
    Avatar,
    addressUtils,
    Card,
    ChainEntityType,
    Collapsible,
    DefinitionList,
    type IDefinitionSetting,
    Tag,
} from '@aragon/gov-ui-kit';
import safeWallet from '@/assets/images/safeWallet.png';
import {
    safeAppAccountUrl,
    safeShortNameFromNetwork,
} from '@/modules/application/utils/proxySafeUtils/safeTxServiceNetworks';
import { safeSettingsUtils } from '@/modules/safe/utils/safeSettingsUtils';
import type { Network } from '@/shared/api/daoService';
import { useSafeInfo } from '@/shared/api/safeService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { useWorkspaceAccountOptions } from '../../hooks/useWorkspaceAccountOptions';
import { workspaceUtils } from '../../utils/workspaceUtils';

export interface IWorkspaceSafeSettingsPageClientProps {
    /**
     * ID of the workspace the account is looked at in.
     */
    workspaceId: string;
    /**
     * Network the Safe is deployed on.
     */
    network: Network;
    /**
     * Address of the Safe.
     */
    address: string;
}

const translationKey = 'app.workspace.workspaceSafeSettingsPage';

/**
 * Settings of a Safe account of a workspace, laid out as the DAO settings page: an "Account" section saying which
 * account this is (name, chain, summary) and a "Governance" section saying what it takes to move it, with the
 * contract aside — the Safe address, its version and its Safe app link, then its guard and each enabled module, as
 * `DaoVersionInfo` states a DAO and its plugins.
 *
 * Read-only, with no actions: a Safe is configured in the Safe app, so nothing here creates a transaction or edits it.
 *
 * The Safe rows (address, threshold, nonce, guard, modules) are those of the Safe account page and of a Safe body's
 * settings (`safeSettingsUtils`), so the same Safe reads the same wherever it appears.
 */
export const WorkspaceSafeSettingsPageClient: React.FC<
    IWorkspaceSafeSettingsPageClientProps
> = (props) => {
    const { workspaceId, network, address: rawAddress } = props;

    const { t } = useTranslations();
    const { activeOption } = useWorkspaceAccountOptions();
    const { buildEntityUrl } = useDaoChain({ network });

    const address = addressUtils.getChecksum(rawAddress);
    const truncatedAddress = addressUtils.truncateAddress(address);

    const isSafeServed = safeShortNameFromNetwork(network) != null;
    const { data: safeInfo, isError } = useSafeInfo(
        { urlParams: { network, address } },
        { enabled: isSafeServed },
    );

    const metadata = activeOption?.account?.metadata;
    const name = activeOption?.label ?? truncatedAddress;
    const description = metadata?.description?.trim();
    const avatar = ipfsUtils.cidToSrc(metadata?.avatar) ?? safeWallet.src;

    const safeHref =
        safeAppAccountUrl({ network, address }) ??
        buildEntityUrl({ type: ChainEntityType.ADDRESS, id: address });

    const accountId = workspaceUtils.buildAccountId({ network, address });
    const membersUrl = workspaceUtils.getAccountScopeUrl(
        workspaceId,
        accountId,
        'members',
    );

    const safeRow = safeSettingsUtils.addressRow({
        address,
        safeName: truncatedAddress,
        safeHref,
        version: safeInfo?.version,
        t,
    });

    const governanceRows: IDefinitionSetting[] = [];
    const contractRows: IDefinitionSetting[] = [safeRow];

    const buildAddressHref = (contract: string) =>
        buildEntityUrl({ type: ChainEntityType.ADDRESS, id: contract });

    if (safeInfo != null) {
        contractRows.push(
            ...safeSettingsUtils.contractRows({
                safeInfo,
                network,
                buildAddressHref,
                t,
            }),
        );

        const [thresholdRow, ...configurationRows] =
            safeSettingsUtils.liveConfigurationRows({ safeInfo, t });

        governanceRows.push(
            // The owners are listed on the members page, so the threshold leads there rather than repeating them.
            { ...thresholdRow, link: { href: membersUrl } },
            ...configurationRows,
            ...safeSettingsUtils.authorityRows({
                safeInfo,
                buildAddressHref,
                t,
            }),
        );
    }

    const isGovernanceUnavailable = !isSafeServed || isError;

    return (
        <>
            <Page.Main title={t(`${translationKey}.main.title`)}>
                <Page.MainSection
                    title={t(`${translationKey}.main.accountTitle`)}
                >
                    <Card className="p-6">
                        <DefinitionList.Container>
                            <DefinitionList.Item
                                term={t(`${translationKey}.account.name`)}
                            >
                                <div className="flex items-center gap-2">
                                    <p className="text-neutral-500">{name}</p>
                                    <Avatar size="md" src={avatar} />
                                </div>
                            </DefinitionList.Item>
                            <DefinitionList.Item
                                term={t(`${translationKey}.account.chain`)}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-neutral-500">
                                        {networkDefinitions[network].name}
                                    </p>
                                    <Tag
                                        className="shrink-0"
                                        label={t(
                                            `${translationKey}.account.notChangeable`,
                                        )}
                                    />
                                </div>
                            </DefinitionList.Item>
                            {description != null && description !== '' && (
                                <DefinitionList.Item
                                    term={t(
                                        `${translationKey}.account.summary`,
                                    )}
                                >
                                    <Collapsible
                                        buttonLabelClosed={t(
                                            `${translationKey}.account.readMore`,
                                        )}
                                        buttonLabelOpened={t(
                                            `${translationKey}.account.readLess`,
                                        )}
                                        collapsedLines={4}
                                    >
                                        <p className="text-neutral-500">
                                            {description}
                                        </p>
                                    </Collapsible>
                                </DefinitionList.Item>
                            )}
                        </DefinitionList.Container>
                    </Card>
                </Page.MainSection>
                <Page.MainSection
                    title={t(`${translationKey}.main.governanceTitle`)}
                >
                    <Card className="p-6">
                        {isGovernanceUnavailable ? (
                            <p className="text-neutral-500">
                                {t(`${translationKey}.governance.unavailable`)}
                            </p>
                        ) : (
                            <DefinitionList.Container>
                                {governanceRows.map((row) => (
                                    <SettingRow key={row.term} row={row} />
                                ))}
                            </DefinitionList.Container>
                        )}
                    </Card>
                </Page.MainSection>
            </Page.Main>
            <Page.Aside>
                <Page.AsideCard
                    title={t(`${translationKey}.aside.contractsTitle`)}
                >
                    <DefinitionList.Container>
                        {contractRows.map((row) => (
                            <SettingRow key={row.copyValue} row={row} />
                        ))}
                    </DefinitionList.Container>
                </Page.AsideCard>
            </Page.Aside>
        </>
    );
};

interface ISettingRowProps {
    /**
     * Setting to render as a definition list item.
     */
    row: IDefinitionSetting;
}

const SettingRow: React.FC<ISettingRowProps> = (props) => {
    const { row } = props;

    return (
        <DefinitionList.Item
            copyValue={row.copyValue}
            description={row.description}
            link={row.link}
            term={row.term}
        >
            {row.link == null ? (
                <p className="text-neutral-500">{row.definition}</p>
            ) : (
                row.definition
            )}
        </DefinitionList.Item>
    );
};
