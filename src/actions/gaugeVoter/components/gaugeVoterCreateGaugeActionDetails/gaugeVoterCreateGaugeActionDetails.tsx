'use client';

import { type IProposalActionData } from '@/modules/governance/components/createProposalForm';
import { useDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import {
    addressUtils,
    Avatar,
    ChainEntityType,
    DefinitionList,
    type IProposalAction,
    type IProposalActionComponentProps,
    type IProposalActionInputDataParameter,
    Link,
} from '@aragon/gov-ui-kit';
import type { IGaugeVoterActionCreateGauge } from '../../types/gaugeVoterActionCreateGauge';

export interface IGaugeVoterCreateGaugeActionDetailsProps
    extends IProposalActionComponentProps<IProposalActionData<IProposalAction>> {}

const parseCreateGaugeInputData = (params: IProposalActionInputDataParameter[]): { gaugeAddress: string } => {
    const [gaugeAddress] = params.map((param) => param.value);

    return {
        gaugeAddress: typeof gaugeAddress === 'string' ? gaugeAddress : '',
    };
};

export const GaugeVoterCreateGaugeActionDetails: React.FC<IGaugeVoterCreateGaugeActionDetailsProps> = (props) => {
    const { action } = props;

    const { gaugeMetadata, daoId } = action as unknown as IGaugeVoterActionCreateGauge;
    const { gaugeAddress } = parseCreateGaugeInputData(action.inputData?.parameters ?? []);
    const { name, description, avatar, links } = gaugeMetadata ?? {};
    const avatarSrc = ipfsUtils.cidToSrc(avatar);

    const { t } = useTranslations();
    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const { buildEntityUrl } = useDaoChain({ network: dao?.network });

    const gaugeAddressLink = buildEntityUrl({ type: ChainEntityType.ADDRESS, id: gaugeAddress });

    return (
        <DefinitionList.Container>
            <DefinitionList.Item
                term={t('app.actions.gaugeVoter.gaugeVoterCreateGaugeActionDetails.gaugeAddressTerm')}
                link={{ href: gaugeAddressLink }}
                copyValue={gaugeAddress}
            >
                {addressUtils.truncateAddress(gaugeAddress)}
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.actions.gaugeVoter.gaugeVoterCreateGaugeActionDetails.nameTerm')}>
                {name}
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.actions.gaugeVoter.gaugeVoterCreateGaugeActionDetails.avatarTerm')}>
                <Avatar src={avatarSrc} size="md" />
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.actions.gaugeVoter.gaugeVoterCreateGaugeActionDetails.descriptionTerm')}>
                {description}
            </DefinitionList.Item>
            {links && links.length > 0 && (
                <DefinitionList.Item
                    term={t('app.actions.gaugeVoter.gaugeVoterCreateGaugeActionDetails.resourcesTerm')}
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
    );
};
