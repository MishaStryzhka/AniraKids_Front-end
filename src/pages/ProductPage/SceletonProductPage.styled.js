import Sceleton from 'components/Sceleton/Sceleton';
import styled from 'styled-components';

export const SceletonMainImage = styled(Sceleton)`
  @media screen and (max-width: 427.5px) {
    width: 90.7vw;
    height: 90.7vw;
  }
  width: 388px;
  height: 388px;
  @media screen and (min-width: 768px) {
    width: 482px;
    height: 540px;
  }
  @media screen and (min-width: 1280px) {
    width: 572px;
    height: 690px;
  }
`;

export const SceletonSecondImage = styled(Sceleton)`
  @media screen and (max-width: 427.5px) {
    width: 29vw;
    height: 26.4vw;
  }
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

export const SceletonTitle = styled(Sceleton)`
  @media screen and (max-width: 427.5px) {
    width: 52.6vw;
    height: 6.5vw;
  }
  width: 225px;
  height: 28px;
`;

export const SceletonTextSeller = styled(Sceleton)`
  @media screen and (max-width: 427.5px) {
    width: 33.4vw;
    height: 4.7vw;
  }
  width: 143px;
  height: 20px;
`;

export const SceletonTextSize = styled(Sceleton)`
  @media screen and (max-width: 427.5px) {
    width: 18.2vw;
    height: 6.5vw;
  }
  width: 78px;
  height: 28px;
`;

export const SceletonTextValueSize = styled(Sceleton)`
  @media screen and (max-width: 427.5px) {
    width: 10.7vw;
    height: 6.5vw;
  }
  width: 46px;
  height: 28px;
`;

export const WrapPrice = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
`;

export const WrapInsidePrice = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const SceletonNamePrice = styled(Sceleton)`
  width: 88px;
  height: 36px;
  border-radius: 50px;
`;

export const SceletonTextPrice = styled(Sceleton)`
  width: 160px;
  height: 40px;
`;

export const SceletonCalendar = styled(Sceleton)`
  width: 150px;
  height: 24px;
`;

export const SceletonBtn = styled(Sceleton)`
  @media screen and (max-width: 427.5px) {
    width: 35vw;
    height: 9.3vw;
  }
  width: 150px;
  height: 40px;
  @media screen and (min-width: 768px) {
    width: 220px;
  }
`;

export const SceletonIcon = styled(Sceleton)`
  width: 24px;
  height: 24px;
`;

export const SceletonTitleDescription = styled(Sceleton)`
  width: 200px;
  height: 28px;
  margin-bottom: 10px;
`;
export const SceletonDescription = styled(Sceleton)`
  @media screen and (max-width: 427.5px) {
    width: 90.7vw;
  }
  width: 388px;
  height: 20px;
  margin-bottom: 16px;
  @media screen and (min-width: 768px) {
    width: 688px;
  }
  @media screen and (min-width: 1280px) {
    width: 522px;
  }
`;
