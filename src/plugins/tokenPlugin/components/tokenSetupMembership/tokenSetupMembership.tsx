import { useTranslations } from '@/shared/components/translationsProvider';
import { InputContainer, RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { zeroAddress } from 'viem';
import { useAccount } from 'wagmi';
import { TokenSetupMembershipCreateToken } from './components/tokenSetupMembershipCreateToken';
import { TokenSetupMembershipImportToken } from './components/tokenSetupMembershipImportToken';
import { defaultTokenAddress, defaultTokenDecimals } from './constants/tokenDefaults';
import type { ITokenSetupMembershipProps } from './tokenSetupMembership.api';

export const TokenSetupMembership: React.FC<ITokenSetupMembershipProps> = (props) => {
    const { formPrefix, daoId } = props;

    const { t } = useTranslations();
    const { setValue, getValues } = useFormContext();
    const { address } = useAccount();

    const currentTokenAddress = getValues(`${formPrefix}.token.address`) as string;
    // Make sure to set the right default value when coming back from the next step!
    const [tokenType, setTokenType] = useState<'imported' | 'new'>(() =>
        currentTokenAddress && currentTokenAddress !== zeroAddress ? 'imported' : 'new',
    );

    const handleTokenTypeChange = (value: string) => {
        // It is important to reset critical fields when changing the token type (before the new form is mounted)!
        // Forms reuse the same state, so default values aren't applied when a field already contains a value from the previous form.
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
                        />
                    </div>
                </RadioGroup>
            </InputContainer>
            {tokenType === 'imported' && <TokenSetupMembershipImportToken formPrefix={formPrefix} daoId={daoId} />}
            {tokenType === 'new' && <TokenSetupMembershipCreateToken formPrefix={formPrefix} />}
        </div>
    );
};
