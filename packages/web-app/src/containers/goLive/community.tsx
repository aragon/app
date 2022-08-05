import React from 'react';
import {Link, Badge} from '@aragon/ui-components';
import {Controller, useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';

import {useFormStep} from 'components/fullScreenStepper';
import CommunityAddressesModal from 'containers/communityAddressesModal';
import {useGlobalModalContext} from 'context/globalModals';
import {DescriptionListContainer, Dl, Dt, Dd} from 'components/descriptionList';

const Community: React.FC = () => {
  const {control, getValues} = useFormContext();
  const {setStep} = useFormStep();
  const {open} = useGlobalModalContext();
  const {t} = useTranslation();
  const {
    membership,
    tokenName,
    wallets,
    isCustomToken,
    tokenSymbol,
    tokenTotalSupply,
    whitelistWallets,
  } = getValues();

  return (
    <Controller
      name="reviewCheck.community"
      control={control}
      defaultValue={false}
      rules={{
        required: t('errors.required.recipient'),
      }}
      render={({field: {onChange, value}}) => (
        <DescriptionListContainer
          title={t('labels.review.community')}
          onEditClick={() => setStep(2)}
          editLabel={t('settings.edit')}
          checkedState={value ? 'active' : 'default'}
          onChecked={() => onChange(!value)}
        >
          <Dl>
            <Dt>{t('labels.review.eligibleMembers')}</Dt>
            <Dd>
              {membership === 'token'
                ? t('createDAO.step3.tokenMembership')
                : t('labels.wallets')}
            </Dd>
          </Dl>

          {membership === 'wallet' && (
            <Dl>
              <Dt>{t('labels.review.distribution')}</Dt>
              <Dd>
                <Link
                  label={t('labels.review.distributionLink', {
                    walletCount: whitelistWallets.length,
                  })}
                  onClick={() => open('addresses')}
                />
              </Dd>
            </Dl>
          )}

          {membership === 'token' && (
            <>
              <Dl>
                <Dt>{t('votingTerminal.token')}</Dt>
                <Dd>
                  <div className="flex items-center space-x-1.5">
                    <p>{t('createDAO.step3.tokenName')}</p>
                    <p>
                      {tokenName}&nbsp;&nbsp;{tokenSymbol}
                    </p>
                    {isCustomToken && <Badge label="New" colorScheme="info" />}
                  </div>
                </Dd>
              </Dl>
              <Dl>
                <Dt>{t('labels.supply')}</Dt>
                <Dd>
                  <div className="flex items-center space-x-1.5">
                    <p>
                      {tokenTotalSupply} {tokenSymbol}
                    </p>
                    <Badge label="Fixed" colorScheme="neutral" />
                  </div>
                </Dd>
              </Dl>
              <Dl>
                <Dt>{t('labels.review.distribution')}</Dt>
                <Dd>
                  <Link
                    label={t('createDAO.review.distributionLink', {
                      count: wallets?.length,
                    })}
                    onClick={() => open('addresses')}
                  />
                </Dd>
              </Dl>
            </>
          )}

          <CommunityAddressesModal tokenMembership={membership === 'token'} />
        </DescriptionListContainer>
      )}
    />
  );
};

export default Community;
