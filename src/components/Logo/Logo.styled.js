import IconLogo from 'images/icons/Icon';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

export const StyledNavLink = styled(NavLink)`
  height: 40px;
  @media screen and (min-width: 1280px) {
    ${({ $isHeader }) => $isHeader && 'margin: 0 160px;'}
    height: 80px;
  }
`;

export const StyledIconLogo = styled(IconLogo)`
  width: 70px;
  height: 40px;
  @media screen and (min-width: 1280px) {
    width: 140px;
    height: 80px;
  }
`;
