import { useTranslations } from '@/shared/components/translationsProvider';
import { Icon, IconType, InputContainer, Link, RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { zeroAddress } from 'viem';
import { useAccount } from 'wagmi';
import type { ITokenSetupMembershipProps } from './tokenSetupMembership.api';
import { TokenSetupMembershipCreateToken } from './tokenSetupMembershipCreateToken';
import { TokenSetupMembershipImportToken } from './tokenSetupMembershipImportToken';

const defaultTokenAddress = zeroAddress;
const defaultTokenDecimals = 18;

export const TokenSetupMembership: React.FC<ITokenSetupMembershipProps> = (props) => {
    const { formPrefix } = props;

    const { t } = useTranslations();
    const { setValue, getValues } = useFormContext();
    const { address } = useAccount();

    const currentTokenAddress = getValues(`${formPrefix}.token.address`) as string;
    // Make sure to set the right default value when coming back from the next step!
    const [tokenType, setTokenType] = useState<'imported' | 'new'>(() =>
        currentTokenAddress && currentTokenAddress !== zeroAddress ? 'imported' : 'new',
    );

    const isImportDisabled = process.env.NEXT_PUBLIC_FEATURE_DISABLE_TOKEN_IMPORT === 'true';

    const handleTokenTypeChange = (value: string) => {
        // It is important to reset critical fields when changing the token type (before the new form is mounted)!
        // Forms reuse the same form state, so default values are not set when the form is mounted.
        setValue(`${formPrefix}.token.name`, '');
        setValue(`${formPrefix}.token.symbol`, '');
        setValue(`${formPrefix}.token.totalSupply`, '0');
        setValue(`${formPrefix}.token.decimals`, defaultTokenDecimals);

        if (value === 'imported') {
            setValue(`${formPrefix}.members`, []);
            setValue(`${formPrefix}.token.address`, '');
        } else {
            setValue(`${formPrefix}.members`, [{ address, tokenAmount: 1 }]);
            setValue(`${formPrefix}.token.address`, defaultTokenAddress);
        }

        setTokenType(value as typeof tokenType);
    };

    return (
        <div className="flex flex-col gap-6">
            <InputContainer
                id="token"
                label={t('app.plugins.token.tokenSetupMembership.type.label')}
                helpText={t('app.plugins.token.tokenSetupMembership.type.helpText')}
                useCustomWrapper={true}
            >
                <RadioGroup className="w-full" value={tokenType} onValueChange={handleTokenTypeChange}>
                    <div className="flex w-full flex-row gap-x-2">
                        <RadioCard label={t('app.plugins.token.tokenSetupMembership.type.option.create')} value="new" />
                        <RadioCard
                            label={t('app.plugins.token.tokenSetupMembership.type.option.import')}
                            value="imported"
                            disabled={isImportDisabled}
                        />
                    </div>
                    {isImportDisabled && (
                        <div className="flex flex-row items-baseline gap-x-2">
                            <Icon icon={IconType.WARNING} size="sm" className="text-info-500" />
                            <div className="flex flex-col gap-y-1">
                                <p className="text-sm text-neutral-400">
                                    {t('app.plugins.token.tokenSetupMembership.importDisabled')}{' '}
                                </p>
                                <Link
                                    href="https://app-legacy.aragon.org/"
                                    target="_blank"
                                    iconRight={IconType.LINK_EXTERNAL}
                                    className="text-sm"
                                >
                                    <span className="text-sm">
                                        {t('app.plugins.token.tokenSetupMembership.importDisabledLink')}
                                    </span>
                                </Link>
                            </div>
                        </div>
                    )}
                </RadioGroup>
            </InputContainer>
            {tokenType === 'imported' && <TokenSetupMembershipImportToken formPrefix={formPrefix} />}
            {tokenType === 'new' && <TokenSetupMembershipCreateToken formPrefix={formPrefix} />}
        </div>
    );
};
