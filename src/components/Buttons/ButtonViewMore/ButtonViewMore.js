import { NavLink, useLocation } from 'react-router-dom';
import { StyledButtonViewMore } from './ButtonViewMore.styled';
import IconLongArrow from 'images/icons/IconLongArrow';

export const ButtonViewMore = ({
  type,
  to,
  state,
  className,
  onClick,
  disabled,
  children,
}) => {
  const { pathname } = useLocation();
  return (
    <StyledButtonViewMore
      as={to && NavLink}
      to={to}
      state={state}
      type={type}
      className={className}
      onClick={() => (onClick ? onClick() : null)}
      disabled={disabled}
      $pageMyOrders={pathname === `/my-account/my-orders`}
      $pageMyPurchases={pathname === `/my-account/my-purchases`}
    >
      {children}
      <IconLongArrow />
    </StyledButtonViewMore>
  );
};
