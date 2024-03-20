import IconSuccessClock from 'images/icons/IconSuccessClock';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

export const WrapCard = styled.div`
  @media screen and (max-width: 427.5px) {
    gap: 3.7vw;
  }
  padding: 7px;
  border: 1px solid;
  border-radius: 2px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  @media screen and (min-width: 768px) {
    flex-direction: row;
  }
  border-color: ${({ theme }) => theme.color.mainColor2};
`;

export const Wrap = styled.div`
  @media screen and (max-width: 427.5px) {
    gap: 3.7vw;
  }
  display: flex;
  align-items: center;
  gap: 16px;
  @media screen and (min-width: 768px) {
    flex-direction: column;
  }
  @media screen and (min-width: 1280px) {
    width: 680px;
    justify-content: space-between;
  }
`;
export const WrapTime = styled.div`
  @media screen and (min-width: 768px) {
    display: flex;
    gap: 8px;
  }
`;
export const AddWrap = styled.div`
  @media screen and (min-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
`;
export const Picture = styled.picture`
  @media screen and (max-width: 427.5px) {
    width: 28vw;
    height: 28vw;
  }
  display: block;
  width: 120px;
  height: 120px;
  @media screen and (min-width: 768px) {
    display: none;
  }
`;

export const PictureTablet = styled.picture`
  display: none;
  @media screen and (min-width: 768px) {
    display: block;
    width: 120px;
    height: 120px;
  }
  @media screen and (min-width: 1280px) {
    width: 140px;
    height: 140px;
  }
`;
export const Image = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;
export const WrapTimeRent = styled.div`
  display: flex;
  flex-direction: column;
  @media screen and (min-width: 768px) {
    flex-direction: row-reverse;
    gap: 42px;
  }
  @media screen and (min-width: 1280px) {
    width: 680px;
    justify-content: space-between;
  }
`;

export const FirstWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  @media screen and (min-width: 768px) {
    display: block;
  }
`;

export const SecondWrap = styled.div`
  @media screen and (min-width: 768px) {
    display: flex;
    flex-direction: column;
  }
`;
export const TextRental = styled.p`
  @media screen and (max-width: 427.5px) {
    font-size: 3.3vw;
  }
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;
  color: ${({ theme }) => theme.color.additionalColorGreen};
`;

export const TextRentalTime = styled.p`
  @media screen and (max-width: 427.5px) {
    font-size: 3.3vw;
  }
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;
  margin-top: 2px;
  color: ${({ theme }) => theme.color.additionalColorGreen};
`;

export const TextOrder = styled.p`
  @media screen and (max-width: 427.5px) {
    font-size: 3.3vw;
  }
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;
  margin-top: 8px;
  color: ${({ theme }) => theme.color.mainColor3};
  @media screen and (min-width: 1280px) {
    margin-top: 0;
  }
`;
export const TextName = styled.p`
  @media screen and (max-width: 427.5px) {
    font-size: 3.3vw;
  }
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;
  text-transform: uppercase;
  color: ${({ theme }) => theme.color.mainColor5};
`;
export const TextSeller = styled.p`
  @media screen and (max-width: 427.5px) {
    font-size: 3.3vw;
  }
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;
  color: ${({ theme }) => theme.color.mainColor3};
`;
export const NavLinkMessage = styled(NavLink)`
  text-decoration: none;
  display: flex;
  gap: 4px;
  align-items: center;
`;
export const TextMessage = styled.p`
  @media screen and (max-width: 427.5px) {
    font-size: 3.3vw;
  }
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;

  color: ${({ theme }) => theme.color.mainColor2};
`;
export const WrapText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 16px 0;
  @media screen and (min-width: 768px) {
    margin: 0;
  }
  @media screen and (min-width: 1280px) {
    width: 783px;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;
export const WrapButton = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  @media screen and (min-width: 768px) {
    display: none;
  }
`;

export const WrapButtonTablet = styled.div`
  display: none;
  @media screen and (min-width: 768px) {
    display: block;
    margin-top: 16px;
  }
  @media screen and (min-width: 1280px) {
    margin-top: 0;
  }
`;

export const StyledIconSuccessClock = styled(IconSuccessClock)`
  @media screen and (max-width: 427.5px) {
    width: 5.6vw;
    height: 5.6vw;
  }
  width: 24px;
  height: 24px;
  @media screen and (min-width: 768px) {
    width: 40px;
    height: 40px;
  }
`;
