import React from 'react';
import {type IconType} from '..';

export const IconWithdraw: IconType = ({height = 16, width = 16, ...props}) => {
  return (
    <svg
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 16 16"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.70398 0.399987L11.904 3.59999C11.9988 3.69107 12.0743 3.80038 12.1259 3.92136C12.1774 4.04233 12.204 4.17248 12.204 4.30399C12.204 4.43549 12.1774 4.56564 12.1259 4.68662C12.0743 4.8076 11.9988 4.91691 11.904 5.00799C11.8114 5.09995 11.7015 5.17272 11.5807 5.22214C11.4599 5.27156 11.3305 5.29666 11.2 5.29599H8.99198V10.56C8.99198 10.8231 8.88747 11.0754 8.70143 11.2614C8.51539 11.4475 8.26307 11.552 7.99998 11.552C7.73689 11.552 7.48457 11.4475 7.29853 11.2614C7.11249 11.0754 7.00798 10.8231 7.00798 10.56V5.29599H4.79998C4.60304 5.297 4.41025 5.23938 4.24617 5.13045C4.0821 5.02151 3.95416 4.86621 3.87865 4.68431C3.80315 4.50241 3.7835 4.30216 3.8222 4.10906C3.8609 3.91595 3.95621 3.73874 4.09598 3.59999L7.29598 0.399987C7.38706 0.305132 7.49637 0.229661 7.61735 0.178106C7.73833 0.126551 7.86848 0.0999756 7.99998 0.0999756C8.13148 0.0999756 8.26163 0.126551 8.38261 0.178106C8.50359 0.229661 8.6129 0.305132 8.70398 0.399987ZM13.9515 10.2555C14.1765 10.0304 14.4817 9.90399 14.8 9.90399C15.1183 9.90399 15.4235 10.0304 15.6485 10.2555C15.8736 10.4805 16 10.7857 16 11.104V13.104C15.9958 13.8453 15.6995 14.5551 15.1753 15.0792C14.6511 15.6034 13.9413 15.8998 13.2 15.904H2.8C2.05869 15.8998 1.34894 15.6034 0.824742 15.0792C0.300548 14.5551 0.00420016 13.8453 0 13.104V11.104C0 10.7857 0.126428 10.4805 0.351472 10.2555C0.576515 10.0304 0.88174 9.90399 1.2 9.90399C1.51826 9.90399 1.82348 10.0304 2.04853 10.2555C2.27357 10.4805 2.4 10.7857 2.4 11.104V13.104C2.4 13.2101 2.44214 13.3118 2.51716 13.3868C2.59217 13.4618 2.69391 13.504 2.8 13.504H13.2C13.3061 13.504 13.4078 13.4618 13.4828 13.3868C13.5579 13.3118 13.6 13.2101 13.6 13.104V11.104C13.6 10.7857 13.7264 10.4805 13.9515 10.2555Z"
        fill="currentColor"
      />
    </svg>
  );
};