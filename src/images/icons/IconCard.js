import * as React from 'react';
const IconCard = props => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    width={24}
    height={24}
    {...props}
  >
    <g
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      clipPath="url(#a)"
    >
      <path d="M3 8a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8ZM3 10h18M7 15h.01M11 15h2" />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h24v24H0z" />
      </clipPath>
    </defs>
  </svg>
);
export default IconCard;
