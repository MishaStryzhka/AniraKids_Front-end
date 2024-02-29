import IconBag from 'images/icons/IconBag';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

export const StyledNavLink = styled(NavLink)`
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;

  text-decoration: none;

  font-family: Open Sans, sans-serif;
  font-size: 20px;
  font-style: normal;
  font-weight: 400;
  line-height: 28px; /* 140% */
  letter-spacing: 0.02px;

  color: ${({ theme }) => theme.color.mainColor5};

  &.active {
    background-color: ${({ theme }) => theme.color.additionalColorBrown};
  }
`;

export const StyledButton = styled.button`
  border: none;
  background-color: transparent;

  width: 100%;
  padding: 12px 16px;

  display: flex;
  align-items: center;
  gap: 8px;

  text-decoration: none;

  font-family: Open Sans, sans-serif;
  font-size: 20px;
  font-style: normal;
  font-weight: 400;
  line-height: 28px; /* 140% */
  letter-spacing: 0.02px;

  color: ${({ theme }) => theme.color.mainColor5};

  cursor: pointer;
`;
export const StyledIconBag = styled(IconBag)`
  width: 24px;
  height: 24px;
  stroke: ${({ theme }) => theme.color.mainColor5};
`;
