import React from 'react';
import {type IconType} from '../../icons';

export const Warning: IconType = ({height = 160, width = 160, ...props}) => {
  return (
    <svg
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 160 160"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M71.4774 38.9279C73.3139 35.9572 76.4363 34.1021 79.9261 34.1021C83.4159 34.1021 86.5383 35.9572 88.3748 38.9279L88.3867 38.9477L129.43 109.324C129.431 109.325 129.431 109.327 129.432 109.328C131.281 112.319 131.409 116.026 129.655 119.051C127.913 122.055 124.667 123.898 121.194 123.898H38.8691C35.2844 123.898 32.1462 122.05 30.4073 119.05C28.667 116.048 28.667 112.352 30.4073 109.35L30.4085 109.348L71.4655 38.9477L71.4774 38.9279ZM73.0111 39.8628L31.9612 110.251C31.961 110.251 31.9607 110.251 31.9605 110.252C30.5439 112.697 30.5441 115.705 31.9612 118.15C33.3799 120.597 35.9271 122.102 38.8691 122.102H121.194C124.037 122.102 126.686 120.592 128.102 118.15L128.102 118.15C129.502 115.734 129.424 112.747 127.919 110.295C127.909 110.281 127.901 110.267 127.892 110.253L86.8411 39.8627C85.3093 37.3919 82.7494 35.8982 79.9261 35.8982C77.1027 35.8982 74.5428 37.3919 73.0111 39.8628Z"
        fill="#001F5C"
      />
      <path
        d="M85.6907 64.6577C85.8965 61.0642 83.0077 58 79.5 58C75.9922 58 73.1036 60.9587 73.3094 64.6577L74.5487 89.1744C74.6517 91.9225 76.8185 94.0358 79.5008 94.0358C82.1831 94.0358 84.3499 91.9217 84.4528 89.1744L85.6907 64.6577Z"
        fill="#3164FA"
      />
      <path
        d="M73 105.342C73 109.041 75.8886 112 79.5 112C83.1112 112 86 109.041 86 105.342C86 101.643 83.1112 98.6846 79.5 98.6846C75.8888 98.6846 73 101.643 73 105.342Z"
        fill="#3164FA"
      />
    </svg>
  );
};
