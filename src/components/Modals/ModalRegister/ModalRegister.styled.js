import styled from 'styled-components';
import PhotoBgClothes from 'images/clothes.jpg';
import PhotoBgMobileClothers from 'images/bg-clothers-mobile.jpg';
import PhotoBgTabletClothers from 'images/bg-clothers-tablet.jpg';

export const ModalWindow = styled.div`
  @media screen and (max-width: 427.5px) {
    width: 100vw;
  }
  width: 428px;
  height: 628px;

  background-color: ${({ theme }) => theme.color.mainColor1};
  background-image: url(${PhotoBgMobileClothers});
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  z-index: 1;
  position: relative;

  @media screen and (min-width: 768px) {
    background-image: url(${PhotoBgTabletClothers});
    width: 768px;
  }
  @media screen and (min-width: 1280px) {
    background-image: url(${PhotoBgClothes});
    width: 992px;
    height: 668px;
  }
`;

export const WrapForm = styled.div`
  @media screen and (max-width: 427.5px) {
    max-width: 100vw;
  }
  background-color: rgba(255, 255, 255, 0.9);
  position: absolute;
  z-index: 3;
  max-width: 428px;
  height: 588px;
  padding: 20px 14px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  @media screen and (min-width: 768px) {
    padding: 20px 20px;
    max-width: 400px;
  }
  @media screen and (min-width: 1280px) {
    padding: 40px 48px;
  }
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
  @media screen and (max-width: 427.5px) {
    font-size: 5.2vw;
    width: 46.7vw;
  }
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
  @media screen and (max-width: 427.5px) {
    font-size: 3.3vw;
  }
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
  @media screen and (max-width: 427.5px) {
    font-size: 3.7vw;
    width: 46.7vw;
  }
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
  @media screen and (max-width: 427.5px) {
    font-size: 4.7vw;
  }
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0.02px;
  position: relative;
  display: flex;
  justify-content: center;
  text-transform: uppercase;

  color: ${({ theme }) => theme.color.mainColor5};

  &::before {
    @media screen and (max-width: 427.5px) {
      width: 34vw;
    }
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
    @media screen and (max-width: 427.5px) {
      width: 34vw;
    }
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
  align-items: center;
  gap: 24px;
`;

export const StyledNavLink = styled.a`
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-decoration: none;
  align-items: center;
  cursor: pointer;
`;

export const StyledSeznamWrap = styled.div`
  @media screen and (max-width: 427.5px) {
    width: 8.4vw;
  }
  display: flex;
  width: 36px;
  height: 36px;
  justify-content: center;
  align-items: center;
  border: 2px solid #cc0000;
  border-radius: 4px;
  &:hover {
    box-shadow: ${({ theme }) => theme.color.boxShadow};
  }
`;

export const DescriptionLink = styled.p`
  @media screen and (max-width: 427.5px) {
    font-size: 3.3vw;
  }
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;

  color: ${({ theme }) => theme.color.mainColor5};
`;
