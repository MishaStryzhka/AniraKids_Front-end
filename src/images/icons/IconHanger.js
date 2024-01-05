import * as React from 'react';
const IconHanger = props => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    width={24}
    height={24}
    {...props}
  >
    <g clipPath="url(#a)">
      <path
        stroke="#000"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M14 6a2 2 0 1 0-4 0c0 1.667.67 3 2 4h-.008m0 0 7.971 4.428a2 2 0 0 1 1.03 1.749V17a2 2 0 0 1-2 2h-14a2 2 0 0 1-2-2v-.823a2 2 0 0 1 1.028-1.749L11.992 10Z"
      />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h24v24H0z" />
      </clipPath>
    </defs>
  </svg>
);
export default IconHanger;
