import { Container } from 'components/Container/Container';
import styled from 'styled-components';

export const Section = styled.section`
  /* width: 428px; */
  box-sizing: border-box;
  margin: 0 auto;
  padding-bottom: 40px;

  padding-top: ${({ $mainPage }) => ($mainPage ? '0' : '16px')};
  @media screen and (min-width: 1280px) {
    width: 1440px;
    /* margin: 0 auto; */
  }
`;

export const Title = styled.h2`
  @media screen and (max-width: 427.5px) {
    font-size: 8vw;
  }
  text-align: center;
  font-family: 'Cormorant SC';
  font-size: 32px;
  font-weight: 500;
  line-height: 1.25;
  margin-bottom: 16px;
  text-transform: uppercase;

  color: ${({ theme }) => theme.color.mainColor4};
`;

export const PictureContainer = styled(Container)`
  width: 100vw;
  padding: 0;
  @media screen and (min-width: 1280px) {
    width: 1440px;
  }
`;
export const Picture = styled.picture`
  display: block;
  width: 100vw;
  margin-bottom: 40px;
  @media screen and (min-width: 1280px) {
    width: 1440px;
  }
`;

export const Image = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const Description = styled.p`
  font-family: 'Open Sans Hebrew', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;

  color: ${({ theme }) => theme.color.mainColor5};
`;

export const Wrap = styled.div`
  padding: 24px 0;
  @media screen and (min-width: 768px) {
    border-left: 1px solid #c6a58d;
    padding: 24px;
  }
  @media screen and (min-width: 1280px) {
  }
`;
