import React from 'react';
import {styled} from 'styled-components';
import {ButtonText} from '../button';

import {type IconType} from '../icons';

export type ListItemHeaderProps = {
  /** Action title */
  buttonText: string;
  /** Action state */
  disabled?: boolean;
  /** Icon to display */
  icon: React.FunctionComponentElement<IconType>;
  /** Label to display */
  label: string;
  /** Card orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Value to display */
  value: string;
  onClick: () => void;
};

export const ListItemHeader: React.FC<ListItemHeaderProps> = ({
  orientation = 'vertical',
  disabled = false,
  ...props
}) => {
  const horizontal = orientation === 'horizontal';

  return (
    <Container horizontal={horizontal} data-testid="listItem-header">
      <IconWrapper>{props.icon}</IconWrapper>

      <ButtonWrapper horizontal={horizontal}>
        <ButtonText
          label={props.buttonText}
          onClick={props.onClick}
          disabled={disabled}
        />
      </ButtonWrapper>

      <Break horizontal={horizontal} />
      <ContentWrapper horizontal={horizontal}>
        <Value>{props.value}</Value>
        <Label>{props.label}</Label>
      </ContentWrapper>
    </Container>
  );
};

type VariableAlignment = {
  horizontal: boolean;
};

const Container = styled.div.attrs<VariableAlignment>(({horizontal}) => ({
  className:
    'flex flex-wrap gap-1 md:gap-3 justify-between items-center ' +
    'p-2 md:p-3 bg-neutral-0 rounded-xl border border-neutral-100 ' +
    `${horizontal ? 'md:flex-nowrap :' : ''}`,
}))<VariableAlignment>``;

const IconWrapper = styled.div.attrs({
  className:
    'order-1 grid place-content-center w-5 h-5 text-primary-500 bg-primary-50 rounded-xl',
})``;

const ButtonWrapper = styled.div.attrs<VariableAlignment>(({horizontal}) => ({
  className: `order-2 ${horizontal ? 'md:order-3' : ''}`,
}))<VariableAlignment>``;

const Break = styled.hr.attrs<VariableAlignment>(({horizontal}) => ({
  className: `order-3 w-full border-0 ${
    horizontal ? 'md:hidden md:order-4' : ''
  }`,
}))<VariableAlignment>``;

const ContentWrapper = styled.div.attrs<VariableAlignment>(({horizontal}) => ({
  className: `order-4 min-w-0 ${
    horizontal ? 'md:flex flex-1 md:order-2 items-baseline gap-x-1' : ''
  }`,
}))<VariableAlignment>``;

const Value = styled.p.attrs({
  className: 'ft-text-2xl text-neutral-800 font-semibold truncate',
})``;

const Label = styled.p.attrs({
  className: 'ft-text-base text-neutral-500 truncate',
})``;
