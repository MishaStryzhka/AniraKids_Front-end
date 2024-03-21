import IconCheck from 'images/icons/IconCheck';
import styled from 'styled-components';

export const WrapCard = styled.div`
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
  display: flex;
  gap: 16px;
  flex-direction: column;
  @media screen and (min-width: 768px) {
    width: 536px;
  }
  @media screen and (min-width: 1280px) {
    width: 804px;
  }
`;

export const FirstWrap = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const SecondWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  @media screen and (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;
export const Picture = styled.picture`
  @media screen and (max-width: 427.5px) {
    width: 28vw;
    height: 28vw;
  }
  display: block;
  width: ${({ $pageMyPurchases }) => ($pageMyPurchases ? '150px' : '120px')};
  height: ${({ $pageMyPurchases }) => ($pageMyPurchases ? '150px' : '120px')};
  /* width: 120px;
  height: 120px; */
  border-radius: 2px;
  overflow: hidden;
  margin: 0 auto;
`;

export const Image = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const GeneralText = styled.p`
  @media screen and (max-width: 427.5px) {
    font-size: 3.3vw;
  }
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;
`;

export const TextOrder = styled(GeneralText)`
  color: ${({ theme }) => theme.color.mainColor3};
`;

export const TextDate = styled(GeneralText)`
  margin-top: 8px;
  font-weight: 400;
  color: ${({ theme }) => theme.color.mainColor2};
`;

export const TextName = styled(GeneralText)`
  text-transform: uppercase;
  color: ${({ theme }) => theme.color.mainColor5};
`;

export const TextSize = styled(GeneralText)`
  margin-top: 8px;
  color: ${({ theme }) => theme.color.mainColor5};
`;

export const TextPrice = styled(GeneralText)`
  margin-top: 4px;
  color: ${({ theme }) => theme.color.mainColor5};
`;

export const StatusSuccess = styled.div`
  @media screen and (max-width: 427.5px) {
    width: 32.7vw;
    height: 9.3vw;
    font-size: 3.5vw;
  }
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;

  width: 140px;
  height: 40px;

  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  border-radius: 50px;

  color: ${({ theme }) => theme.color.additionalColorGreen};
  background-color: ${({ theme }) => theme.color.additionalSecondColorGreen};
`;

export const StatusRejected = styled.div`
  font-family: 'Open Sans Hebrew', sans-serif;
  color: #00542c;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;

  width: 140px;
  height: 40px;
  display: flex;
  gap: 6px;
  border-radius: 50px;
  align-items: center;
  justify-content: center;

  color: ${({ theme }) => theme.color.additionalColorRed};
  background-color: ${({ theme }) => theme.color.additionalSecondColorRed};
`;

export const StyledIconCheck = styled(IconCheck)`
  width: 16px;
  height: 16px;
  stroke: ${({ theme }) => theme.color.additionalColorGreen};
`;
