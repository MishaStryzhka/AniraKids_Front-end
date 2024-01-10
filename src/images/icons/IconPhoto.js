import * as React from 'react';
const IconPhoto = props => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={40}
    height={40}
    fill="none"
    {...props}
  >
    <g
      stroke="#C6A58D"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      clipPath="url(#a)"
    >
      <path d="M20 33.333H8.333A3.333 3.333 0 0 1 5 30V15a3.333 3.333 0 0 1 3.333-3.333H10a3.333 3.333 0 0 0 3.333-3.334A1.667 1.667 0 0 1 15 6.667h10a1.667 1.667 0 0 1 1.667 1.666A3.333 3.333 0 0 0 30 11.667h1.667A3.333 3.333 0 0 1 35 15v5.833M26.666 31.667h10M31.666 26.667v10" />
      <path d="M15 21.667a5 5 0 1 0 10 0 5 5 0 0 0-10 0Z" />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h40v40H0z" />
      </clipPath>
    </defs>
  </svg>
);
export default IconPhoto;
