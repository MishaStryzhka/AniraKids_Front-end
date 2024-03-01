import IconBasket from 'images/icons/IconBasket';
import styled from 'styled-components';

export const WrapCardOrder = styled.div`
  @media screen and (min-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }
`;
export const TitleOrder = styled.h2`
  display: none;
  @media screen and (min-width: 768px) {
    display: block;
    font-family: 'Open Sans Hebrew', sans-serif;
    font-size: 20px;
    font-weight: 700;
    line-height: 1.4;

    color: ${({ theme }) => theme.color.mainColor5};
  }
`;
export const MainWrap = styled.div`
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  @media screen and (min-width: 768px) {
    flex-direction: row;
    align-items: center;
  }
`;
export const WrapImage = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 2px;
  overflow: hidden;
  margin: 0 auto;
  @media screen and (min-width: 768px) {
    margin: 0;
  }
`;
export const Image = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;
export const WrapGeneralText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  @media screen and (min-width: 768px) {
    width: 498px;
    gap: 16px;
  }
  @media screen and (min-width: 1280px) {
    width: 765px;
    flex-direction: row;
    justify-content: space-between;
  }
`;
export const WrapText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  @media screen and (min-width: 768px) {
    gap: 16px;
  }
`;
export const TextSeller = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;

  color: ${({ theme }) => theme.color.btnColorBG};
`;
export const TextName = styled(TextSeller)`
  text-transform: uppercase;
  color: ${({ theme }) => theme.color.mainColor5};
`;
export const SecondaryTitle = styled(TextSeller)`
  color: ${({ theme }) => theme.color.mainColor2};
`;
export const TextValue = styled(TextName)`
  text-transform: none;
`;
export const WrapSection = styled.div`
  display: flex;
  justify-content: space-between;
  @media screen and (min-width: 1280px) {
    width: 308px;
  }
`;
export const Wrap = styled.div`
  min-width: 60px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
export const WrapCalc = styled.div`
  gap: 8px;
  display: flex;
  /* justify-content: space-evenly; */
  align-items: center;
`;
export const ButtonMath = styled.button`
  width: 24px;
  height: 24px;
  cursor: pointer;
  background-color: transparent;
  border: none;
  padding: 0;
`;

export const StyledMinus = styled.div`
  width: 16px;
  border: 1px solid;
  border-radius: 2px;
  border-color: ${({ theme, $disabled }) =>
    $disabled ? theme.color.mainColor2 : theme.color.mainColor5};
  margin: 0 auto;
`;
export const ButtonDelete = styled.button`
  cursor: pointer;
  padding: 8px;
  width: 40px;
  height: 40px;
  border: none;
  background-color: transparent;
  @media screen and (min-width: 768px) {
    width: 24px;
    height: 24px;
    padding: 0;
  }
`;
export const StyledIconBasket = styled(IconBasket)`
  width: 24px;
  height: 24pc;
  stroke: ${({ theme }) => theme.color.mainColor5};
`;

export const WrapRent = styled.div``;
