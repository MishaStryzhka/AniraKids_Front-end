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
  padding: 40px 48px;
`;

export const Form = styled.div`
  width: 400px;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
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

  color: ${({ isActive }) => (isActive ? '#000' : '#C6A58D')};
  border-color: ${({ isActive }) => (isActive ? '#000' : '#C6A58D')};

  /* color: ${({ theme }) => theme.color.mainColor2}; */
`;

export const Description = styled.p`
  text-align: center;
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const Label = styled.label`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;

  color: ${({ theme }) => theme.color.mainColor5};

  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const Input = styled.input`
  border-radius: 2px;
  border: 1px solid;
  padding: 8px;
  outline: none;

  border-color: ${({ theme }) => theme.color.mainColor2};

  &::placeholder {
    font-family: 'Open Sans Hebrew', sans-serif;
    font-size: 14px;
    font-weight: 400;
    line-height: 1.43;

    color: ${({ theme }) => theme.color.lightBGColor};
  }
`;

export const Wrap = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const Separation = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0.02px;
  position: relative;
  display: block;

  color: ${({ theme }) => theme.color.mainColor5};

  &::before {
    content: '';
    display: block;
    height: 2px;
    width: 162.5px;
    position: absolute;
    top: 50%;
    left: -177.5px;

    background-color: ${({ theme }) => theme.color.mainColor5};
  }

  &::after {
    content: '';
    display: block;
    height: 2px;
    width: 162.5px;
    position: absolute;
    top: 50%;
    left: 60px;

    background-color: ${({ theme }) => theme.color.mainColor5};
  }
`;

export const WrapLinks = styled.div`
  display: flex;
  gap: 24px;
`;

export const StyledNavLink = styled(NavLink)`
  width: 70px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-decoration: none;
  align-items: center;
`;

export const DescriptionLink = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const TextCondition = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  text-align: center;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const StyledNavLinkCondition = styled(NavLink)`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;
  text-decoration: none;
  margin-left: 5px;

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
  /* margin: 0 auto; */

  color: ${({ isActive }) => (isActive ? '#000' : '#C6A58D')};
  border-color: ${({ isActive }) => (isActive ? '#000' : '#C6A58D')};
`;

export const TitleLogin = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  text-align: center;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;
  border: transparent;
  border-bottom: 2px solid #000;
  background-color: transparent;
  padding: 8px 0;
  width: 400px;

  color: ${({ theme }) => theme.color.mainColor5};
`;
