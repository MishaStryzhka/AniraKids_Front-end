import * as React from 'react';
const IconShopCart = props => (
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
      <path d="M4 19a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z" />
      <path d="M12.5 17H6V3H4" />
      <path d="m6 5 14 1-.854 5.977M16.5 13H6M19 22v-6M22 19l-3-3-3 3" />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h24v24H0z" />
      </clipPath>
    </defs>
  </svg>
);
export default IconShopCart;
