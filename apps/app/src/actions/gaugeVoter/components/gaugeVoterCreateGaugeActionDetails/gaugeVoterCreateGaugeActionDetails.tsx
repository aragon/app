'use client';

import {
    AddressOutput,
    Avatar,
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
import type { IGaugeVoterActionCreateGauge } from '../../types/gaugeVoterActionCreateGauge';
import { gaugeVoterActionParser } from '../../utils/gaugeVoterActionParser';

export interface IGaugeVoterCreateGaugeActionDetailsProps
    extends IProposalActionComponentProps<
        IProposalActionData<IProposalAction>
    > {}

export const GaugeVoterCreateGaugeActionDetails: React.FC<
    IGaugeVoterCreateGaugeActionDetailsProps
> = (props) => {
    const { action } = props;

    const { gaugeMetadata, daoId } =
        action as unknown as IGaugeVoterActionCreateGauge;
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
                link={{ isOnchainEntity: true }}
                term={t(
                    'app.actions.gaugeVoter.gaugeVoterCreateGaugeActionDetails.gaugeAddressTerm',
                )}
            >
                <AddressOutput address={gaugeAddress} href={gaugeAddressLink} />
            </DefinitionList.Item>
            <DefinitionList.Item
                term={t(
                    'app.actions.gaugeVoter.gaugeVoterCreateGaugeActionDetails.nameTerm',
                )}
            >
                {name}
            </DefinitionList.Item>
            {avatar && (
                <DefinitionList.Item
                    term={t(
                        'app.actions.gaugeVoter.gaugeVoterCreateGaugeActionDetails.avatarTerm',
                    )}
                >
                    <Avatar size="md" src={avatarSrc} />
                </DefinitionList.Item>
            )}
            <DefinitionList.Item
                term={t(
                    'app.actions.gaugeVoter.gaugeVoterCreateGaugeActionDetails.descriptionTerm',
                )}
            >
                {description}
            </DefinitionList.Item>
            {links && links.length > 0 && (
                <DefinitionList.Item
                    term={t(
                        'app.actions.gaugeVoter.gaugeVoterCreateGaugeActionDetails.resourcesTerm',
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
