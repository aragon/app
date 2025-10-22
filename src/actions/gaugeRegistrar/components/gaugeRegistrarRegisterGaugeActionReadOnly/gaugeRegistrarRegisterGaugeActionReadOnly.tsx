'use client';

import { type IProposalActionData } from '@/modules/governance/components/createProposalForm';
import {
    Avatar,
    DefinitionList,
    type IProposalAction,
    type IProposalActionComponentProps,
    Link,
} from '@aragon/gov-ui-kit';
import { useTranslations } from '../../../../shared/components/translationsProvider';
import { GaugeIncentiveType } from '../../types/enum/gaugeIncentiveType';
import type { IGaugeRegistrarActionRegisterGauge } from '../../types/gaugeRegistrarActionRegisterGauge';

export interface IGaugeRegistrarRegisterGaugeActionReadOnlyProps
    extends IProposalActionComponentProps<IProposalActionData<IProposalAction>> {}

export const GaugeRegistrarRegisterGaugeActionReadOnly: React.FC<IGaugeRegistrarRegisterGaugeActionReadOnlyProps> = (
    props,
) => {
    const { action } = props;
    const { gaugeDetails } = action as unknown as IGaugeRegistrarActionRegisterGauge;
    const { name, description, avatar, incentiveType, resources, qiTokenAddress, rewardControllerAddress } =
        gaugeDetails ?? {};
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
            {resources && (
                <DefinitionList.Item
                    term={t('app.actions.gaugeRegistrar.gaugeRegistrarRegisterGaugeAction.resources.label')}
                >
                    <div className="flex flex-col gap-3">
                        {resources.map((link) => (
                            <Link key={link.url} href={link.url} isExternal={true} showUrl={true}>
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </DefinitionList.Item>
            )}
            <DefinitionList.Item term={t('app.actions.gaugeRegistrar.gaugeRegistrarRegisterGaugeAction.qiToken.label')}>
                {qiTokenAddress?.address}
            </DefinitionList.Item>
            <DefinitionList.Item
                term={t('app.actions.gaugeRegistrar.gaugeRegistrarRegisterGaugeAction.incentive.label')}
            >
                {incentiveType === GaugeIncentiveType.SUPPLY ? 'Supply' : 'Borrow'}
            </DefinitionList.Item>
            <DefinitionList.Item
                term={t('app.actions.gaugeRegistrar.gaugeRegistrarRegisterGaugeAction.rewardController.label')}
            >
                {rewardControllerAddress?.address}
            </DefinitionList.Item>
        </DefinitionList.Container>
    );
};
