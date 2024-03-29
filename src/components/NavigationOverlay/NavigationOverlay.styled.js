import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

export const TabBar = styled.div`
  position: relative;
`;

export const NavigationWrapper = styled.div`
  padding-top: 24px;
  display: flex;
  gap: 4px;
  align-items: center;
`;

export const StyledNavLink = styled(NavLink)`
  @media screen and (max-width: 427.5px) {
    font-size: 3.3vw;
  }
  color: ${({ theme }) => theme.color.mainColor5};
  text-align: center;
  font-family: 'Open Sans', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 1.43;
  text-decoration-line: none;
  padding: 8px 4px;
  @media screen and (min-width: 1280px) {
    padding: 8px 16px;
  }

  &.active {
    ${({ $notActive }) => !$notActive && 'font-weight: 700;'}
  }
`;

export const MenuButton = styled.button`
  display: flex;
  align-items: center;
  cursor: pointer;
  border: none;
  background: transparent;

  padding: 0 6px;
  @media screen and (min-width: 1280px) {
    display: none;
  }
`;
