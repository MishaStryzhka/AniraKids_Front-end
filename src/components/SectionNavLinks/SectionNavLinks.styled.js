import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

export const WrapLinks = styled.div`
  display: flex;
  padding: 12px 0;
  gap: 48px;
  margin: 28px auto 0;
`;

export const StyledNavLink = styled(NavLink)`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;
  text-decoration: none;
  text-transform: uppercase;

  color: rgba(0, 0, 0, 1);
  color: ${({ $mainPage }) => ($mainPage ? '#fff' : '#000')};
`;
