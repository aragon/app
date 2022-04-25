import {CardText, CardToken, CardTransfer} from '@aragon/ui-components';
import React, {useEffect, useState} from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';

import {useNetwork} from 'context/network';
import {useProviders} from 'context/providers';
import {fetchTokenPrice} from 'services/prices';

const ReviewDeposit: React.FC = () => {
  const {t} = useTranslation();
  const {infura: provider} = useProviders();
  const {network} = useNetwork();

  const [price, setPrice] = useState<string>();
  const {getValues, setValue} = useFormContext();
  const values = getValues();

  useEffect(() => {
    async function getPrice() {
      const tokenPrice = await fetchTokenPrice(values.tokenAddress, network);
      if (tokenPrice) {
        setPrice(
          new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(tokenPrice * values.amount)
        );
      }
    }

    getPrice();
  }, [
    network,
    provider,
    setValue,
    values.amount,
    values.isCustomToken,
    values.tokenAddress,
  ]);

  return (
    <div className="space-y-1.5 desktop:space-y-3">
      <CardTransfer
        to="DAO Name"
        from={values.from}
        toLabel={t('labels.to')}
        fromLabel={t('labels.from')}
      />
      <CardToken
        type="transfer"
        tokenName={values.tokenName}
        tokenCount={values.amount.toString()}
        tokenSymbol={values.tokenSymbol}
        tokenImageUrl={values.tokenImgUrl}
        treasuryShare={price}
      />
      <CardText
        type="label"
        title={t('labels.reference')}
        content={values.reference || ''}
      />
    </div>
  );
};

export default ReviewDeposit;
