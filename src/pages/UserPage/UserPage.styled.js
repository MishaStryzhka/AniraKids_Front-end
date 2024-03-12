import IconBag from 'images/icons/IconBag';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

export const HeaderBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  flex-direction: column;

  @media screen and (min-width: 768px) {
    flex-direction: row;
  }
`;

export const SecondBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  @media screen and (max-width: 767px) {
    margin: auto;
    width: 100%;
  }
`;

export const StyledSecondButton = styled(NavLink)`
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
