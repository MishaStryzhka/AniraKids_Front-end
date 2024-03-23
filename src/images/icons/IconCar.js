import * as React from 'react';
const IconCar = props => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="none"
    {...props}
  >
    <g
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      clipPath="url(#a)"
    >
      <path d="M4.168 14.167a1.667 1.667 0 1 0 3.333 0 1.667 1.667 0 0 0-3.333 0ZM12.5 14.167a1.667 1.667 0 1 0 3.333 0 1.667 1.667 0 0 0-3.333 0Z" />
      <path d="M4.168 14.167H2.501v-3.334m-.833-6.666h9.167v10m-3.334 0h5m3.334 0H17.5v-5m0 0h-6.666m6.666 0L15.001 5h-4.166M2.5 7.5h3.333" />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h20v20H0z" />
      </clipPath>
    </defs>
  </svg>
);
export default IconCar;
