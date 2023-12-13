import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

export const WrapLinks = styled.div`
  display: flex;
  gap: 48px;
`;

export const StyledNavLink = styled(NavLink)`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;
  text-decoration: none;
  text-transform: uppercase;

  color: ${({ theme }) => theme.color.mainColor5};
  color: ${({ $mainPage, theme }) =>
    $mainPage ? theme.color.mainColor1 : theme.color.mainColor5};
`;
