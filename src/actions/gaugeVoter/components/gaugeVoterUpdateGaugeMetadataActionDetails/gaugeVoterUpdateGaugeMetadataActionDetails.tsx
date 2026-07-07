'use client';

import {
    Avatar,
    addressUtils,
    ChainEntityType,
    DefinitionList,
    type IProposalAction,
    type IProposalActionComponentProps,
} from '@aragon/gov-ui-kit';
import type { IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { useDao } from '@/shared/api/daoService';
import { ResourceLink } from '@/shared/components/resourceLink';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import type { IGaugeVoterActionUpdateGaugeMetadata } from '../../types/gaugeVoterActionUpdateGaugeMetadata';
import { gaugeVoterActionParser } from '../../utils/gaugeVoterActionParser';

export interface IGaugeVoterUpdateGaugeMetadataActionDetailsProps
    extends IProposalActionComponentProps<
        IProposalActionData<IProposalAction>
    > {}

export const GaugeVoterUpdateGaugeMetadataActionDetails: React.FC<
    IGaugeVoterUpdateGaugeMetadataActionDetailsProps
> = (props) => {
    const { action } = props;

    const { gaugeMetadata, daoId } =
        action as unknown as IGaugeVoterActionUpdateGaugeMetadata;
    const { gaugeAddress } = gaugeVoterActionParser.parseInputData(
        action.inputData?.parameters ?? [],
    );
    const { name, description, avatar, links } = gaugeMetadata ?? {};
    const avatarSrc = ipfsUtils.cidToSrc(avatar);

    const { t } = useTranslations();
    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const { buildEntityUrl } = useDaoChain({ network: dao?.network });

    const gaugeAddressLink = buildEntityUrl({
        type: ChainEntityType.ADDRESS,
        id: gaugeAddress,
    });

    return (
        <DefinitionList.Container>
            <DefinitionList.Item
                copyValue={gaugeAddress}
                link={{ href: gaugeAddressLink }}
                term={t(
                    'app.actions.gaugeVoter.gaugeVoterUpdateGaugeMetadataActionDetails.gaugeAddressTerm',
                )}
            >
                {addressUtils.truncateAddress(gaugeAddress)}
            </DefinitionList.Item>
            <DefinitionList.Item
                term={t(
                    'app.actions.gaugeVoter.gaugeVoterUpdateGaugeMetadataActionDetails.nameTerm',
                )}
            >
                {name}
            </DefinitionList.Item>
            {avatar && (
                <DefinitionList.Item
                    term={t(
                        'app.actions.gaugeVoter.gaugeVoterUpdateGaugeMetadataActionDetails.avatarTerm',
                    )}
                >
                    <Avatar size="md" src={avatarSrc} />
                </DefinitionList.Item>
            )}
            <DefinitionList.Item
                term={t(
                    'app.actions.gaugeVoter.gaugeVoterUpdateGaugeMetadataActionDetails.descriptionTerm',
                )}
            >
                {description}
            </DefinitionList.Item>
            {links && links.length > 0 && (
                <DefinitionList.Item
                    term={t(
                        'app.actions.gaugeVoter.gaugeVoterUpdateGaugeMetadataActionDetails.resourcesTerm',
                    )}
                >
                    <div className="flex flex-col gap-3">
                        {links.map((link) => (
                            <ResourceLink
                                isExternal={true}
                                key={link.url}
                                name={link.name}
                                url={link.url}
                            />
                        ))}
                    </div>
                </DefinitionList.Item>
            )}
        </DefinitionList.Container>
    );
};
