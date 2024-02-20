import IconGirl from 'images/icons/IconGirl';
import styled from 'styled-components';

export const WrapPage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 24px;
  margin-bottom: 80px;
  gap: 24px;
  @media screen and (min-width: 768px) {
    margin-top: 80px;
    margin-bottom: 178px;
    flex-direction: row-reverse;
    justify-content: space-around;
  }
  @media screen and (min-width: 1280px) {
    justify-content: space-evenly;
    margin-top: 110px;
    margin-bottom: 290px;
  }
`;
export const Picture = styled.picture``;
export const WrapText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  @media screen and (min-width: 768px) {
    gap: 24px;
  }
`;
export const Title = styled.h3`
  font-family: 'Cormorant SC', serif;
  font-size: 70px;
  font-weight: 500;
  /* font-weight: 600; */
  line-height: 1.43;
  @media screen and (min-width: 768px) {
    font-size: 100px;
    line-height: 1.1;
  }
  @media screen and (min-width: 1280px) {
    font-size: 150px;
  }

  display: flex;
  align-items: flex-start;

  color: ${({ theme }) => theme.color.mainColor4};
`;

export const Span = styled.span`
  font-size: 1.2em;
`;

export const TitleDescription = styled.p`
  font-family: 'Cormorant SC';
  font-size: 26px;
  font-weight: 500;
  /* font-weight: 600; */
  line-height: 1.3;
  text-transform: uppercase;
  @media screen and (min-width: 768px) {
    font-size: 32px;
  }
  @media screen and (min-width: 1280px) {
    font-size: 48px;
    line-height: 1.2;
  }

  color: ${({ theme }) => theme.color.mainColor4};
`;
export const Description = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.43;
  text-align: center;
  max-width: 380px;
  @media screen and (min-width: 768px) {
    font-size: 20px;
    line-height: 1.4;
    max-width: 400px;
  }
  @media screen and (min-width: 1280px) {
    max-width: 600px;
  }

  color: ${({ theme }) => theme.color.btnColorBG};
`;

export const StyledIconGirl = styled(IconGirl)`
  width: 139px;
  height: 177px;
  @media screen and (min-width: 768px) {
    width: 154px;
    height: 197px;
  }
  @media screen and (min-width: 1280px) {
    width: 193px;
    height: 246px;
  }
`;
