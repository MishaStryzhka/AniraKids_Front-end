import { NavLink } from 'react-router-dom';

const { StyledButtonRent } = require('./ButtonRent.styled');

const ButtonRent = ({
  type,
  to,
  className,
  onClick,
  disabled,
  children,
  form,
}) => {
  return (
    <StyledButtonRent
      as={to && NavLink}
      to={to}
      type={type}
      className={className}
      onClick={() => (onClick ? onClick() : null)}
      disabled={disabled}
      form={form}
    >
      {children}
    </StyledButtonRent>
  );
};

export default ButtonRent;
