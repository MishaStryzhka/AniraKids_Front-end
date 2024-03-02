import { NavLink } from 'react-router-dom';

const { StyledButtonAdd } = require('./ButtonAdd.styled');

const ButtonAdd = ({ type = 'button', to, className, onClick, children }) => {
  return (
    <StyledButtonAdd
      as={to && NavLink}
      to={to}
      type={type}
      className={className}
      onClick={() => onClick()}
    >
      {children}
    </StyledButtonAdd>
  );
};

export default ButtonAdd;
