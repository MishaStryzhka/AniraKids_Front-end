import * as React from 'react';
const IconClose = props => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    width="24px"
    height="24px"
    {...props}
  >
    <g
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      clipPath="url(#a)"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h24v24H0z" />
      </clipPath>
    </defs>
  </svg>
);
export default IconClose;
