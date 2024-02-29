import * as React from 'react';
const IconBag = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    // stroke="#000"
    {...props}
  >
    <g
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      clipPath="url(#a)"
    >
      <path d="M11.5 21H8.574a3 3 0 0 1-2.965-2.544l-1.255-8.152A2 2 0 0 1 6.331 8h11.34a2 2 0 0 1 1.976 2.304l-.5 3.248" />
      <path d="M9 11V6a3 3 0 1 1 6 0v5M15 19l2 2 4-4" />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h24v24H0z" />
      </clipPath>
    </defs>
  </svg>
);
export default IconBag;
