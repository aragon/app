import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {
  Popover,
  ListItemAction,
  ButtonIcon,
  IconMenuVertical,
} from '@aragon/ui-components';

import {useGlobalModalContext} from 'context/globalModals';
import {useActionsContext} from 'context/actions';
import ConfigureWithdrawForm from '../configureWithdraw';

const WithdrawAction: React.FC = () => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const {action} = useActionsContext();

  return (
    <Container>
      <Header>
        <HCWrapper>
          <Title>Withdraw Assets</Title>
          <Description>Withdraw assets from the DAO treasury</Description>
        </HCWrapper>
        <Popover
          side="bottom"
          align="end"
          width={264}
          content={
            <div className="p-1.5 space-y-0.5">
              <ListItemAction
                title={t('labels.duplicateAction')}
                // onClick={resetDistribution}
                bgWhite
              />
              <ListItemAction
                title={t('labels.resetAction')}
                onClick={() => {}}
                bgWhite
              />
              <ListItemAction
                title={t('labels.removeEntireAction')}
                onClick={() => {}}
                bgWhite
              />
            </div>
          }
        >
          <ButtonIcon
            mode="ghost"
            size="large"
            icon={<IconMenuVertical />}
            data-testid="trigger"
          />
        </Popover>
      </Header>
      <Body>
        <ConfigureWithdrawForm />
      </Body>
    </Container>
  );
};

export default WithdrawAction;

const Container = styled.div.attrs({
  className: 'bg-ui-0 rounded-xl p-3',
})``;

const Header = styled.div.attrs({
  className: 'flex justify-between items-center',
})``;

const Body = styled.div.attrs({
  className: 'bg-ui-50 p-3 rounded-xl space-y-3 mt-3',
})``;

const Title = styled.h2.attrs({
  className: 'text-base font-bold text-ui-800',
})``;

const Description = styled.p.attrs({
  className: 'text-sm text-ui-600',
})``;

const HCWrapper = styled.div.attrs({
  className: 'space-y-0.5',
})``;
