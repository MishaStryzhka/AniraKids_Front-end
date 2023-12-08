import * as React from 'react';
const IconPerson = (props) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width={24}
    height={24}
    fill='none'
    {...props}
  >
    <g
      stroke='#000'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth={1.5}
      clipPath='url(#a)'
    >
      <path d='M8 8a4 4 0 1 0 8 0 4 4 0 0 0-8 0ZM6 20v-2a4 4 0 0 1 4-4l.787.197c.796.199 1.63.199 2.426 0L14 14a4 4 0 0 1 4 4v2' />
    </g>
    <defs>
      <clipPath id='a'>
        <path fill='#fff' d='M0 0h24v24H0z' />
      </clipPath>
    </defs>
  </svg>
);
export default IconPerson;
