import Button from 'components/Button/Button';
import IconBasket from 'images/icons/IconBasket';
import IconPencil from 'images/icons/IconPencil';
import IconStar from 'images/icons/IconStart';
import styled from 'styled-components';

export const Card = styled.div`
  width: ${({ $pageRentOut }) => ($pageRentOut ? '305px' : '184px')};
  display: flex;
  flex-direction: column;
  gap: ${({ $pageRentOut }) => ($pageRentOut ? '16px' : '8px')};
  /* gap: 16px; */
  @media screen and (min-width: 768px) {
    gap: ${({ $pageRentOut }) => ($pageRentOut ? '16px' : '12px')};
  }
  position: relative;
  @media screen and (min-width: 768px) {
    width: 305px;
  }
`;

export const GeneralWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  @media screen and (min-width: 768px) {
    gap: ${({ $pageRentOut }) => ($pageRentOut ? '8px' : '12px')};
  }
`;

export const PictureCard = styled.picture`
  width: inherit;
  height: ${({ $pageRentOut }) => ($pageRentOut ? '350px' : '200px')};
  width: ${({ $pageRentOut }) => ($pageRentOut ? '305px' : '184px')};
  border-radius: 2px;
  overflow: hidden;
  @media screen and (min-width: 768px) {
    width: 305px;
    height: 350px;
  }
`;

export const Image = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;
export const ButtonAddToFavorites = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 50px;
  padding: 3px;
  border: none;

  position: absolute;
  top: 8px;
  right: 8px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;

  background-color: ${({ theme }) => theme.color.lightBGColor};
`;

export const WrapText = styled.div`
  display: flex;
  gap: 8px;
  flex-direction: column;
`;

export const FirstWrap = styled.div`
  display: flex;
  flex-direction: ${({ $pageRentOut }) => ($pageRentOut ? 'row' : 'column')};
  justify-content: space-between;
  align-items: ${({ $pageRentOut }) => ($pageRentOut ? 'center' : 'stretch')};
  @media screen and (min-width: 768px) {
    flex-direction: row;
    align-items: center;
  }
`;

export const SecondWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const TextName = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;
  text-transform: uppercase;

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const TextSize = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const Span = styled.span`
  font-weight: 700;
  margin-right: 8px;
`;

export const Price = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;
  text-transform: uppercase;

  width: ${({ $pageRentOut }) => ($pageRentOut ? '180px' : '')};
  padding: 8px;
  display: flex;
  justify-content: center;

  border-radius: 50px;

  @media screen and (min-width: 768px) {
    width: 180px;
    padding: 8px 0;
  }
  background-color: ${({ theme }) => theme.color.lightBGColor};

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const TextPrice = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;

  color: ${({ theme }) => theme.color.mainColor3};
`;
export const IconPencilStyled = styled(IconPencil)`
  stroke: ${({ theme }) => theme.color.mainColor4};
  transition: stroke 250ms cubic-bezier(0.4, 0, 0.2, 1);
`;

export const ButtonUpdate = styled(Button)`
  border: 1px solid;
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: self-end;

  background-color: ${({ theme }) => theme.color.mainColor1};
  color: ${({ theme }) => theme.color.mainColor4};
  border-color: ${({ theme }) => theme.color.btnColorBG};
  stroke: ${({ theme }) => theme.color.mainColor4};

  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);

  // наводячи на кнопку ховер спрацьовує на дочірний елемент - іконку
  &:hover > ${IconPencilStyled} {
    stroke: ${({ theme }) => theme.color.btnColorBG};
  }

  &:hover {
    color: ${({ theme }) => theme.color.btnColorBG};
  }

  &:active {
    color: ${({ theme }) => theme.color.mainColor1};
    background-color: ${({ theme }) => theme.color.btnColorBG};
  }

  &:active > ${IconPencilStyled} {
    stroke: ${({ theme }) => theme.color.mainColor1};
  }
`;

export const IconBasketStyled = styled(IconBasket)`
  stroke: ${({ theme }) => theme.color.mainColor1};
  transition: stroke 250ms cubic-bezier(0.4, 0, 0.2, 1);
`;

export const ButtonRemove = styled(Button)`
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: self-end;

  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background-color: ${({ theme }) => theme.color.mainColor3};
  }

  &:active > ${IconBasketStyled} {
    stroke: ${({ theme }) => theme.color.mainColor5};
  }

  &:active {
    background-color: ${({ theme }) => theme.color.mainColor3};
    color: ${({ theme }) => theme.color.mainColor5};
  }
`;

export const WrapPartSeller = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;
export const PictureSeller = styled.picture`
  display: block;
  width: 34px;
  height: 34px;
  border-radius: 100px;
  border: 1px solid;
  border-color: ${({ theme }) => theme.color.lightBGColor};
  overflow: hidden;
`;
export const ImageSeller = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;
export const WrapTextSeller = styled.div`
  display: flex;
  gap: 2px;
  align-items: center;
  @media screen and (min-width: 768px) {
    gap: 8px;
  }
`;

export const UserNickname = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 10px;
  font-weight: 300;
  line-height: 18px;

  color: ${({ theme }) => theme.color.mainColor4};
`;
export const WrapIconsStars = styled.div`
  display: flex;
  gap: 2px;
`;

export const StyledIconStar = styled(IconStar)`
  width: 12px;
  height: 12px;
  fill: ${({ theme }) => theme.color.mainColor2};
`;

export const StyledIconStarOutline = styled(IconStar)`
  width: 12px;
  height: 12px;
  stroke: ${({ theme }) => theme.color.mainColor2};
`;

export const TextRating = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 10px;
  font-weight: 700;
  line-height: 1.8;
  margin-top: 2px;
  @media screen and (min-width: 768px) {
    margin-top: 0;
    font-size: 14px;
    line-height: 1.43;
  }

  color: ${({ theme }) => theme.color.mainColor4};
`;
