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
import { GaugeIncentiveType } from '../../types/enum/gaugeIncentiveType';
import type { IGaugeRegistrarActionRegisterGauge } from '../../types/gaugeRegistrarActionRegisterGauge';

export interface IGaugeRegistrarRegisterGaugeActionDetailsProps
    extends IProposalActionComponentProps<IProposalActionData<IProposalAction>> {}

const parseRegisterGaugeInputData = (
    params: IProposalActionInputDataParameter[],
): { qiTokenAddress: string; incentiveType: number; rewardControllerAddress: string } => {
    const [qiTokenAddress, incentiveType, rewardControllerAddress] = params.map((param) => param.value);

    return {
        qiTokenAddress: typeof qiTokenAddress === 'string' ? qiTokenAddress : '',
        incentiveType: Number(incentiveType),
        rewardControllerAddress: typeof rewardControllerAddress === 'string' ? rewardControllerAddress : '',
    };
};

export const GaugeRegistrarRegisterGaugeActionDetails: React.FC<IGaugeRegistrarRegisterGaugeActionDetailsProps> = (
    props,
) => {
    const { action } = props;

    const { gaugeMetadata, daoId } = action as unknown as IGaugeRegistrarActionRegisterGauge;
    const { qiTokenAddress, incentiveType, rewardControllerAddress } = parseRegisterGaugeInputData(
        action.inputData?.parameters ?? [],
    );
    const { name, description, avatar, links } = gaugeMetadata ?? {};
    const avatarSrc = ipfsUtils.cidToSrc(avatar);

    const { t } = useTranslations();
    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const { buildEntityUrl } = useDaoChain({ network: dao?.network });

    const qiTokenAddressLink = buildEntityUrl({ type: ChainEntityType.ADDRESS, id: qiTokenAddress });
    const rewardControllerAddressLink = buildEntityUrl({
        type: ChainEntityType.ADDRESS,
        id: rewardControllerAddress,
    });

    return (
        <DefinitionList.Container>
            <DefinitionList.Item
                term={t('app.actions.gaugeRegistrar.gaugeRegistrarRegisterGaugeActionDetails.nameTerm')}
            >
                {name}
            </DefinitionList.Item>
            <DefinitionList.Item
                term={t('app.actions.gaugeRegistrar.gaugeRegistrarRegisterGaugeActionDetails.avatarTerm')}
            >
                <Avatar src={avatarSrc} size="md" />
            </DefinitionList.Item>
            <DefinitionList.Item
                term={t('app.actions.gaugeRegistrar.gaugeRegistrarRegisterGaugeActionDetails.descriptionTerm')}
            >
                {description}
            </DefinitionList.Item>
            {links && (
                <DefinitionList.Item
                    term={t('app.actions.gaugeRegistrar.gaugeRegistrarRegisterGaugeActionDetails.resourcesTerm')}
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
            <DefinitionList.Item
                term={t('app.actions.gaugeRegistrar.gaugeRegistrarRegisterGaugeActionDetails.qiTokenTerm')}
                link={{ href: qiTokenAddressLink }}
                copyValue={qiTokenAddress}
            >
                {addressUtils.truncateAddress(qiTokenAddress)}
            </DefinitionList.Item>
            <DefinitionList.Item
                term={t('app.actions.gaugeRegistrar.gaugeRegistrarRegisterGaugeActionDetails.incentiveTerm')}
            >
                {incentiveType === GaugeIncentiveType.SUPPLY ? 'Supply' : 'Borrow'}
            </DefinitionList.Item>
            <DefinitionList.Item
                term={t('app.actions.gaugeRegistrar.gaugeRegistrarRegisterGaugeActionDetails.rewardControllerTerm')}
                link={{ href: rewardControllerAddressLink }}
                copyValue={rewardControllerAddress}
            >
                {addressUtils.truncateAddress(rewardControllerAddress)}
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
