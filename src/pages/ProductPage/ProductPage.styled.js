import styled from 'styled-components';

export const WrapProductCard = styled.div`
  margin-bottom: 80px;
  display: flex;
  flex-direction: column;
  gap: 40px;
  @media screen and (min-width: 1280px) {
    flex-direction: row;
    gap: 20px;
  }
`;

export const WrapAllImages = styled.div`
  display: flex;
  gap: 8px;
  flex-direction: column;
  @media screen and (min-width: 768px) {
    flex-direction: row;
    gap: 20px;
  }
`;

export const MainImage = styled.img`
  display: block;
  width: 388px;
  height: 388px;
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
  display: flex;
  gap: 8px;
  @media screen and (min-width: 768px) {
    flex-direction: column;
  }
`;

export const TextWrap = styled.div`
  @media screen and (min-width: 1280px) {
    max-width: 522px;
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
  align-items: center;
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
  color: #00542c;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;
  margin-right: 0;
  text-transform: uppercase;

  color: ${({ theme }) => theme.color.additionalColorGreen};
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
  margin-top: 40px;
  margin-bottom: 24px;
  background-color: ${({ theme }) => theme.color.btnColorBG};
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

  background-color: ${({ theme }) => theme.color.mainColor5};
`;
