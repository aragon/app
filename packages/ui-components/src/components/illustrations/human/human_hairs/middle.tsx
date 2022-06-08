import React from 'react';
import {IconType} from '../../../icons';

export const middle: IconType = ({height = 160, width = 160, ...props}) => {
  return (
    <svg
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 400 225"
      {...props}
    >
      <path
        d="M187.468 56.0932C187.468 56.0932 187.468 59.9797 198.274 59.9797C209.08 59.9797 210.538 54.2398 210.538 54.2398C210.538 54.2398 209.521 59.796 218.482 65.0684C219.731 68.0657 219.698 75.5882 219.698 75.5882C219.698 75.5882 220.172 72.4072 224.162 72.4072C229.148 72.4072 229.503 83.2401 224.887 85.5569C220.272 87.8738 218.273 85.2939 218.273 85.2939C217.635 90.5931 215.458 94.3234 212.204 99.0719C212.112 106.198 212.204 114.954 212.204 114.954C212.204 114.954 235.753 116.523 240.189 95.3336C242.126 83.3945 233.524 87.4647 229.292 63.6825C225.059 39.9003 209.713 36.1934 200.199 36.1934C190.684 36.1934 181.824 39.7125 175.913 50.7248C170.002 61.7372 171.11 66.2081 163.353 75.5882C155.597 84.9683 154.855 90.6164 158.271 99.3119C161.687 108.007 176.758 114.595 187.468 114.595V99.3916C184.151 94.923 181.582 90.0982 180.716 84.5968C178.866 86.0787 174.434 87.7444 171.939 82.2841C169.443 76.8238 171.847 72.7495 175.271 72.7495C178.695 72.7495 179.399 75.5882 179.399 75.5882L180.349 65.9033C180.349 65.9033 186.914 63.0313 187.468 56.0932Z"
        fill="#001F5C"
      />
    </svg>
  );
};
