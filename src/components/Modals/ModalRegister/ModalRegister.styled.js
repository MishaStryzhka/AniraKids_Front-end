import styled from 'styled-components';
import PhotoBgClothes from 'images/clothes.jpg';
import { NavLink } from 'react-router-dom';

export const ModalWindow = styled.div`
  width: 992px;
  height: 668px;

  background-color: ${({ theme }) => theme.color.mainColor1};
  background-image: url(${PhotoBgClothes});
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  z-index: 1;
  position: relative;
`;

export const WrapForm = styled.div`
  background-color: rgba(255, 255, 255, 0.9);
  position: absolute;
  z-index: 3;
  height: 588px;
  max-width: 400px;
  padding: 40px 48px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const BoxButtonsNavigation = styled.div`
  display: flex;
`;

export const ButtonNav = styled.button`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0.02px;
  background-color: transparent;
  border: transparent;
  border-bottom: 2px solid #000;
  width: 200px;
  text-align: center;
  padding: 8px 0;
  text-transform: uppercase;
  cursor: pointer;

  color: ${({ $isActive, theme }) =>
    $isActive ? theme.color.mainColor5 : theme.color.mainColor2};
  border-color: ${({ $isActive, theme }) =>
    $isActive ? theme.color.mainColor5 : theme.color.mainColor2};
`;

export const Description = styled.p`
  text-align: center;
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const WrapButton = styled.div`
  display: flex;
`;

export const ButtonContact = styled.button`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;
  border: transparent;
  border-bottom: 2px solid;
  background-color: transparent;
  width: 200px;
  text-align: center;
  padding: 8px 0;
  cursor: pointer;

  color: ${({ $isActive, theme }) =>
    $isActive ? theme.color.mainColor5 : theme.color.mainColor2};
  border-color: ${({ $isActive, theme }) =>
    $isActive ? theme.color.mainColor5 : theme.color.mainColor2};
`;

export const Separation = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0.02px;
  position: relative;
  display: flex;
  justify-content: center;

  color: ${({ theme }) => theme.color.mainColor5};

  &::before {
    content: '';
    display: block;
    height: 2px;
    width: 162.5px;
    position: absolute;
    top: 50%;
    left: 0;

    background-color: ${({ theme }) => theme.color.mainColor5};
  }

  &::after {
    content: '';
    display: block;
    height: 2px;
    width: 162.5px;
    position: absolute;
    top: 50%;
    right: 0;

    background-color: ${({ theme }) => theme.color.mainColor5};
  }
`;

export const WrapLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;
`;

export const StyledNavLink = styled(NavLink)`
  width: 70px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-decoration: none;
  align-items: center;
  cursor: pointer;
`;

export const DescriptionLink = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;

  color: ${({ theme }) => theme.color.mainColor5};
`;
