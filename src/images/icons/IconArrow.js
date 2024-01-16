import * as React from 'react';
const IconArrow = ({ fill, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    width="24px"
    height="24px"
    {...props}
  >
    <g clipPath="url(#a)">
      <path
        stroke={fill}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
        d="m10 16 4-4-4-4"
        height={24}
      />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h24v24H0z" />
      </clipPath>
    </defs>
  </svg>
);
export default IconArrow;
