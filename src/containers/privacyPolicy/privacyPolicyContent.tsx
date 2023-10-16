import React from 'react';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {ButtonText, Link} from '@aragon/ods-old';

type PrivacyPolicyContentProps = {
  isDesktop: boolean;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onShowCookieSettings: () => void;
};

const PrivacyPolicyContent: React.FC<PrivacyPolicyContentProps> = ({
  isDesktop,
  ...props
}) => {
  const {t} = useTranslation();

  return (
    <>
      <Text>
        {t('privacyPolicy.content')}{' '}
        <span className="capitalize">
          <Link label={t('privacyPolicy.title')} href="#" />.
        </span>
      </Text>

      <ButtonGroup>
        <ButtonText
          label={t('privacyPolicy.acceptAllCookies')}
          mode="secondary"
          bgWhite
          {...(isDesktop
            ? {size: 'small'}
            : {size: 'large', className: 'w-full'})}
          onClick={props.onAcceptAll}
        />
        <ButtonText
          label={t('privacyPolicy.rejectAllCookies')}
          mode="secondary"
          bgWhite
          {...(isDesktop
            ? {size: 'small'}
            : {size: 'large', className: 'w-full'})}
          onClick={props.onRejectAll}
        />
        <ButtonText
          label={t('privacyPolicy.cookieSettings')}
          {...(isDesktop
            ? {mode: 'secondary', size: 'small'}
            : {
                mode: 'ghost',
                bgWhite: true,
                size: 'large',
                className: 'w-full',
              })}
          onClick={props.onShowCookieSettings}
        />
      </ButtonGroup>
    </>
  );
};

export default PrivacyPolicyContent;

const Text = styled.div.attrs({
  className: 'flex-1 ft-text-sm text-ui-600',
})``;

const ButtonGroup = styled.div.attrs({
  className:
    'space-y-1.5 xl:space-y-0 xl:flex xl:justify-end xl:items-center xl:space-x-1.5',
})``;
