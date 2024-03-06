import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

export const NavList = styled.ul`
  @media screen and (max-width: 427.5px) {
    gap: 3.7vw;
  }
  display: flex;
  flex-direction: ${({ $mainPage }) => ($mainPage ? 'row' : 'column')};
  @media screen and (min-width: 1280px) {
    flex-direction: row;
  }
  gap: 16px;
`;

export const StyledNavLink = styled(NavLink)`
  @media screen and (max-width: 427.5px) {
    font-size: 3.3vw;
  }
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
