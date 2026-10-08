import styled from 'styled-components';
import PhotoBgClothes from 'images/clothes.jpg';
import PhotoBgMobileClothers from 'images/bg-clothers-mobile.jpg';
import PhotoBgTabletClothers from 'images/bg-clothers-tablet.jpg';

export const ModalWindow = styled.div`
  width: 100%;
  min-width: 0;
  background-color: ${({ theme }) => theme.color.mainColor1};
  background-image: url(${PhotoBgMobileClothers});
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  position: relative;
  @media (min-width: 768px) {
    background-image: url(${PhotoBgTabletClothers});
  }
  @media (min-width: 1280px) {
    background-image: url(${PhotoBgClothes});
  }
`;
export const WrapForm = styled.div`
  background-color: rgba(255, 255, 255, 0.9);
  position: relative;
  z-index: 3;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  padding: 56px 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  @media (min-width: 768px) {
    width: 448px;
    padding: 56px 24px 32px;
  }
  @media (min-width: 1280px) {
    width: 496px;
    padding: 56px 48px 40px;
  }
  & *,
  & *::before,
  & *::after {
    box-sizing: border-box;
  }
  & form,
  & label {
    width: 100%;
    max-width: 100%;
    min-width: 0;
  }
  & input {
    width: 100%;
    min-width: 0;
    font-size: 16px;
    min-height: 44px;
  }
  & input::placeholder {
    font-size: 16px;
  }
  & input:focus-visible,
  & button:focus-visible,
  & a:focus-visible {
    outline: 2px solid #77695e;
    outline-offset: 2px;
  }
  & form button {
    max-width: 100%;
    min-height: 44px;
  }
  & form p {
    max-width: 100%;
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
    font-size: 18px;
    width: 50%;
  }
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0.02px;
  background-color: transparent;
  border: transparent;
  border-bottom: 2px solid #000;
  width: 50%;
  min-width: 0;
  min-height: 44px;
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
    width: 50%;
  }
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;
  border: transparent;
  border-bottom: 2px solid;
  background-color: transparent;
  width: 50%;
  min-width: 0;
  min-height: 44px;
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
      width: 40%;
    }
    content: '';
    display: block;
    height: 2px;
    width: 40%;
    position: absolute;
    top: 50%;
    left: 0;

    background-color: ${({ theme }) => theme.color.mainColor5};
  }

  &::after {
    @media screen and (max-width: 427.5px) {
      width: 40%;
    }
    content: '';
    display: block;
    height: 2px;
    width: 40%;
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
