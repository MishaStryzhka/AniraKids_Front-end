import * as React from 'react';
const IconCheck = props => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <g clipPath="url(#a)">
      <path
        stroke="#77695E"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="m5 12 5 5L20 7"
      />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h24v24H0z" />
      </clipPath>
    </defs>
  </svg>
);
export default IconCheck;
