import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

export const NavigationWrapper = styled.div`
  padding: 24px 0;
  display: flex;
  gap: 4px;
`;

export const StyledNavLink = styled(NavLink)`
  color: ${({ theme }) => theme.color.mainColor5};
  text-align: center;

  //   font-family: Open Sans Hebrew;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px; /* 142.857% */
  text-decoration-line: none;
  ${e => console.log('e', e)}

  &.active {
    font-weight: 700;
  }
`;
