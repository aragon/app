import { addressUtils, RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import { useDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { daoUtils } from '@/shared/utils/daoUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import type { ISetupStrategyForm } from '../setupStrategyDialogDefinitions';

export interface ISetupStrategyDialogSourceVaultProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export const SetupStrategyDialogSourceVault: React.FC<ISetupStrategyDialogSourceVaultProps> = (props) => {
    const { daoId } = props;

    const { t } = useTranslations();

    const { address } = daoUtils.parseDaoId(daoId);
    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const sourceVaultField = useFormField<ISetupStrategyForm, 'sourceVault'>('sourceVault', {
        label: t('app.capitalFlow.setupStrategyDialog.sourceVault.label'),
        defaultValue: daoId,
    });

    const daoAvatar = ipfsUtils.cidToSrc(dao?.avatar);

    if (dao == null) {
        return null;
    }

    return (
        <RadioGroup helpText={t('app.capitalFlow.setupStrategyDialog.sourceVault.helpText')} {...sourceVaultField}>
            <RadioCard
                avatar={daoAvatar}
                description={dao.ens ?? addressUtils.truncateAddress(address)}
                label={dao.name}
                tag={{
                    variant: 'neutral',
                    label: t('app.capitalFlow.setupStrategyDialog.sourceVault.tags.mainDao'),
                }}
                value={daoId}
            />
        </RadioGroup>
    );
};
