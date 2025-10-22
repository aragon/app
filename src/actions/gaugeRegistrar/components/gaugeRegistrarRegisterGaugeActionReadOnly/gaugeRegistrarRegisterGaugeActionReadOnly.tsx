'use client';

import { type IProposalActionData } from '@/modules/governance/components/createProposalForm';
import {
    Avatar,
    DefinitionList,
    type IProposalAction,
    type IProposalActionComponentProps,
    type IProposalActionInputDataParameter,
    Link,
} from '@aragon/gov-ui-kit';
import { useTranslations } from '../../../../shared/components/translationsProvider';
import { GaugeIncentiveType } from '../../types/enum/gaugeIncentiveType';
import type { IGaugeRegistrarActionRegisterGauge } from '../../types/gaugeRegistrarActionRegisterGauge';

export interface IGaugeRegistrarRegisterGaugeActionReadOnlyProps
    extends IProposalActionComponentProps<IProposalActionData<IProposalAction>> {}

const parseInputData = (
    params: IProposalActionInputDataParameter[],
): { qiTokenAddress: string; incentiveType: number; rewardControllerAddress: string } => {
    const [qiTokenAddress, incentiveType, rewardControllerAddress] = params.map((param) => param.value);

    return {
        qiTokenAddress: typeof qiTokenAddress === 'string' ? qiTokenAddress : '',
        incentiveType: Number(incentiveType),
        rewardControllerAddress: typeof rewardControllerAddress === 'string' ? rewardControllerAddress : '',
    };
};

export const GaugeRegistrarRegisterGaugeActionReadOnly: React.FC<IGaugeRegistrarRegisterGaugeActionReadOnlyProps> = (
    props,
) => {
    const { action } = props;
    const { gaugeMetadata } = action as unknown as IGaugeRegistrarActionRegisterGauge;
    const { qiTokenAddress, incentiveType, rewardControllerAddress } = parseInputData(
        action.inputData?.parameters ?? [],
    );
    const { name, description, avatar, links } = gaugeMetadata ?? {};
    const { t } = useTranslations();

    return (
        <DefinitionList.Container>
            <DefinitionList.Item term={t('app.actions.gaugeRegistrar.gaugeRegistrarRegisterGaugeAction.name.label')}>
                {name}
            </DefinitionList.Item>
            <DefinitionList.Item
                term={t('app.actions.gaugeRegistrar.gaugeRegistrarRegisterGaugeAction.description.label')}
            >
                {description}
            </DefinitionList.Item>
            <DefinitionList.Item term={t('app.actions.gaugeRegistrar.gaugeRegistrarRegisterGaugeAction.avatar.label')}>
                <Avatar src={avatar as string} size="md" />
            </DefinitionList.Item>
            {links && (
                <DefinitionList.Item
                    term={t('app.actions.gaugeRegistrar.gaugeRegistrarRegisterGaugeAction.resources.label')}
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
            <DefinitionList.Item term={t('app.actions.gaugeRegistrar.gaugeRegistrarRegisterGaugeAction.qiToken.label')}>
                {qiTokenAddress}
            </DefinitionList.Item>
            <DefinitionList.Item
                term={t('app.actions.gaugeRegistrar.gaugeRegistrarRegisterGaugeAction.incentive.label')}
            >
                {incentiveType === GaugeIncentiveType.SUPPLY ? 'Supply' : 'Borrow'}
            </DefinitionList.Item>
            <DefinitionList.Item
                term={t('app.actions.gaugeRegistrar.gaugeRegistrarRegisterGaugeAction.rewardController.label')}
            >
                {rewardControllerAddress}
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
