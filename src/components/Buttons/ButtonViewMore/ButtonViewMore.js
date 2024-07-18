import { NavLink, useLocation } from 'react-router-dom';
import {
  StyledButtonViewMore,
  StyledIconLongArrow,
} from './ButtonViewMore.styled';

export const ButtonViewMore = ({
  type,
  to,
  state,
  className,
  onClick,
  disabled,
  children,
  form,
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
      form={form}
    >
      {children}
      <StyledIconLongArrow />
    </StyledButtonViewMore>
  );
};
