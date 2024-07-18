import { NavLink } from 'react-router-dom';

const { StyledButtonRemove } = require('./ButtonRemove.styled');

const ButtonRemove = ({
  type,
  to,
  className,
  onClick,
  disabled,
  children,
  form,
}) => {
  return (
    <StyledButtonRemove
      as={to && NavLink}
      to={to}
      type={type}
      className={className}
      onClick={() => (onClick ? onClick() : null)}
      disabled={disabled}
      form={form}
    >
      {children}
    </StyledButtonRemove>
  );
};

export default ButtonRemove;
