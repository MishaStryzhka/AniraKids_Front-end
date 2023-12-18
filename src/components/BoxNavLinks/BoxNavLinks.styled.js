import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

export const NavList = styled.ul`
  display: flex;
  gap: 16px;
`;

export const StyledNavLink = styled(NavLink)`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;
  text-decoration: none;
  text-transform: uppercase;
  padding: 8px 16px;

  color: ${({ theme }) => theme.color.mainColor5};
  color: ${({ $mainPage, theme }) =>
    $mainPage ? theme.color.mainColor1 : theme.color.mainColor5};
`;
