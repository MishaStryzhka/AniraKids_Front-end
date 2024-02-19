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

export const SecondBox = styled.div``;

export const StyledNavLink = styled(NavLink)`
  color: ${({ theme }) => theme.color.mainColor5};
  text-align: center;

  font-family: 'Open Sans', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px; /* 142.857% */
  text-decoration-line: none;
  padding: 8px 4px;
  @media screen and (min-width: 1280px) {
    padding: 8px 16px;
  }

  &.active {
    ${({ $notActive }) => !$notActive && 'font-weight: 700;'}
  }
`;

export const StyledSecondButton = styled(NavLink)`
  ${({ to }) => to && 'position: absolute; right: 0; top: 24px;'}

  box-sizing: border-box;
  width: 305px;
  padding: 14px 40px;

  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;

  border-radius: 2px;
  border: 1px solid ${({ theme }) => theme.color.mainColor3};

  color: ${({ theme }) => theme.color.mainColor3};
  text-align: center;

  font-family: Open Sans, sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 20px; /* 142.857% */

  text-decoration: none;
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
