import Button from 'components/Button/Button';
import IconBasket from 'images/icons/IconBasket';
import IconPencil from 'images/icons/IconPencil';
import styled from 'styled-components';

export const ItemCard = styled.li`
  width: 305px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
`;

export const GeneralWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const PictureCard = styled.picture`
  width: inherit;
  height: 350px;
  width: 305px;
  border-radius: 2px;
  overflow: hidden;
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

export const Wrap = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
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

  width: 180px;
  padding: 8px 0;
  display: flex;
  justify-content: center;

  border-radius: 50px;
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

  background-color: transparent;
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
