import React from 'react';
import {type IconType} from '..';

export const IconSuccess: IconType = ({height = 16, width = 16, ...props}) => {
  return (
    <svg
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 16 17"
      {...props}
    >
      <path
        d="M8 0.5C6.41775 0.5 4.87103 0.969192 3.55544 1.84824C2.23985 2.72729 1.21447 3.97672 0.608967 5.43853C0.00346625 6.90034 -0.15496 8.50887 0.153721 10.0607C0.462403 11.6126 1.22433 13.038 2.34315 14.1569C3.46197 15.2757 4.88743 16.0376 6.43928 16.3463C7.99113 16.655 9.59966 16.4965 11.0615 15.891C12.5233 15.2855 13.7727 14.2602 14.6518 12.9446C15.5308 11.629 16 10.0822 16 8.5C15.9975 6.37905 15.1538 4.34569 13.6541 2.84595C12.1543 1.34621 10.121 0.502541 8 0.5ZM11.9072 7.2072L7.5072 11.6072C7.41434 11.7001 7.30409 11.7738 7.18275 11.824C7.06141 11.8743 6.93135 11.9002 6.8 11.9002C6.66866 11.9002 6.5386 11.8743 6.41726 11.824C6.29592 11.7738 6.18567 11.7001 6.0928 11.6072L4.0928 9.6072C3.90524 9.41964 3.79987 9.16525 3.79987 8.9C3.79987 8.63475 3.90524 8.38036 4.0928 8.1928C4.28036 8.00524 4.53475 7.89987 4.8 7.89987C5.06526 7.89987 5.31964 8.00524 5.5072 8.1928L6.8 9.4856L10.4928 5.7928C10.5857 5.69993 10.6959 5.62626 10.8173 5.576C10.9386 5.52574 11.0687 5.49987 11.2 5.49987C11.3313 5.49987 11.4614 5.52574 11.5827 5.576C11.7041 5.62626 11.8143 5.69993 11.9072 5.7928C12.0001 5.88567 12.0737 5.99592 12.124 6.11727C12.1743 6.23861 12.2001 6.36866 12.2001 6.5C12.2001 6.63134 12.1743 6.76139 12.124 6.88273C12.0737 7.00408 12.0001 7.11433 11.9072 7.2072Z"
        fill="currentColor"
      />
    </svg>
  );
};
