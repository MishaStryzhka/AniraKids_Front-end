import { NavLink } from 'react-router-dom';

const { StyledButtonAdd } = require('./ButtonAdd.styled');

const ButtonAdd = ({ type, to, className, onClick, disabled, children }) => {
  return (
    <StyledButtonAdd
      as={to && NavLink}
      to={to}
      type={type}
      className={className}
      onClick={() => (onClick ? onClick() : null)}
      disabled={disabled}
    >
      {children}
    </StyledButtonAdd>
  );
};

export default ButtonAdd;
