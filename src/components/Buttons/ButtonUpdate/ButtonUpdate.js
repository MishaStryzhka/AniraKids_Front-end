import { NavLink } from 'react-router-dom';

const { StyledButtonUpdate } = require('./ButtonUpdate.styled');

const ButtonUpdate = ({ type, to, className, onClick, disabled, children }) => {
  return (
    <StyledButtonUpdate
      as={to && NavLink}
      to={to}
      type={type}
      className={className}
      onClick={() => (onClick ? onClick() : null)}
      disabled={disabled}
    >
      {children}
    </StyledButtonUpdate>
  );
};

export default ButtonUpdate;
