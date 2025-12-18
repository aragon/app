import { Avatar } from '@aragon/gov-ui-kit';
import type { IToken } from '@/modules/finance/api/financeService';
import { useTranslations } from '@/shared/components/translationsProvider';

interface ICapitalDistributorDetailsInfo {
    /**
     * Label of the information.
     */
    label: string;
    /**
     * Value of the information.
     */
    value: string | null;
    /**
     * Displays the specified token logo when set.
     */
    token?: IToken;
}

export interface ICapitalDistributorClaimDialogDetailsInfoProps {
    /**
     * Campaign info to be displayed.
     */
    info: ICapitalDistributorDetailsInfo;
}

export const CapitalDistributorClaimDialogDetailsInfo: React.FC<ICapitalDistributorClaimDialogDetailsInfoProps> = (props) => {
    const { info } = props;

    const { t } = useTranslations();

    const { label, value, token } = info;

    return (
        <div className="flex grow basis-0 flex-col gap-1">
            <p className="font-normal text-neutral-500 text-sm leading-tight">
                {t(`app.plugins.capitalDistributor.capitalDistributorClaimDialog.details.${label}`)}
            </p>
            <div className="flex flex-row gap-1.5">
                {token && <Avatar size="sm" src={token.logo} />}
                <p className="font-normal text-base text-neutral-800 leading-normal first-letter:uppercase">{value}</p>
            </div>
        </div>
    );
};
