import {
  AlertInline,
  ButtonIcon,
  IconMenuVertical,
  Label,
  ListItemAction,
  Dropdown,
  TextInput,
  NumberInput,
  ValueInput,
} from '@aragon/ui-components';
import styled from 'styled-components';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Controller, useFormContext} from 'react-hook-form';

import {
  getUserFriendlyWalletLabel,
  handleClipboardActions,
} from 'utils/library';
import {useWallet} from 'hooks/useWallet';
import {validateAddress} from 'utils/validators';

type WalletRowProps = {
  index: number;
  onDelete?: (index: number) => void;
};

export type WalletField = {
  id: string;
  address: string;
  amount: string;
};

const WalletRow: React.FC<WalletRowProps> = ({index, onDelete}) => {
  const {t} = useTranslation();
  const [isDuplicate, setIsDuplicate] = useState<boolean>(false);
  const {address} = useWallet();
  const {control, getValues, setValue, trigger} = useFormContext();
  const walletFieldArray = getValues('wallets');

  const calculateTotalTokenSupply = (value: number) => {
    let totalSupply = 0;
    if (walletFieldArray) {
      walletFieldArray.forEach(
        (wallet: WalletField) =>
          (totalSupply = parseInt(wallet.amount) + totalSupply)
      );
    }
    const CalculateNaN = Math.floor((value / totalSupply) * 100);
    return totalSupply && !isNaN(CalculateNaN) ? CalculateNaN + '%' : '';
  };

  const addressValidator = (address: string, index: number) => {
    let validationResult = validateAddress(address);
    setIsDuplicate(false);
    if (walletFieldArray) {
      walletFieldArray.forEach((wallet: WalletField, walletIndex: number) => {
        if (address === wallet.address && index !== walletIndex) {
          validationResult = t('errors.duplicateAddress') as string;
          setIsDuplicate(true);
        }
      });
    }
    return validationResult;
  };

  const amountValidation = (index: number) => {
    let totalSupply = 0;
    const address = getValues(`wallets.${index}.address`);
    if (address === '') trigger(`wallets.${index}.address`);
    walletFieldArray.forEach((wallet: WalletField) => {
      totalSupply = parseInt(wallet.amount) + totalSupply;
    });
    setValue('tokenTotalSupply', totalSupply);
    return totalSupply === 0 ? t('errors.totalSupplyZero') : true;
  };

  return (
    <Container data-testid="wallet-row">
      <Controller
        defaultValue=""
        name={`wallets.${index}.address`}
        control={control}
        rules={{
          required: t('errors.required.walletAddress') as string,
          validate: value => addressValidator(value, index),
        }}
        render={({
          field: {name, value, onBlur, onChange},
          fieldState: {error},
        }) => (
          <div className="flex-1 order-1">
            <LabelWrapper>
              <Label label={t('labels.whitelistWallets.address')} />
            </LabelWrapper>
            <ValueInput
              mode={error ? 'critical' : 'default'}
              name={name}
              value={getUserFriendlyWalletLabel(value, address || '', t)}
              onBlur={onBlur}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                onChange(e.target.value);
              }}
              disabled={index === 0}
              adornmentText={value ? t('labels.copy') : t('labels.paste')}
              onAdornmentClick={() => handleClipboardActions(value, onChange)}
            />
            {error?.message && (
              <ErrorContainer>
                <AlertInline label={error.message} mode="critical" />
              </ErrorContainer>
            )}
          </div>
        )}
      />

      <Controller
        name={`wallets.${index}.amount`}
        control={control}
        rules={{
          required: t('errors.required.amount'),
          validate: () => amountValidation(index),
        }}
        render={({field, fieldState: {error}}) => (
          <div className="flex-1 tablet:flex-none order-4 tablet:order-2 w-25">
            <LabelWrapper>
              <Label label={t('labels.amount')} />
            </LabelWrapper>

            <NumberInput
              name={field.name}
              onBlur={field.onBlur}
              onChange={field.onChange}
              placeholder="0"
              min={0}
              disabled={isDuplicate}
              mode={error?.message ? 'critical' : 'default'}
              value={field.value}
            />

            {error?.message && (
              <ErrorContainer>
                <AlertInline label={error.message} mode="critical" />
              </ErrorContainer>
            )}
          </div>
        )}
      />

      <Break />

      <PercentageInputDisplayWrapper>
        <PercentageInputDisplay
          name={`wallets.${index}.amount`}
          value={calculateTotalTokenSupply(walletFieldArray[index].amount)}
          mode="default"
          disabled
        />
      </PercentageInputDisplayWrapper>

      <DropdownMenuWrapper>
        {index !== 0 && (
          <Dropdown
            align="start"
            trigger={
              <ButtonIcon
                mode="ghost"
                size="large"
                bgWhite
                icon={<IconMenuVertical />}
                data-testid="trigger"
              />
            }
            sideOffset={8}
            listItems={[
              {
                component: (
                  <ListItemAction
                    title={t('labels.removeWallet')}
                    {...(typeof onDelete !== 'function' && {mode: 'disabled'})}
                    bgWhite
                  />
                ),
                callback: () => {
                  if (typeof onDelete === 'function') {
                    const [totalSupply, amount] = getValues([
                      'tokenTotalSupply',
                      `wallets.${index}.amount`,
                    ]);
                    setValue('tokenTotalSupply', totalSupply - amount);
                    onDelete(index);
                  }
                },
              },
            ]}
          />
        )}
      </DropdownMenuWrapper>
    </Container>
  );
};

export default WalletRow;

const Container = styled.div.attrs({
  className: 'flex flex-wrap gap-x-2 gap-y-1.5 p-2 bg-ui-0',
})``;

const PercentageInputDisplay = styled(TextInput).attrs({
  className: 'text-right',
})``;

const PercentageInputDisplayWrapper = styled.div.attrs({
  className: 'flex order-5 tablet:order-4 mt-3.5 tablet:mt-0 w-10',
})``;

const LabelWrapper = styled.div.attrs({
  className: 'tablet:hidden mb-0.5',
})``;

const ErrorContainer = styled.div.attrs({
  className: 'mt-0.5',
})``;

const Break = styled.hr.attrs({
  className: 'order-3 tablet:hidden w-full border-0',
})``;

const DropdownMenuWrapper = styled.div.attrs({
  className: 'flex order-2 tablet:order-5 mt-3.5 tablet:mt-0 w-6',
})``;
