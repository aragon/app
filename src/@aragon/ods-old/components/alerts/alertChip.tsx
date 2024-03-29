import React from 'react';
import {css, styled} from 'styled-components';
import {Icon, IconType} from '@aragon/ods';

export type AlertChipProps = {
  /** Chip Label */
  label: string;
  /** Icon component */
  icon?: IconType;
  /** control Icon visibility */
  showIcon?: boolean;
  /** Is chip visible */
  isShown: boolean;
};

export const AlertChip: React.FC<AlertChipProps> = ({
  label,
  icon = IconType.CHECKMARK,
  showIcon = false,
  isShown = false,
}) => {
  return (
    <Wrapper data-testid="alertChip" {...{isShown}}>
      <BadgeContainer>
        {showIcon && (
          <Icon icon={icon} className="text-neutral-300" size="sm" />
        )}
        <Label>{label}</Label>
      </BadgeContainer>
    </Wrapper>
  );
};

type ContainerProps = Pick<AlertChipProps, 'isShown'>;

const WrapperAnimationCSS = css<ContainerProps>`
  animation: ${({isShown}) => (isShown ? 'fadein 0.3s' : 'fadeout 0.3s')};

  @-webkit-keyframes fadein {
    from {
      top: 0;
      opacity: 0;
      z-index: 0;
    }
    to {
      top: 24px;
      opacity: 1;
      z-index: 50;
    }
  }

  @keyframes fadein {
    from {
      top: 0;
      opacity: 0;
      z-index: 0;
    }
    to {
      top: 24px;
      opacity: 1;
      z-index: 50;
    }
  }

  @-webkit-keyframes fadeout {
    from {
      top: 24px;
      opacity: 1;
      z-index: 50;
    }
    to {
      top: 0;
      opacity: 0;
      z-index: 0;
    }
  }

  @keyframes fadeout {
    from {
      top: 24px;
      opacity: 1;
      z-index: 50;
    }
    to {
      top: 0;s
      opacity: 0;
      z-index: 0;
    }
  }
`;

const Wrapper = styled.div.attrs<ContainerProps>(({isShown}) => ({
  className: `fixed w-full flex items-center justify-center top-6 ${
    isShown ? 'opacity-100 fixed' : 'opacity-0 none'
  }`,
}))`
  z-index: ${props => (props.isShown ? '50' : '-50')};
  ${WrapperAnimationCSS}
`;

const BadgeContainer = styled.div.attrs(() => ({
  className:
    'flex items-center bg-neutral-900 rounded-full px-6 py-4 space-x-2 cursor-default',
}))``;

const Label = styled.span.attrs({
  className: 'text-neutral-100 ft-text-sm',
})``;
