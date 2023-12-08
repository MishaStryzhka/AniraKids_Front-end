import * as React from 'react';
const IconSearch = (props) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width={25}
    height={24}
    fill='none'
    {...props}
  >
    <g
      stroke='#EBDAD1'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={1.5}
      clipPath='url(#a)'
    >
      <path d='M3.333 10a7 7 0 1 0 14 0 7 7 0 0 0-14 0ZM21.333 21l-6-6' />
    </g>
    <defs>
      <clipPath id='a'>
        <path fill='#fff' d='M.333 0h24v24h-24z' />
      </clipPath>
    </defs>
  </svg>
);
export default IconSearch;
