import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

export const NavigationWrapper = styled.div`
  padding-top: 24px;
  display: flex;
  gap: 4px;
  align-items: center;
`;

export const StyledNavLink = styled(NavLink)`
  color: ${({ theme }) => theme.color.mainColor5};
  text-align: center;

  font-family: 'Open Sans', sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px; /* 142.857% */
  text-decoration-line: none;
  padding: 8px 16px;

  &.active {
    font-weight: 700;
  }
`;
