'use client';

import { type IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { useAllGauges } from '@/plugins/gaugeVoterPlugin/api/gaugeVoterService/queries';
import { useDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import {
    addressUtils,
    Avatar,
    ChainEntityType,
    DataList,
    DefinitionList,
    EmptyState,
    type IProposalAction,
    type IProposalActionComponentProps,
    type IProposalActionInputDataParameter,
    Link,
} from '@aragon/gov-ui-kit';
import type { Hex } from 'viem';
import type { IGaugeVoterActionUpdateGaugeMetadata } from '../../types/gaugeVoterActionUpdateGaugeMetadata';
import { GaugeVoterGaugeListItem, GaugeVoterGaugeListItemSkeleton } from '../gaugeVoterGaugeListItem';

export interface IGaugeVoterUpdateGaugeMetadataActionDetailsProps
    extends IProposalActionComponentProps<IProposalActionData<IProposalAction>> {}

const parseUpdateGaugeMetadataInputData = (params: IProposalActionInputDataParameter[]): { gaugeAddress: string } => {
    const [gaugeAddress] = params.map((param) => param.value);

    return {
        gaugeAddress: typeof gaugeAddress === 'string' ? gaugeAddress : '',
    };
};

export const GaugeVoterUpdateGaugeMetadataActionDetails: React.FC<IGaugeVoterUpdateGaugeMetadataActionDetailsProps> = (
    props,
) => {
    const { action } = props;
    const pluginAddress = action.to;

    const { gaugeMetadata, daoId } = action as unknown as IGaugeVoterActionUpdateGaugeMetadata;
    const { gaugeAddress } = parseUpdateGaugeMetadataInputData(action.inputData?.parameters ?? []);
    const { name, description, avatar, links } = gaugeMetadata ?? {};
    const avatarSrc = ipfsUtils.cidToSrc(avatar);

    const { t } = useTranslations();
    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const { buildEntityUrl } = useDaoChain({ network: dao?.network });

    const { data: allGauges, isLoading: isAllGaugesLoading } = useAllGauges({
        gaugeListParams: {
            urlParams: {
                pluginAddress: pluginAddress as Hex,
                network: dao!.network,
            },
            queryParams: {},
        },
    });

    if (isAllGaugesLoading) {
        return <GaugeVoterGaugeListItemSkeleton />;
    }

    const gaugeToUpdate = gaugeAddress
        ? allGauges.find((gauge) => addressUtils.isAddressEqual(gauge.address, gaugeAddress))
        : undefined;

    if (!gaugeToUpdate) {
        return (
            <DataList.Item>
                <EmptyState
                    heading={t('app.actions.gaugeVoter.gaugeVoterUpdateGaugeMetadataActionDetails.notFound.title')}
                    description={t(
                        'app.actions.gaugeVoter.gaugeVoterUpdateGaugeMetadataActionDetails.notFound.description',
                    )}
                    objectIllustration={{ object: 'MAGNIFYING_GLASS' }}
                    isStacked={false}
                />
            </DataList.Item>
        );
    }

    const gaugeAddressLink = buildEntityUrl({ type: ChainEntityType.ADDRESS, id: gaugeAddress });

    return (
        <>
            <GaugeVoterGaugeListItem gauge={gaugeToUpdate} />
            <DefinitionList.Container>
                <DefinitionList.Item
                    term={t('app.actions.gaugeVoter.gaugeVoterUpdateGaugeMetadataActionDetails.gaugeAddressTerm')}
                    link={{ href: gaugeAddressLink }}
                    copyValue={gaugeAddress}
                >
                    {addressUtils.truncateAddress(gaugeAddress)}
                </DefinitionList.Item>
                <DefinitionList.Item
                    term={t('app.actions.gaugeVoter.gaugeVoterUpdateGaugeMetadataActionDetails.nameTerm')}
                >
                    {name}
                </DefinitionList.Item>
                <DefinitionList.Item
                    term={t('app.actions.gaugeVoter.gaugeVoterUpdateGaugeMetadataActionDetails.avatarTerm')}
                >
                    <Avatar src={avatarSrc} size="md" />
                </DefinitionList.Item>
                <DefinitionList.Item
                    term={t('app.actions.gaugeVoter.gaugeVoterUpdateGaugeMetadataActionDetails.descriptionTerm')}
                >
                    {description}
                </DefinitionList.Item>
                {links && links.length > 0 && (
                    <DefinitionList.Item
                        term={t('app.actions.gaugeVoter.gaugeVoterUpdateGaugeMetadataActionDetails.resourcesTerm')}
                    >
                        <div className="flex flex-col gap-3">
                            {links.map((link) => (
                                <Link key={link.url} href={link.url} isExternal={true} showUrl={true}>
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </DefinitionList.Item>
                )}
            </DefinitionList.Container>
        </>
    );
};
