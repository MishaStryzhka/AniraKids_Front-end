import * as React from 'react';
const Iconlanguage = props => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    width={24}
    height={24}
    {...props}
  >
    <g
      stroke="#77695E"
      strokeLinecap="round"
      strokeLinejoin="round"
      clipPath="url(#a)"
    >
      <path strokeWidth={1.55} d="M3 12a9 9 0 1 0 18.001 0A9 9 0 0 0 3 12Z" />
      <path strokeWidth={1.5} d="M3.6 9h16.8M3.6 15h16.8" />
      <path
        strokeWidth={1.55}
        d="M11.5 3a17 17 0 0 0 0 18M12.5 3a17 17 0 0 1 0 18"
      />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h24v24H0z" />
      </clipPath>
    </defs>
  </svg>
);
export default Iconlanguage;
