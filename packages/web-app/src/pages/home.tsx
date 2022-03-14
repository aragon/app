import React from 'react';
import styled from 'styled-components';
import {ButtonText} from '@aragon/ui-components';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {withTransaction} from '@elastic/apm-rum-react';
import {useGlobalModalContext} from 'context/globalModals';

import {TimeFilter} from 'utils/constants';
import {useDaoVault} from 'hooks/useDaoVault';

const Home: React.FC = () => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const navigate = useNavigate();

  const vault = useDaoVault(
    '0x79fde96a6182adbd9ca4a803ba26f65a893fbf4f',
    TimeFilter.day
  );
  console.log('vault', vault);

  return (
    <>
      <div className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="text-center">
          <WelcomeMessage>{t('subtitle')}</WelcomeMessage>
          <Title>{t('title.part1')}</Title>
          <Subtitle>{t('title.part2')}</Subtitle>
        </div>
      </div>

      <ButtonText
        label="Create DAO"
        className="mx-auto"
        size="large"
        onClick={() => navigate('/create-dao')}
      />
      <ButtonText
        label="Open Transaction Modal"
        className="mx-auto mt-3"
        size="large"
        onClick={() => open('transaction')}
      />
    </>
  );
};

const WelcomeMessage = styled.h2.attrs({
  className: 'text-base font-semibold tracking-wide text-blue-600 uppercase',
})``;
const Title = styled.p.attrs({
  className:
    'my-3 text-4xl sm:text-5xl desktop:text-6xl font-bold sm:tracking-tight text-gray-900',
})``;
const Subtitle = styled.p.attrs({
  className:
    'my-3 text-4xl sm:text-5xl desktop:text-6xl font-bold sm:tracking-tight text-gray-900',
})``;

export default withTransaction('Dashboard', 'component')(Home);
