import React from 'react';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {withTransaction} from '@elastic/apm-rum-react';

import {
  TokenSectionWrapper,
  TransferSectionWrapper,
} from 'components/sectionWrapper';
import TokenList from 'components/tokenList';
import usePollTokens from 'hooks/usePollTokens';
import {useDaoTokens} from 'hooks/useDaoTokens';
import {useTokenInfo} from 'hooks/useTokenInformation';

const Finance: React.FC = () => {
  const {t} = useTranslation();
  const {tokens} = useDaoTokens('0xMyDaoAddress');
  const {tokenInfos} = useTokenInfo(tokens.data);
  const {tokenPrices} = usePollTokens(tokenInfos.data);

  return (
    <div className={'m-auto mt-4 w-8/12'}>
      <h1 className={'text-2xl font-bold text-center'}>Finance Page</h1>
      <div className={'h-4'} />
      <TokenSectionWrapper title={t('finance.tokenSection')}>
        <div className="py-2 space-y-2 border-solid">
          <TokenList prices={prices} tokens={tokenPrices.data} />
        </div>
      </TokenSectionWrapper>
      <div className={'h-4'} />
      <TransferSectionWrapper title={t('finance.transferSection')}>
        <div className="my-2 space-y-2 border-solid">
          <ColoredDiv />
          <ColoredDiv />
          <ColoredDiv />
          <ColoredDiv />
          <ColoredDiv />
        </div>
      </TransferSectionWrapper>
    </div>
  );
};

export default withTransaction('Finance', 'component')(Finance);

const ColoredDiv = styled.div.attrs({className: 'h-6 w-full bg-blue-100'})``;
