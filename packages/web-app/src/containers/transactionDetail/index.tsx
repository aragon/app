import {
  ButtonIcon,
  CardText,
  CardToken,
  CardTransfer,
  IconClose,
  IconLinkExternal,
  ListItemAction,
} from '@aragon/ui-components';
import React from 'react';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

import {Transfer} from 'utils/types';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';

type TransactionDetailProps = {
  transfer: Transfer;
  isOpen: boolean;
  onClose: () => void;
};

const TransactionDetail: React.FC<TransactionDetailProps> = ({
  transfer,
  isOpen,
  onClose,
}) => {
  const {t} = useTranslation();

  console.log('transfer', transfer);
  return (
    <ModalBottomSheetSwitcher isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <Title>Transaction Detail</Title>
        <ButtonIcon
          mode="secondary"
          size="small"
          bgWhite
          icon={<IconClose />}
          onClick={onClose}
        />
      </ModalHeader>

      <Content>
        <CardTransfer
          {...(transfer.transferType === 'VaultDeposit'
            ? {to: 'Dao Name', from: transfer.sender}
            : {to: transfer.to, from: 'DaoName'})}
          toLabel={t('labels.to')}
          fromLabel={t('labels.from')}
        />
        <CardToken
          type="transfer"
          tokenName={transfer.tokenName}
          tokenCount={`${
            transfer.transferType === 'VaultDeposit' ? '+' : '-'
          } ${transfer.tokenAmount}`}
          tokenSymbol={transfer.tokenSymbol}
          tokenImageUrl={transfer.tokenImgUrl}
          treasuryShare={transfer.usdValue}
        />
        {transfer.reference && (
          <CardText
            type="label"
            title="Reference"
            content={transfer.reference}
          />
        )}

        <ListItemAction
          title="View on Block Explorer"
          iconRight={<IconLinkExternal />}
        />
      </Content>
    </ModalBottomSheetSwitcher>
  );
};

export default TransactionDetail;

const ModalHeader = styled.div.attrs({
  className:
    'flex items-center space-between h-10 gap-x-3 p-2 bg-ui-0 rounded-xl',
})`
  box-shadow: 0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06), 0px 0px 1px rgba(31, 41, 51, 0.04);
`;

const Content = styled.div.attrs({className: 'p-3 space-y-1.5 w-'})`
  width: 448px;
`;

const Title = styled.p.attrs({
  className: 'flex-1 text-ui-800 font-bold',
})``;
