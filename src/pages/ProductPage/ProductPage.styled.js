import { StyleButton } from 'components/Button/Button.styled';
import styled from 'styled-components';

export const GeneralWrap = styled.div`
  margin-bottom: 80px;
  @media screen and (min-width: 1280px) {
    margin-bottom: 132px;
  }
`;

export const WrapProductCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
  min-width: 0;
  @media screen and (min-width: 1280px) {
    flex-direction: row;
    /* gap: 20px; */
    justify-content: space-between;
  }
`;

export const WrapAllImages = styled.div`
  display: flex;
  gap: 8px;
  flex-direction: column;
  min-width: 0;
  @media screen and (min-width: 768px) {
    flex-direction: row;
    gap: 20px;
  }
`;

export const MainImage = styled.img`
  display: block;
  width: 388px;
  height: 388px;
  object-fit: cover;
  border-radius: 2px;
  @media screen and (min-width: 768px) {
    width: 482px;
    height: 540px;
  }
  @media screen and (min-width: 1280px) {
    width: 522px;
    height: 690px;
  }
`;

export const SecondaryImages = styled.img`
  display: block;
  width: 124px;
  height: 113px;
  border-radius: 2px;
  cursor: pointer;
  object-fit: cover;
  /* &:hover,
  &:active {
    border: 2px solid;
    border-color: ${({ theme }) => theme.color.mainColor2};
  } */
  @media screen and (min-width: 768px) {
    width: 186px;
    height: 175px;
  }
  @media screen and (min-width: 1280px) {
    width: 196px;
    height: 225px;
  }
`;

export const WrapSecondaryImages = styled.div`
  width: 388px;
  height: 113px;

  @media screen and (min-width: 768px) {
    height: 540px;
    width: 186px;
  }
`;

export const TextWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
  @media screen and (min-width: 1280px) {
    width: 522px;
  }
`;

export const WrapInformation = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const WrapDescription = styled.div``;

export const Wrap = styled.div`
  display: flex;
  justify-content: space-between;
  /* align-items: center; */
`;

export const WrapInside = styled.div`
  display: flex;
  align-items: end;
  flex-direction: column;
  gap: 8px;
`;

export const Title = styled.h2`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
  text-transform: uppercase;

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const TextSale = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;
  margin-right: 0;
  text-transform: uppercase;
  padding: 8px 16px;
  border-radius: 50px;

  color: ${({ theme }) => theme.color.mainColor4};
  background-color: ${({ theme }) => theme.color.lightBGColor};
`;
export const TextSeller = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;

  color: ${({ theme }) => theme.color.btnColorBG};
`;
export const TextSize = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const TextValueSize = styled.span`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 20px;

  font-weight: 400;
  line-height: 1.4;
  text-transform: uppercase;

  color: ${({ theme }) => theme.color.mainColor5};
`;
export const TextPrice = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 32px;
  font-weight: 700;
  line-height: 1.25;
  display: flex;
  gap: 8px;

  color: ${({ theme }) => theme.color.btnColorBG};
`;

export const WrapBtn = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 0 auto;
`;

export const Border = styled.div`
  width: 100%;
  height: 1px;
  margin-bottom: 24px;
  background-color: ${({ theme }) => theme.color.mainColor2};
`;
export const TitleDescription = styled(Title)`
  margin-bottom: 8px;
`;
export const ListDescription = styled.ul`
  margin-bottom: 24px;
`;
export const ItemDescription = styled.li``;
export const TextDescription = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;

  color: ${({ theme }) => theme.color.mainColor5};
`;
export const WrapColor = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;
export const Color = styled.div`
  width: 18px;
  height: 18px;
  padding: 3px;
  border-radius: 2px;
  border: 1px solid #00000030;

  /* background-color: ; */
`;

export const WrapReviews = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 40px;
  @media screen and (min-width: 1280px) {
    width: 1064px;
    margin: 40px auto 0;
  }
`;

export const ListReviews = styled.ul`
  width: 100%;
`;

export const ItemReview = styled.li`
  padding: 40px 0;
  border-top: 1px solid;
  @media screen and (min-width: 768px) {
    display: flex;
    gap: 40px;
  }
  @media screen and (min-width: 1280px) {
    gap: 64px;
  }
  border-color: ${({ theme }) => theme.color.mainColor2};
`;

export const WrapPerson = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 40px;
`;
export const PicturePerson = styled.picture`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid;

  /* background-color: gray; */
  border-color: ${({ theme }) => theme.color.mainColor2};
`;

export const ImagesPerson = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
`;

export const TitleName = styled(Title)`
  font-size: 14px;
  line-height: 1.43;
`;

export const WrapInfo = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const WrapPersonInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  @media screen and (min-width: 768px) {
    width: 446px;
  }
  @media screen and (min-width: 768px) {
    width: 798px;
  }
`;

export const WrapIconsStars = styled.div`
  display: flex;
  gap: 8px;
`;

export const WrapTimeRent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const TextRent = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;

  color: ${({ theme }) => theme.color.mainColor2};
`;

export const TextRentValue = styled(TextRent)`
  font-weight: 400;
`;

export const TextReview = styled(TextRent)`
  font-weight: 400;
  color: ${({ theme }) => theme.color.mainColor5};
`;

export const ButtonPreview = styled(StyleButton)`
  margin: 0 auto;
`;

export const WrapCalendar = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

export const ButtonCalendarTime = styled.button`
  cursor: pointer;
  padding: 0;
  border: none;
  background-color: transparent;
`;
export const TextCalendar = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;

  color: ${({ theme }) => theme.color.btnColorBG};
`;

export const List = styled.ul`
  display: flex;
  gap: 8px;
  min-width: 0;
  @media screen and (min-width: 768px) {
    flex-direction: column;
    height: 540px;
  }
  @media screen and (min-width: 1280px) {
    height: 690px;
    width: 196px;
  }
`;
