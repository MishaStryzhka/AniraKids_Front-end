import { NavLink } from 'react-router-dom';
import { StyledButtonViewMore } from './ButtonViewMore.styled';
import IconLongArrow from 'images/icons/IconLongArrow';

export const ButtonViewMore = ({
  type,
  to,
  className,
  onClick,
  disabled,
  children,
}) => {
  return (
    <StyledButtonViewMore
      as={to && NavLink}
      to={to}
      type={type}
      className={className}
      onClick={() => (onClick ? onClick() : null)}
      disabled={disabled}
    >
      {children}
      <IconLongArrow />
    </StyledButtonViewMore>
  );
};
