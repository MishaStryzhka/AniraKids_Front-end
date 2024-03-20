import * as React from 'react';
const IconExpectationClock = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={40}
    height={40}
    fill="none"
    className={className}
    {...props}
  >
    <g
      stroke="#AD0000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      clipPath="url(#a)"
    >
      <path d="M10.834 11.667h18.333M10.834 28.333h18.333M10 33.333V30a10 10 0 0 1 20 0v3.333A1.666 1.666 0 0 1 28.333 35H11.667A1.666 1.666 0 0 1 10 33.333Z" />
      <path d="M10 6.667V10a10 10 0 0 0 20 0V6.667A1.667 1.667 0 0 0 28.333 5H11.667A1.666 1.666 0 0 0 10 6.667Z" />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h40v40H0z" />
      </clipPath>
    </defs>
  </svg>
);
export default IconExpectationClock;
