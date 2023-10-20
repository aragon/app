import React from 'react';
import {type IconType} from '../../../icons';

export const BigSemirounded: IconType = ({
  height = 160,
  width = 160,
  ...props
}) => {
  return (
    <svg
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 400 225"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M197.72 74.5579C197.584 73.8719 197.387 73.1979 197.128 72.5443C196.56 71.1063 195.711 69.7963 194.63 68.6911C193.548 67.5859 192.257 66.7078 190.832 66.1083C189.407 65.5088 187.877 65.2 186.33 65.2C184.784 65.2 183.254 65.5088 181.829 66.1083C180.404 66.7078 179.112 67.5859 178.031 68.6911C176.95 69.7963 176.101 71.1063 175.532 72.5443C174.965 73.9795 174.69 75.5134 174.723 77.0562C174.724 78.6472 175.048 79.9129 175.712 80.8879C176.383 81.8726 177.34 82.4728 178.438 82.8385C179.522 83.1995 180.774 83.343 182.091 83.4021C183.113 83.448 184.217 83.444 185.347 83.4399L185.348 83.4398C185.675 83.4387 186.003 83.4375 186.333 83.4375C186.663 83.4375 186.992 83.4387 187.318 83.4398L187.319 83.4399C188.449 83.444 189.553 83.448 190.574 83.4021C191.891 83.343 193.143 83.1995 194.226 82.8385C195.323 82.4727 196.28 81.8723 196.95 80.8876C197.613 79.9126 197.937 78.647 197.938 77.0562C197.944 76.7562 197.939 76.4565 197.922 76.1579H200.598C200.581 76.4565 200.576 76.7562 200.583 77.0562C200.584 78.6469 200.907 79.9124 201.57 80.8874C202.239 81.8722 203.196 82.4726 204.293 82.8384C205.376 83.1995 206.627 83.343 207.944 83.4021C208.966 83.448 210.069 83.444 211.2 83.4399C211.528 83.4387 211.857 83.4375 212.187 83.4375C212.518 83.4375 212.847 83.4387 213.174 83.4399C214.305 83.444 215.41 83.448 216.431 83.4021C217.749 83.343 219.001 83.1995 220.084 82.8385C221.182 82.4728 222.139 81.8724 222.809 80.8877C223.473 79.9127 223.796 78.647 223.797 77.0562C223.83 75.5134 223.555 73.9795 222.988 72.5443C222.42 71.1063 221.57 69.7963 220.489 68.6911C219.408 67.5859 218.117 66.7078 216.692 66.1083C215.267 65.5088 213.736 65.2 212.19 65.2C210.644 65.2 209.113 65.5088 207.688 66.1083C206.263 66.7078 204.972 67.5859 203.891 68.6911C202.81 69.7963 201.96 71.1063 201.392 72.5443C201.134 73.1979 200.936 73.8719 200.8 74.5579H197.72ZM186.33 66.8C184.997 66.8 183.678 67.0662 182.449 67.5831C181.22 68.1 180.107 68.8571 179.175 69.81C178.243 70.7629 177.51 71.8924 177.021 73.1321C176.531 74.3719 176.294 75.6971 176.323 77.0298L176.323 77.0474C176.323 78.435 176.605 79.3566 177.034 79.9872C177.459 80.61 178.085 81.0344 178.944 81.3205C179.817 81.6114 180.895 81.7468 182.163 81.8037C183.142 81.8477 184.193 81.8439 185.315 81.8399C185.648 81.8387 185.988 81.8375 186.333 81.8375C186.679 81.8375 187.018 81.8387 187.351 81.8399C188.473 81.8439 189.524 81.8477 190.502 81.8037C191.77 81.7468 192.847 81.6114 193.72 81.3206C194.578 81.0345 195.203 80.6102 195.627 79.9875C196.056 79.3568 196.338 78.4352 196.338 77.0474H197.138L196.338 77.0298C196.344 76.7385 196.338 76.4476 196.319 76.1579H194.635C194.193 76.1579 193.835 75.7997 193.835 75.3579C193.835 74.916 194.193 74.5579 194.635 74.5579H196.084C195.972 74.0734 195.824 73.5968 195.64 73.1321C195.151 71.8924 194.418 70.7629 193.486 69.81C192.554 68.8571 191.441 68.1 190.212 67.5831C188.983 67.0662 187.664 66.8 186.33 66.8ZM202.201 76.1579H203.432C203.874 76.1579 204.232 75.7997 204.232 75.3579C204.232 74.916 203.874 74.5579 203.432 74.5579H202.437C202.548 74.0734 202.697 73.5968 202.88 73.1321C203.37 71.8923 204.102 70.7629 205.034 69.81C205.967 68.8571 207.08 68.1 208.309 67.5831C209.537 67.0662 210.857 66.8 212.19 66.8C213.523 66.8 214.843 67.0662 216.071 67.5831C217.3 68.1 218.413 68.8571 219.345 69.81C220.278 70.7629 221.01 71.8923 221.5 73.1321C221.99 74.372 222.227 75.6971 222.198 77.0298L222.197 77.0474C222.197 78.4352 221.916 79.3568 221.487 79.9875C221.063 80.6101 220.437 81.0344 219.578 81.3205C218.706 81.6114 217.628 81.7468 216.359 81.8037C215.38 81.8477 214.329 81.8439 213.206 81.8399C212.873 81.8387 212.533 81.8375 212.187 81.8375C211.841 81.8375 211.502 81.8387 211.169 81.8399C210.045 81.8439 208.995 81.8477 208.016 81.8037C206.748 81.7468 205.671 81.6114 204.799 81.3206C203.941 81.0346 203.316 80.6103 202.893 79.9877C202.464 79.3571 202.183 78.4353 202.183 77.0474L202.182 77.0298C202.176 76.7385 202.182 76.4476 202.201 76.1579Z"
        fill="#001F5C"
      />
    </svg>
  );
};