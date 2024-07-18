import { NavLink } from 'react-router-dom';

const { StyledButtonBack } = require('./ButtonBack.styled');

const ButtonBack = ({
  type,
  to,
  className,
  onClick,
  disabled,
  children,
  form,
}) => {
  return (
    <StyledButtonBack
      as={to && NavLink}
      to={to}
      type={type}
      className={className}
      onClick={() => (onClick ? onClick() : null)}
      disabled={disabled}
      form={form}
    >
      {children}
    </StyledButtonBack>
  );
};

export default ButtonBack;
