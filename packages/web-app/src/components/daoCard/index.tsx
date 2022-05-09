import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {Avatar, IconBlock, IconCommunity} from '@aragon/ui-components';
import {CHAIN_METADATA} from 'utils/constants';
import {t} from 'i18next';

export interface IDaoCardProps {
  name?: string;
  logo: string;
  description?: string;
  chainId?: number;
  daoType?: DaoType;
}

export type DaoType = 'wallet-based' | 'token-based';

const getDaoType = (daoType?: DaoType) => {
  switch (daoType) {
    case 'token-based':
      return t('explore.explorer.tokenBased');
    case 'wallet-based':
      return t('explore.explorer.walletBased');
  }
};

export const DaoCard = (props: IDaoCardProps) => {
  const [networkName, setNetworkName] = useState('');

  useEffect(() => {
    let networks: keyof typeof CHAIN_METADATA;
    for (networks in CHAIN_METADATA) {
      if (CHAIN_METADATA[networks].id === props.chainId) {
        setNetworkName(CHAIN_METADATA[networks].name);
        return;
      }
    }
  }, [props.chainId]);

  return (
    <Container data-testid="daoCard">
      <DaoDataWrapper>
        <HeaderContainer>
          <Avatar mode="circle" size="large" src={props.logo} />
          <Title>{props.name}</Title>
        </HeaderContainer>
        <Description>{props.description}</Description>
      </DaoDataWrapper>
      <DaoMetadataWrapper>
        <IconWrapper>
          <StyledIconBlock />
          <IconLabel>{networkName}</IconLabel>
        </IconWrapper>
        <IconWrapper>
          <StyledIconCommunity />
          <IconLabel>{getDaoType(props.daoType)}</IconLabel>
        </IconWrapper>
      </DaoMetadataWrapper>
    </Container>
  );
};

const Container = styled.button.attrs({
  className: `p-2 desktop:p-3 w-full flex flex-col space-y-3
    box-border border border-transparent
    focus:outline-none focus:ring-2 focus:ring-primary-500
    hover:border-ui-100 active:border-200
    bg-white rounded-xl
    `,
})`
  :hover {
    box-shadow: 0px 4px 8px rgba(31, 41, 51, 0.04),
      0px 0px 2px rgba(31, 41, 51, 0.06), 0px 0px 1px rgba(31, 41, 51, 0.04);
  }
  :focus {
    box-shadow: 0px 0px 0px 2px #003bf5;
  }
`;

const HeaderContainer = styled.div.attrs({
  className: 'flex flex-row space-x-2 items-center',
})``;

const Title = styled.p.attrs({
  className: 'font-bold text-ui-800 text-base desktop:text-xl',
})``;

const Description = styled.p.attrs({
  className: `
  font-medium text-ui-600 text-sm desktop:text-base flex line-clamp-2 text-left
  `,
})``;

const DaoMetadataWrapper = styled.div.attrs({
  className: 'flex flex-row space-x-3',
})``;
const IconLabel = styled.p.attrs({
  className: 'text-ui-600 text-sm',
})``;
const IconWrapper = styled.div.attrs({
  className: 'flex flex-row space-x-1',
})``;

const DaoDataWrapper = styled.div.attrs({
  className: 'flex flex-col grow space-y-1.5',
})``;

const StyledIconBlock = styled(IconBlock).attrs({
  className: 'text-ui-600',
})``;

const StyledIconCommunity = styled(IconCommunity).attrs({
  className: 'text-ui-600',
})``;
