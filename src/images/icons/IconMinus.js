import * as React from 'react';
const IconMinus = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={19}
    height={2}
    // fill="none"
    className={className}
    viewBox="0  24"
    {...props}
  >
    <path
      stroke="#77695E"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M1.334 1h16"
    />
  </svg>
);
export default IconMinus;
