import { Container } from 'components/Container/Container';
import styled from 'styled-components';

export const Section = styled.section`
  padding-bottom: 80px;
  width: 428px;
  display: flex;
  flex-direction: column;
  margin: 0 auto;

  @media screen and (min-width: 768px) {
    width: 768px;
  }
  @media screen and (min-width: 1280px) {
    padding-bottom: 160px;
    width: 1440px;
    margin: 0 auto;
    flex-direction: row;
  }
`;

export const PictureContainer = styled(Container)`
  padding: 0;

  @media screen and (min-width: 1280px) {
    display: flex;
  }
`;

export const ImageWrap = styled.div`
  @media screen and (min-width: 1280px) {
    width: 730px;
  }
`;

export const Picture = styled.picture``;

export const WrapText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  @media screen and (min-width: 1280px) {
    width: 710px;
    padding: 0;
  }

  background-color: ${({ theme }) => theme.color.lightBGColor};
`;

export const Title = styled.h2`
  @media screen and (max-width: 427.5px) {
    font-size: 8vw;
  }
  font-family: 'Cormorant SC';
  text-transform: uppercase;
  font-size: 32px;
  font-weight: 500;
  text-align: center;
  line-height: 1.25;

  margin-bottom: 32px;
  @media screen and (min-width: 1280px) {
    font-size: 48px;

    line-height: 1.17;
    margin-bottom: 48px;
  }
  color: ${({ theme }) => theme.color.mainColor5};
`;

export const Image = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;
